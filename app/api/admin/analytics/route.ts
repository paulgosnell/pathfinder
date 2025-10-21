import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create server-side client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const supabase = getSupabaseAdmin();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log('[Analytics API] Fetching analytics for last', days, 'days, starting from:', startDate.toISOString());

    // Total visits
    const { count: totalVisits, error: totalVisitsError } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', startDate.toISOString());

    if (totalVisitsError) {
      console.error('[Analytics API] Error fetching total visits:', totalVisitsError);
      throw totalVisitsError;
    }

    // Unique visitors
    const { data: uniqueVisitorsData } = await supabase
      .from('page_visits')
      .select('visitor_id')
      .gte('visited_at', startDate.toISOString());

    const uniqueVisitors = new Set(uniqueVisitorsData?.map((v: any) => v.visitor_id) || []).size;

    // Page views
    const { count: pageViews } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', startDate.toISOString());

    // Sessions
    const { count: totalSessions } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('first_visit_at', startDate.toISOString());

    // Conversions
    const { count: signups } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('signed_up', true)
      .gte('first_visit_at', startDate.toISOString());

    const { count: chatStarts } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('started_chat', true)
      .gte('first_visit_at', startDate.toISOString());

    const { count: voiceStarts } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('started_voice', true)
      .gte('first_visit_at', startDate.toISOString());

    // LLM traffic
    const { count: llmTraffic } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .eq('is_llm_traffic', true)
      .gte('visited_at', startDate.toISOString());

    // Average session duration
    const { data: sessionData } = await supabase
      .from('analytics_sessions')
      .select('session_duration_seconds')
      .gte('first_visit_at', startDate.toISOString());

    const avgSessionDuration = sessionData && sessionData.length > 0
      ? Math.round(sessionData.reduce((sum: any, s: any) => sum + s.session_duration_seconds, 0) / sessionData.length)
      : 0;

    // Bounce rate
    const { count: bounceSessions } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('pages_viewed', 1)
      .gte('first_visit_at', startDate.toISOString());

    const bounceRate = totalSessions && totalSessions > 0
      ? Math.round((bounceSessions || 0) / totalSessions * 100)
      : 0;

    // Real-time visitors (last 5 minutes)
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    const { data: realtimeData } = await supabase
      .from('analytics_sessions')
      .select('*')
      .gte('last_activity_at', fiveMinutesAgo.toISOString());

    const result = {
      overview: {
        totalVisits: totalVisits || 0,
        uniqueVisitors,
        pageViews: pageViews || 0,
        totalSessions: totalSessions || 0,
        avgSessionDuration,
        bounceRate,
        conversions: {
          signups: signups || 0,
          chatStarts: chatStarts || 0,
          voiceStarts: voiceStarts || 0,
        },
        llmTraffic: llmTraffic || 0,
        pagesPerSession: totalSessions && totalSessions > 0
          ? ((pageViews || 0) / totalSessions).toFixed(2)
          : '0.00',
      },
      realTimeVisitors: realtimeData?.length || 0
    };

    console.log('[Analytics API] Success, returning:', JSON.stringify(result, null, 2));
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Analytics API] Fatal error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
