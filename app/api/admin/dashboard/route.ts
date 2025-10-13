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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Get executive metrics
    const { data: sessions } = await supabase.from('agent_sessions').select('id, mode, crisis_level, started_at, ended_at, current_phase, reality_exploration_depth, emotions_reflected, exceptions_explored, parent_generated_ideas, strengths_identified');
    const { data: users } = await supabase.from('users').select('id, created_at');
    const { data: conversations } = await supabase.from('agent_conversations').select('id');
    const { data: performance } = await supabase.from('agent_performance').select('total_cost, total_tokens, response_time_ms, crisis_detected, created_at');
    const { data: waitlist } = await supabase.from('waitlist_signups').select('*').order('signup_date', { ascending: false });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPerformance = performance?.filter(p => new Date(p.created_at) >= today) || [];

    const totalCost = performance?.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0) || 0;
    const avgResponseTime = performance?.length ? performance.reduce((sum, p) => sum + p.response_time_ms, 0) / performance.length : 0;
    const crisisCount = performance?.filter(p => p.crisis_detected).length || 0;
    const activeSessions = sessions?.filter(s => !s.ended_at).length || 0;
    const chatSessions = sessions?.filter(s => s.mode === 'chat').length || 0;
    const voiceSessions = sessions?.filter(s => s.mode === 'voice').length || 0;

    // Get active sessions with details
    const { data: activeSessionsData } = await supabase
      .from('agent_sessions')
      .select('*, conversations:agent_conversations(id, created_at)')
      .is('ended_at', null)
      .order('started_at', { ascending: false });

    const activeSessionsFormatted = activeSessionsData?.map(session => ({
      ...session,
      messageCount: session.conversations?.length || 0,
      duration: session.started_at ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000 / 60) : 0,
      lastActivity: session.conversations?.length
        ? session.conversations[session.conversations.length - 1].created_at
        : session.started_at
    })) || [];

    // Get all sessions with message counts and coaching state
    const { data: allSessions } = await supabase
      .from('agent_sessions')
      .select('id, mode, crisis_level, started_at, ended_at, current_phase, reality_exploration_depth, emotions_reflected, exceptions_explored, parent_generated_ideas, strengths_identified, conversations:agent_conversations(id)')
      .order('started_at', { ascending: false });

    const allSessionsFormatted = allSessions?.map(session => ({
      ...session,
      messageCount: session.conversations?.length || 0
    })) || [];

    // Get session quality metrics
    const total = sessions?.length || 1;
    const reachedOptions = sessions?.filter(s => ['options', 'will', 'closing'].includes(s.current_phase || '')).length || 0;
    const avgDepth = (sessions?.reduce((sum, s) => sum + (s.reality_exploration_depth || 0), 0) || 0) / total || 0;
    const emotionsReflected = sessions?.filter(s => s.emotions_reflected).length || 0;
    const exceptionsExplored = sessions?.filter(s => s.exceptions_explored).length || 0;
    const avgIdeas = (sessions?.reduce((sum, s) => sum + (s.parent_generated_ideas?.length || 0), 0) || 0) / total || 0;
    const avgStrengths = (sessions?.reduce((sum, s) => sum + (s.strengths_identified?.length || 0), 0) || 0) / total || 0;

    // Get 7-day trends
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPerformance = performance?.filter(p => new Date(p.created_at) >= sevenDaysAgo) || [];

    const dayMap = new Map();
    recentPerformance.forEach(record => {
      const day = new Date(record.created_at).toISOString().split('T')[0];
      if (!dayMap.has(day)) {
        dayMap.set(day, { date: day, apiCalls: 0, totalTokens: 0, totalCost: 0, responseTimes: [], crisisCount: 0 });
      }
      const dayData = dayMap.get(day);
      dayData.apiCalls++;
      dayData.totalTokens += record.total_tokens;
      dayData.totalCost += Number(record.total_cost) || 0;
      dayData.responseTimes.push(record.response_time_ms);
      if (record.crisis_detected) dayData.crisisCount++;
    });

    const trends = Array.from(dayMap.values()).map(day => ({
      date: day.date,
      apiCalls: day.apiCalls,
      totalTokens: day.totalTokens,
      totalCost: day.totalCost.toFixed(4),
      avgResponseTime: Math.round(day.responseTimes.reduce((a: number, b: number) => a + b, 0) / day.responseTimes.length),
      crisisCount: day.crisisCount
    }));

    // Get all users with session counts
    const { data: allUsers } = await supabase
      .from('users')
      .select('*, sessions:agent_sessions(id, started_at), performance:agent_performance(total_cost)')
      .order('created_at', { ascending: false });

    const usersFormatted = allUsers?.map(user => ({
      ...user,
      sessionCount: user.sessions?.length || 0,
      totalCost: user.performance?.reduce((sum: number, p: any) => sum + (Number(p.total_cost) || 0), 0) || 0,
      lastActive: user.sessions?.[0]?.started_at
    })) || [];

    return NextResponse.json({
      executiveMetrics: {
        activeSessions,
        totalUsers: users?.length || 0,
        totalConversations: conversations?.length || 0,
        totalCost: totalCost.toFixed(4),
        crisisAlerts: crisisCount,
        avgResponseTime: Math.round(avgResponseTime),
        chatSessionsPercent: sessions?.length ? Math.round((chatSessions / sessions.length) * 100) : 0,
        voiceSessionsPercent: sessions?.length ? Math.round((voiceSessions / sessions.length) * 100) : 0,
        todayStats: {
          sessions: todayPerformance.length,
          tokens: todayPerformance.reduce((sum, p) => sum + p.total_tokens, 0),
          cost: todayPerformance.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0).toFixed(4),
          avgResponseTime: todayPerformance.length
            ? Math.round(todayPerformance.reduce((sum, p) => sum + p.response_time_ms, 0) / todayPerformance.length)
            : 0
        }
      },
      activeSessions: activeSessionsFormatted,
      qualityMetrics: {
        totalSessions: total,
        reachedOptionsPercent: Math.round((reachedOptions / total) * 100),
        avgRealityDepth: avgDepth.toFixed(1),
        emotionsReflectedPercent: Math.round((emotionsReflected / total) * 100),
        exceptionsExploredPercent: Math.round((exceptionsExplored / total) * 100),
        avgParentIdeas: avgIdeas.toFixed(1),
        avgStrengthsIdentified: avgStrengths.toFixed(1)
      },
      trends,
      users: usersFormatted,
      waitlist: waitlist || [],
      allSessions: allSessionsFormatted
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
