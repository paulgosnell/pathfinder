import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for analytics (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Classify referrer type based on URL
 */
function classifyReferrerType(referrer: string | null): string {
  if (!referrer) return 'direct';

  const lower = referrer.toLowerCase();

  if (
    lower.includes('google') ||
    lower.includes('bing') ||
    lower.includes('duckduckgo') ||
    lower.includes('yahoo')
  ) {
    return 'search';
  }

  if (
    lower.includes('facebook') ||
    lower.includes('twitter') ||
    lower.includes('linkedin') ||
    lower.includes('instagram')
  ) {
    return 'social';
  }

  if (
    lower.includes('chatgpt') ||
    lower.includes('claude') ||
    lower.includes('perplexity')
  ) {
    return 'llm';
  }

  return 'referral';
}

/**
 * Detect LLM traffic from user agent
 */
function detectLLM(userAgent: string): { isLLM: boolean; source: string | null } {
  const ua = userAgent.toLowerCase();

  if (ua.includes('chatgpt') || ua.includes('gptbot')) {
    return { isLLM: true, source: 'chatgpt' };
  }

  if (ua.includes('claude') || ua.includes('anthropic')) {
    return { isLLM: true, source: 'claude' };
  }

  if (ua.includes('perplexity')) {
    return { isLLM: true, source: 'perplexity' };
  }

  if (ua.includes('gemini') || ua.includes('bard')) {
    return { isLLM: true, source: 'gemini' };
  }

  if (ua.includes('bot') || ua.includes('crawler')) {
    return { isLLM: true, source: 'other_bot' };
  }

  return { isLLM: false, source: null };
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string | null): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      path,
      pageTitle,
      referrerUrl,
      searchEngine,
      searchQuery,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      userAgent,
      browser,
      browserVersion,
      os,
      osVersion,
      deviceType,
      isMobile,
      pageLoadTimeMs,
      timeOnPageSeconds,
      scrollDepthPercent,
      clicksCount,
      sessionId,
      visitorId,
    } = data;

    // Classify referrer
    const referrerType = classifyReferrerType(referrerUrl);
    const referrerDomain = extractDomain(referrerUrl);

    // Detect LLM traffic
    const { isLLM, source: llmSource } = detectLLM(userAgent);

    // Get user ID if authenticated
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    // Insert page visit
    const { error: visitError } = await supabase
      .from('page_visits')
      .insert({
        path,
        page_title: pageTitle,
        user_id: userId,
        session_id: sessionId,
        visitor_id: visitorId,
        referrer_url: referrerUrl,
        referrer_domain: referrerDomain,
        referrer_type: referrerType,
        search_engine: searchEngine,
        search_query: searchQuery,
        is_llm_traffic: isLLM,
        llm_source: llmSource,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_term: utmTerm,
        utm_content: utmContent,
        user_agent: userAgent,
        browser,
        browser_version: browserVersion,
        os,
        os_version: osVersion,
        device_type: deviceType,
        is_mobile: isMobile,
        time_on_page_seconds: timeOnPageSeconds || 0,
        scroll_depth_percent: scrollDepthPercent || 0,
        clicks_count: clicksCount || 0,
        page_load_time_ms: pageLoadTimeMs,
      });

    if (visitError) {
      console.error('Error inserting page visit:', visitError);
    }

    // Upsert analytics session
    const { data: existingSession } = await supabase
      .from('analytics_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (existingSession) {
      // Update existing session
      await supabase
        .from('analytics_sessions')
        .update({
          last_activity_at: new Date().toISOString(),
          session_duration_seconds: existingSession.session_duration_seconds + (timeOnPageSeconds || 0),
          pages_viewed: existingSession.pages_viewed + 1,
          total_clicks: existingSession.total_clicks + (clicksCount || 0),
          total_scroll_depth: Math.max(existingSession.total_scroll_depth, scrollDepthPercent || 0),
          exit_page: path,
        })
        .eq('id', sessionId);
    } else {
      // Create new session
      await supabase
        .from('analytics_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          visitor_id: visitorId,
          first_visit_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          landing_page: path,
          landing_referrer: referrerUrl,
          landing_referrer_type: referrerType,
          device_type: deviceType,
          is_mobile: isMobile,
          source: utmSource || referrerDomain || 'direct',
          medium: utmMedium || referrerType,
          campaign: utmCampaign,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}
