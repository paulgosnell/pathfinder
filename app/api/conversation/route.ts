import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return Response.json({ message: 'Session ID required' }, { status: 400 });
  }

  // First verify the session belongs to this user
  const { data: session, error: sessionError } = await supabase
    .from('agent_sessions')
    .select('id, user_id, mode, time_budget_minutes, current_phase')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return Response.json({ message: 'Session not found' }, { status: 404 });
  }

  // Fetch conversation history for this session
  const { data: conversations, error: convError } = await supabase
    .from('agent_conversations')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (convError) {
    console.error('Conversation fetch error', convError);
    return Response.json({ message: 'Failed to load conversation' }, { status: 500 });
  }

  return Response.json({
    session: {
      id: session.id,
      mode: session.mode,
      timeBudgetMinutes: session.time_budget_minutes,
      currentPhase: session.current_phase
    },
    messages: (conversations || []).map(c => ({
      role: c.role,
      content: c.content
    }))
  });
}

// Get most recent active session for user
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Find most recent session that hasn't ended
  const { data: session, error: sessionError } = await supabase
    .from('agent_sessions')
    .select('id, mode, time_budget_minutes, current_phase')
    .eq('user_id', user.id)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    console.error('Session fetch error', sessionError);
    return Response.json({ message: 'Failed to fetch session' }, { status: 500 });
  }

  // No active session found
  if (!session) {
    return Response.json({ session: null, messages: [] });
  }

  // Fetch conversation history for this session
  const { data: conversations, error: convError } = await supabase
    .from('agent_conversations')
    .select('role, content, created_at')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true });

  if (convError) {
    console.error('Conversation fetch error', convError);
    return Response.json({ message: 'Failed to load conversation' }, { status: 500 });
  }

  return Response.json({
    session: {
      id: session.id,
      mode: session.mode,
      timeBudgetMinutes: session.time_budget_minutes,
      currentPhase: session.current_phase
    },
    messages: (conversations || []).map(c => ({
      role: c.role,
      content: c.content
    }))
  });
}
