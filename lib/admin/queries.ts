import { createBrowserClient } from '@supabase/ssr';

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getExecutiveMetrics() {
  const supabase = getSupabaseClient();
  const { data: sessions } = await supabase.from('agent_sessions').select('id, mode, crisis_level, started_at, ended_at');
  const { data: users } = await supabase.from('users').select('id, created_at');
  const { data: conversations } = await supabase.from('agent_conversations').select('id');
  const { data: performance } = await supabase.from('agent_performance').select('total_cost, total_tokens, response_time_ms, crisis_detected');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const { data: todayPerformance } = await supabase.from('agent_performance').select('*').gte('created_at', today.toISOString());
  const totalCost = performance?.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0) || 0;
  const avgResponseTime = performance?.length ? performance.reduce((sum, p) => sum + p.response_time_ms, 0) / performance.length : 0;
  const crisisCount = performance?.filter(p => p.crisis_detected).length || 0;
  const activeSessions = sessions?.filter(s => !s.ended_at).length || 0;
  const chatSessions = sessions?.filter(s => s.mode === 'chat').length || 0;
  const voiceSessions = sessions?.filter(s => s.mode === 'voice').length || 0;
  return {
    activeSessions, totalUsers: users?.length || 0, totalConversations: conversations?.length || 0,
    totalCost: totalCost.toFixed(4), crisisAlerts: crisisCount, avgResponseTime: Math.round(avgResponseTime),
    chatSessionsPercent: sessions?.length ? Math.round((chatSessions / sessions.length) * 100) : 0,
    voiceSessionsPercent: sessions?.length ? Math.round((voiceSessions / sessions.length) * 100) : 0,
    todayStats: { sessions: todayPerformance?.length || 0, tokens: todayPerformance?.reduce((sum, p) => sum + p.total_tokens, 0) || 0,
      cost: todayPerformance?.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0).toFixed(4) || '0.0000',
      avgResponseTime: todayPerformance?.length ? Math.round(todayPerformance.reduce((sum, p) => sum + p.response_time_ms, 0) / todayPerformance.length) : 0 }
  };
}

export async function getActiveSessions() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from('agent_sessions').select('*, user:users!agent_sessions_user_id_fkey(id), conversations:agent_conversations(id, created_at)').is('ended_at', null).order('started_at', { ascending: false });
  return data?.map(session => ({ ...session, messageCount: session.conversations?.length || 0, duration: session.started_at ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000 / 60) : 0, lastActivity: session.conversations?.length ? session.conversations[session.conversations.length - 1].created_at : session.started_at })) || [];
}

export async function getSessionDetails(sessionId: string) {
  const supabase = getSupabaseClient();
  const { data: session } = await supabase.from('agent_sessions').select('*, user:users!agent_sessions_user_id_fkey(id), user_profile:user_profiles!user_profiles_user_id_fkey(*)').eq('id', sessionId).single();
  const { data: conversations } = await supabase.from('agent_conversations').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
  const { data: performance } = await supabase.from('agent_performance').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
  return { session, conversations: conversations || [], performance: performance || [] };
}

export async function getSessions(filters?: any) {
  const supabase = getSupabaseClient();
  let query = supabase.from('agent_sessions').select('*, user:users!agent_sessions_user_id_fkey(id), conversations:agent_conversations(id)').order('started_at', { ascending: false });
  if (filters?.startDate) query = query.gte('started_at', filters.startDate.toISOString());
  if (filters?.endDate) query = query.lte('started_at', filters.endDate.toISOString());
  if (filters?.mode) query = query.eq('mode', filters.mode);
  if (filters?.phase) query = query.eq('current_phase', filters.phase);
  if (filters?.crisisLevel) query = query.eq('crisis_level', filters.crisisLevel);
  if (filters?.userId) query = query.eq('user_id', filters.userId);
  const { data } = await query;
  return data?.map(session => ({ ...session, messageCount: session.conversations?.length || 0 })) || [];
}

export async function getSessionQualityMetrics() {
  const supabase = getSupabaseClient();
  const { data: sessions } = await supabase.from('agent_sessions').select('*');
  if (!sessions) return null;
  const total = sessions.length;
  const reachedOptions = sessions.filter(s => ['options', 'will', 'closing'].includes(s.current_phase || '')).length;
  const avgDepth = sessions.reduce((sum, s) => sum + (s.reality_exploration_depth || 0), 0) / total;
  const emotionsReflected = sessions.filter(s => s.emotions_reflected).length;
  const exceptionsExplored = sessions.filter(s => s.exceptions_explored).length;
  const avgIdeas = sessions.reduce((sum, s) => sum + (s.parent_generated_ideas?.length || 0), 0) / total;
  const avgStrengths = sessions.reduce((sum, s) => sum + (s.strengths_identified?.length || 0), 0) / total;
  return { totalSessions: total, reachedOptionsPercent: Math.round((reachedOptions / total) * 100), avgRealityDepth: avgDepth.toFixed(1), emotionsReflectedPercent: Math.round((emotionsReflected / total) * 100), exceptionsExploredPercent: Math.round((exceptionsExplored / total) * 100), avgParentIdeas: avgIdeas.toFixed(1), avgStrengthsIdentified: avgStrengths.toFixed(1) };
}

export async function getAllUsers() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from('users').select('*, profile:user_profiles(*), sessions:agent_sessions(id, started_at), performance:agent_performance(total_cost)').order('created_at', { ascending: false });
  return data?.map(user => ({ ...user, sessionCount: user.sessions?.length || 0, totalCost: user.performance?.reduce((sum: number, p: any) => sum + (Number(p.total_cost) || 0), 0) || 0, lastActive: user.sessions?.[0]?.started_at })) || [];
}

export async function getWaitlistSignups() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from('waitlist_signups').select('*').order('signup_date', { ascending: false });
  return data || [];
}

export async function getSevenDayTrends() {
  const supabase = getSupabaseClient();
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data } = await supabase.from('agent_performance').select('*').gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: true });
  const dayMap = new Map();
  data?.forEach(record => {
    const day = new Date(record.created_at).toISOString().split('T')[0];
    if (!dayMap.has(day)) dayMap.set(day, { date: day, apiCalls: 0, totalTokens: 0, totalCost: 0, responseTimes: [], crisisCount: 0 });
    const dayData = dayMap.get(day);
    dayData.apiCalls++; dayData.totalTokens += record.total_tokens; dayData.totalCost += Number(record.total_cost) || 0; dayData.responseTimes.push(record.response_time_ms);
    if (record.crisis_detected) dayData.crisisCount++;
  });
  return Array.from(dayMap.values()).map(day => ({ date: day.date, apiCalls: day.apiCalls, totalTokens: day.totalTokens, totalCost: day.totalCost.toFixed(4), avgResponseTime: Math.round(day.responseTimes.reduce((a: number, b: number) => a + b, 0) / day.responseTimes.length), crisisCount: day.crisisCount }));
}
