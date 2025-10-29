import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server-client';

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

    // SECURITY: Verify the authenticated user matches the userId in request
    const supabase = await createServerClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (authUser.id !== userId) {
      return NextResponse.json(
        { error: 'User ID mismatch - cannot save transcript for another user' },
        { status: 403 }
      );
    }

    // Ensure user record exists (should already exist from auth, but create if needed)
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

    // CRITICAL FIX: Check if this is a discovery session that just completed
    // (Same logic as chat mode - check database for discovery_completed=true)
    const { data: sessionData } = await supabaseAdmin
      .from('agent_sessions')
      .select('session_type, status')
      .eq('id', sessionId)
      .single();

    let discoveryCompleted = false;

    if (sessionData?.session_type === 'discovery' && sessionData?.status !== 'complete') {
      // Check if discovery was actually completed in database
      const { data: profileCheck } = await supabaseAdmin
        .from('user_profiles')
        .select('discovery_completed, discovery_completed_at')
        .eq('user_id', userId)
        .single();

      if (profileCheck?.discovery_completed === true) {
        console.log(`🎤 [Voice] Discovery completed for user ${userId} - closing session ${sessionId}`);

        // Mark session as complete
        await supabaseAdmin
          .from('agent_sessions')
          .update({ status: 'complete', ended_at: new Date().toISOString() })
          .eq('id', sessionId);

        discoveryCompleted = true;
      }
    }

    return NextResponse.json({
      success: true,
      discoveryCompleted // Tell frontend if discovery just finished
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
