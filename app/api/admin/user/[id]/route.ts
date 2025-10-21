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
    const { id: userId } = await params;
    const supabase = getSupabaseAdmin();

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User query error:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Profile may not exist, that's okay
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile query error:', profileError);
    }

    // Get sessions with conversation counts
    const { data: sessions, error: sessionsError } = await supabase
      .from('agent_sessions')
      .select(`
        *,
        conversations:agent_conversations(id)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (sessionsError) {
      console.error('Sessions query error:', sessionsError);
    }

    // Format sessions with message counts
    const formattedSessions = sessions?.map(session => ({
      ...session,
      messageCount: session.conversations?.length || 0
    })) || [];

    // Get performance metrics
    const { data: performance, error: performanceError } = await supabase
      .from('agent_performance')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (performanceError) {
      console.error('Performance query error:', performanceError);
    }

    // Calculate totals
    const totalCost = performance?.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0) || 0;
    const totalTokens = performance?.reduce((sum, p) => sum + p.total_tokens, 0) || 0;
    const avgResponseTime = performance?.length
      ? Math.round(performance.reduce((sum, p) => sum + p.response_time_ms, 0) / performance.length)
      : 0;

    return NextResponse.json({
      user,
      profile: profile || null,
      sessions: formattedSessions,
      performance: performance || [],
      metrics: {
        totalCost,
        totalTokens,
        avgResponseTime,
        totalSessions: sessions?.length || 0
      }
    });
  } catch (error) {
    console.error('User details API error:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}
