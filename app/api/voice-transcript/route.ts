import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Use service role key for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
        });

      if (userError) {
        console.error('Failed to create user:', userError);
        return NextResponse.json(
          { error: 'Failed to create user', details: userError.message },
          { status: 500 }
        );
      }
    }

    // Ensure session exists with mode='voice'
    const { data: existingSession } = await supabaseAdmin
      .from('agent_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (!existingSession) {
      // Create new voice session
      const { error: sessionError } = await supabaseAdmin
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
        console.error('Failed to create session:', sessionError);
        return NextResponse.json(
          { error: 'Failed to create session', details: sessionError.message },
          { status: 500 }
        );
      }
    }

    // Save message to agent_conversations table
    const { error: messageError } = await supabaseAdmin
      .from('agent_conversations')
      .insert({
        session_id: sessionId,
        role,
        content,
      });

    if (messageError) {
      console.error('Failed to save transcript:', messageError);
      return NextResponse.json(
        { error: 'Failed to save transcript', details: messageError.message },
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
