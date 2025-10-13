/**
 * Analytics Queries
 * Server-side functions for fetching analytics data
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get top-line analytics metrics
 */
export async function getAnalyticsOverview(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Total visits
    const { count: totalVisits } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', startDate.toISOString());

    // Unique visitors
    const { data: uniqueVisitorsData } = await supabase
      .from('page_visits')
      .select('visitor_id')
      .gte('visited_at', startDate.toISOString());

    const uniqueVisitors = new Set(uniqueVisitorsData?.map(v => v.visitor_id) || []).size;

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
      ? Math.round(sessionData.reduce((sum, s) => sum + s.session_duration_seconds, 0) / sessionData.length)
      : 0;

    // Bounce rate (sessions with only 1 page view)
    const { count: bounceSessions } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('pages_viewed', 1)
      .gte('first_visit_at', startDate.toISOString());

    const bounceRate = totalSessions && totalSessions > 0
      ? Math.round((bounceSessions || 0) / totalSessions * 100)
      : 0;

    return {
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
    };
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    throw error;
  }
}

/**
 * Get traffic sources breakdown
 */
export async function getTrafficSources(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('referrer_type')
      .gte('visited_at', startDate.toISOString());

    const sources: Record<string, number> = {
      direct: 0,
      search: 0,
      social: 0,
      referral: 0,
      llm: 0,
    };

    data?.forEach(visit => {
      const type = visit.referrer_type || 'direct';
      sources[type] = (sources[type] || 0) + 1;
    });

    return sources;
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    throw error;
  }
}

/**
 * Get top referrers
 */
export async function getTopReferrers(days: number = 7, limit: number = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('referrer_domain')
      .gte('visited_at', startDate.toISOString())
      .not('referrer_domain', 'is', null);

    // Count occurrences
    const counts: Record<string, number> = {};
    data?.forEach(visit => {
      const domain = visit.referrer_domain;
      if (domain) {
        counts[domain] = (counts[domain] || 0) + 1;
      }
    });

    // Convert to array and sort
    return Object.entries(counts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top referrers:', error);
    throw error;
  }
}

/**
 * Get top search queries
 */
export async function getTopSearchQueries(days: number = 7, limit: number = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('search_query')
      .gte('visited_at', startDate.toISOString())
      .not('search_query', 'is', null);

    // Count occurrences
    const counts: Record<string, number> = {};
    data?.forEach(visit => {
      const query = visit.search_query;
      if (query) {
        counts[query] = (counts[query] || 0) + 1;
      }
    });

    // Convert to array and sort
    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top search queries:', error);
    throw error;
  }
}

/**
 * Get top pages
 */
export async function getTopPages(days: number = 7, limit: number = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('path, page_title')
      .gte('visited_at', startDate.toISOString());

    // Count occurrences
    const counts: Record<string, { count: number; title: string }> = {};
    data?.forEach(visit => {
      const path = visit.path;
      if (!counts[path]) {
        counts[path] = { count: 0, title: visit.page_title || path };
      }
      counts[path].count++;
    });

    // Convert to array and sort
    return Object.entries(counts)
      .map(([path, { count, title }]) => ({ path, title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top pages:', error);
    throw error;
  }
}

/**
 * Get LLM traffic breakdown
 */
export async function getLLMTrafficBreakdown(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('llm_source')
      .eq('is_llm_traffic', true)
      .gte('visited_at', startDate.toISOString());

    const breakdown: Record<string, number> = {
      chatgpt: 0,
      claude: 0,
      perplexity: 0,
      gemini: 0,
      other_bot: 0,
    };

    data?.forEach(visit => {
      const source = visit.llm_source;
      if (source && breakdown.hasOwnProperty(source)) {
        breakdown[source]++;
      }
    });

    return breakdown;
  } catch (error) {
    console.error('Error fetching LLM traffic breakdown:', error);
    throw error;
  }
}

/**
 * Get device breakdown
 */
export async function getDeviceBreakdown(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('device_type')
      .gte('visited_at', startDate.toISOString());

    const breakdown: Record<string, number> = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    data?.forEach(visit => {
      const type = visit.device_type || 'desktop';
      breakdown[type] = (breakdown[type] || 0) + 1;
    });

    return breakdown;
  } catch (error) {
    console.error('Error fetching device breakdown:', error);
    throw error;
  }
}

/**
 * Get browser breakdown
 */
export async function getBrowserBreakdown(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('browser')
      .gte('visited_at', startDate.toISOString());

    const counts: Record<string, number> = {};
    data?.forEach(visit => {
      const browser = visit.browser || 'Unknown';
      counts[browser] = (counts[browser] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching browser breakdown:', error);
    throw error;
  }
}

/**
 * Get daily trends (for charts)
 */
export async function getDailyTrends(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data } = await supabase
      .from('page_visits')
      .select('visited_at')
      .gte('visited_at', startDate.toISOString())
      .order('visited_at', { ascending: true });

    // Group by date
    const trendsByDate: Record<string, number> = {};
    data?.forEach(visit => {
      const date = new Date(visit.visited_at).toISOString().split('T')[0];
      trendsByDate[date] = (trendsByDate[date] || 0) + 1;
    });

    // Fill in missing dates with 0
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];
      trends.push({
        date: dateStr,
        visits: trendsByDate[dateStr] || 0,
      });
    }

    return trends;
  } catch (error) {
    console.error('Error fetching daily trends:', error);
    throw error;
  }
}

/**
 * Get real-time visitors (last 5 minutes)
 */
export async function getRealTimeVisitors() {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  try {
    const { data } = await supabase
      .from('analytics_sessions')
      .select('*')
      .gte('last_activity_at', fiveMinutesAgo.toISOString());

    return data?.length || 0;
  } catch (error) {
    console.error('Error fetching real-time visitors:', error);
    throw error;
  }
}
