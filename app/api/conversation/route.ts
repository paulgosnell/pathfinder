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
    .select('id, user_id, mode, time_budget_minutes, current_phase, session_type')
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

  // Get last message timestamp for continuation prompt
  const lastMessageTime = conversations && conversations.length > 0
    ? conversations[conversations.length - 1].created_at
    : null;

  return Response.json({
    session: {
      id: session.id,
      mode: session.mode,
      timeBudgetMinutes: session.time_budget_minutes,
      currentPhase: session.current_phase,
      sessionType: session.session_type,
      lastMessageAt: lastMessageTime
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

  // Parse request body to check for excludeCompletedCoaching flag
  let excludeCompletedCoaching = false;
  try {
    const body = await req.json();
    excludeCompletedCoaching = body.excludeCompletedCoaching || false;
  } catch {
    // No body or invalid JSON - proceed with default
  }

  // Find most recent session that hasn't ended
  // Exclude completed coaching/discovery sessions from default app launch
  let query = supabase
    .from('agent_sessions')
    .select('id, mode, time_budget_minutes, current_phase, session_type, status')
    .eq('user_id', user.id)
    .is('ended_at', null)
    .order('started_at', { ascending: false });

  // If excludeCompletedCoaching, filter out completed coaching/discovery sessions
  if (excludeCompletedCoaching) {
    // Get all active sessions, then filter in code to handle complex OR logic
    query = query.limit(10); // Get last 10 sessions to check
  } else {
    query = query.limit(1);
  }

  const { data: sessions, error: sessionError } = await query;

  if (sessionError) {
    console.error('Session fetch error', sessionError);
    return Response.json({ message: 'Failed to fetch session' }, { status: 500 });
  }

  // Filter sessions if excludeCompletedCoaching is enabled
  let session = null;
  if (excludeCompletedCoaching && sessions && sessions.length > 0) {
    // Find first session that is NOT a completed coaching or discovery session
    session = sessions.find(s => {
      const isCoachingOrDiscovery = s.session_type === 'coaching' || s.session_type === 'discovery';
      const isComplete = s.status === 'complete';
      return !(isCoachingOrDiscovery && isComplete);
    }) || null;
  } else if (sessions && sessions.length > 0) {
    session = sessions[0];
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

  // Get last message timestamp for continuation prompt
  const lastMessageTime = conversations && conversations.length > 0
    ? conversations[conversations.length - 1].created_at
    : null;

  return Response.json({
    session: {
      id: session.id,
      mode: session.mode,
      timeBudgetMinutes: session.time_budget_minutes,
      currentPhase: session.current_phase,
      sessionType: session.session_type,
      status: session.status,
      lastMessageAt: lastMessageTime
    },
    messages: (conversations || []).map(c => ({
      role: c.role,
      content: c.content
    }))
  });
}
