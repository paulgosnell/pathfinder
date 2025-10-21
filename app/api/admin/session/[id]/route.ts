import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create server-side client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = getSupabaseAdmin();

    // Get session data with user join
    const { data: session, error: sessionError } = await supabase
      .from('agent_sessions')
      .select('*, user:users!agent_sessions_user_id_fkey(id, created_at, consent_given)')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Session query error:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get user profile separately using user_id from session
    let userProfile = null;
    if (session?.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user_id)
        .single();

      if (!profileError && profile) {
        userProfile = profile;
      }
    }

    // Get conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (conversationsError) {
      console.error('Conversations query error:', conversationsError);
    }

    // Get performance data
    const { data: performance, error: performanceError } = await supabase
      .from('agent_performance')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (performanceError) {
      console.error('Performance query error:', performanceError);
    }

    return NextResponse.json({
      session: { ...session, user_profile: userProfile },
      conversations: conversations || [],
      performance: performance || []
    });
  } catch (error) {
    console.error('Session details API error:', error);
    return NextResponse.json({ error: 'Failed to fetch session details' }, { status: 500 });
  }
}
