import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'edge';

interface TranscriptMessage {
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * API endpoint for saving voice conversation transcripts
 * Called by ElevenLabs voice component when messages are exchanged
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TranscriptMessage;
    const { sessionId, userId, role, content } = body;

    // Validate required fields
    if (!sessionId || !userId || !role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, userId, role, content' },
        { status: 400 }
      );
    }

    // Ensure user exists (create if needed)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
        });

      if (userError) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }

    // Ensure session exists with mode='voice'
    const { data: existingSession } = await supabase
      .from('agent_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (!existingSession) {
      // Create new voice session
      const { error: sessionError } = await supabase
        .from('agent_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          mode: 'voice',
          crisis_level: 'none',
          strategies_discussed: [],
          started_at: new Date().toISOString(),
        });

      if (sessionError) {
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }
    }

    // Save message to agent_conversations table
    const { error: messageError } = await supabase
      .from('agent_conversations')
      .insert({
        session_id: sessionId,
        role,
        content,
      });

    if (messageError) {
      return NextResponse.json(
        { error: 'Failed to save transcript' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
