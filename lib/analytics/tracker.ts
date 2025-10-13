/**
 * Analytics Tracker
 * Client-side analytics tracking library for page visits, engagement, and conversions
 */

import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  path: string;
  pageTitle: string;
  referrerUrl: string | null;
  referrerDomain: string | null;
  searchEngine: string | null;
  searchQuery: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  isMobile: boolean;
  pageLoadTimeMs: number | null;
  sessionId: string;
  visitorId: string;
}

export interface EngagementData {
  timeOnPageSeconds: number;
  scrollDepthPercent: number;
  clicksCount: number;
}

/**
 * Generate or retrieve persistent visitor ID
 */
export function getVisitorId(): string {
  const STORAGE_KEY = 'adhd_visitor_id';

  try {
    let visitorId = localStorage.getItem(STORAGE_KEY);

    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem(STORAGE_KEY, visitorId);
    }

    return visitorId;
  } catch {
    // Fallback if localStorage is disabled
    return 'anonymous';
  }
}

/**
 * Generate session ID (unique per browser session)
 */
export function getSessionId(): string {
  const STORAGE_KEY = 'adhd_session_id';

  try {
    let sessionId = sessionStorage.getItem(STORAGE_KEY);

    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem(STORAGE_KEY, sessionId);
    }

    return sessionId;
  } catch {
    // Fallback if sessionStorage is disabled
    return `session_${Date.now()}`;
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Detect search engine from referrer
 */
function detectSearchEngine(referrer: string): string | null {
  if (!referrer) return null;

  const searchEngines: Record<string, string> = {
    'google': 'Google',
    'bing': 'Bing',
    'duckduckgo': 'DuckDuckGo',
    'yahoo': 'Yahoo',
    'baidu': 'Baidu',
    'yandex': 'Yandex',
  };

  for (const [key, name] of Object.entries(searchEngines)) {
    if (referrer.toLowerCase().includes(key)) {
      return name;
    }
  }

  return null;
}

/**
 * Extract search query from referrer URL
 */
function extractSearchQuery(referrer: string): string | null {
  if (!referrer) return null;

  try {
    const url = new URL(referrer);

    // Google uses 'q' parameter
    if (url.hostname.includes('google')) {
      return url.searchParams.get('q');
    }

    // Bing uses 'q' parameter
    if (url.hostname.includes('bing')) {
      return url.searchParams.get('q');
    }

    // DuckDuckGo uses 'q' parameter
    if (url.hostname.includes('duckduckgo')) {
      return url.searchParams.get('q');
    }

    // Yahoo uses 'p' parameter
    if (url.hostname.includes('yahoo')) {
      return url.searchParams.get('p');
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse UTM parameters from URL
 */
function parseUtmParams() {
  if (typeof window === 'undefined') {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    utmTerm: params.get('utm_term'),
    utmContent: params.get('utm_content'),
  };
}

/**
 * Detect browser information
 */
function detectBrowser(): { browser: string; browserVersion: string } {
  if (typeof window === 'undefined') {
    return { browser: 'Unknown', browserVersion: 'Unknown' };
  }

  const ua = navigator.userAgent;

  // Chrome
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return { browser: 'Chrome', browserVersion: match ? match[1] : 'Unknown' };
  }

  // Safari
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    return { browser: 'Safari', browserVersion: match ? match[1] : 'Unknown' };
  }

  // Firefox
  if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return { browser: 'Firefox', browserVersion: match ? match[1] : 'Unknown' };
  }

  // Edge
  if (ua.includes('Edg')) {
    const match = ua.match(/Edg\/(\d+)/);
    return { browser: 'Edge', browserVersion: match ? match[1] : 'Unknown' };
  }

  return { browser: 'Other', browserVersion: 'Unknown' };
}

/**
 * Detect operating system
 */
function detectOS(): { os: string; osVersion: string } {
  if (typeof window === 'undefined') {
    return { os: 'Unknown', osVersion: 'Unknown' };
  }

  const ua = navigator.userAgent;

  // Windows
  if (ua.includes('Windows NT')) {
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    return { os: 'Windows', osVersion: match ? match[1] : 'Unknown' };
  }

  // macOS
  if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    const version = match ? match[1].replace('_', '.') : 'Unknown';
    return { os: 'macOS', osVersion: version };
  }

  // iOS
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS (\d+_\d+)/);
    const version = match ? match[1].replace('_', '.') : 'Unknown';
    return { os: 'iOS', osVersion: version };
  }

  // Android
  if (ua.includes('Android')) {
    const match = ua.match(/Android (\d+\.\d+)/);
    return { os: 'Android', osVersion: match ? match[1] : 'Unknown' };
  }

  // Linux
  if (ua.includes('Linux')) {
    return { os: 'Linux', osVersion: 'Unknown' };
  }

  return { os: 'Other', osVersion: 'Unknown' };
}

/**
 * Detect device type
 */
function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent;

  // Check for tablet
  if (ua.includes('iPad') || (ua.includes('Android') && !ua.includes('Mobile'))) {
    return 'tablet';
  }

  // Check for mobile
  if (ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android')) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Collect analytics event data
 */
export function collectAnalyticsEvent(): AnalyticsEvent {
  const referrer = document.referrer || null;
  const referrerDomain = referrer ? extractDomain(referrer) : null;
  const searchEngine = referrer ? detectSearchEngine(referrer) : null;
  const searchQuery = referrer ? extractSearchQuery(referrer) : null;
  const utm = parseUtmParams();
  const { browser, browserVersion } = detectBrowser();
  const { os, osVersion } = detectOS();
  const deviceType = detectDeviceType();

  // Calculate page load time if available
  let pageLoadTimeMs: number | null = null;
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing;
    if (perfData.loadEventEnd && perfData.navigationStart) {
      pageLoadTimeMs = perfData.loadEventEnd - perfData.navigationStart;
    }
  }

  return {
    path: window.location.pathname,
    pageTitle: document.title,
    referrerUrl: referrer,
    referrerDomain,
    searchEngine,
    searchQuery,
    utmSource: utm.utmSource,
    utmMedium: utm.utmMedium,
    utmCampaign: utm.utmCampaign,
    utmTerm: utm.utmTerm,
    utmContent: utm.utmContent,
    userAgent: navigator.userAgent,
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    isMobile: deviceType === 'mobile' || deviceType === 'tablet',
    pageLoadTimeMs,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
  };
}

/**
 * Track engagement metrics
 */
export class EngagementTracker {
  private startTime: number;
  private maxScrollDepth: number = 0;
  private clicksCount: number = 0;
  private scrollListener: (() => void) | null = null;
  private clickListener: ((e: MouseEvent) => void) | null = null;

  constructor() {
    this.startTime = Date.now();
    this.setupListeners();
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    // Track scroll depth
    this.scrollListener = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });

    // Track clicks
    this.clickListener = (e: MouseEvent) => {
      // Only count meaningful clicks (links, buttons)
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        this.clicksCount++;
      }
    };

    document.addEventListener('click', this.clickListener);
  }

  getEngagementData(): EngagementData {
    const timeOnPageSeconds = Math.round((Date.now() - this.startTime) / 1000);

    return {
      timeOnPageSeconds,
      scrollDepthPercent: this.maxScrollDepth,
      clicksCount: this.clicksCount,
    };
  }

  cleanup() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }
}

/**
 * Send analytics event to backend
 */
export async function sendAnalyticsEvent(event: AnalyticsEvent, engagement?: EngagementData) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        ...engagement,
      }),
      // Don't wait for response
      keepalive: true,
    });
  } catch (error) {
    // Fail silently - don't disrupt user experience
    console.debug('Analytics tracking failed:', error);
  }
}

/**
 * Track conversion event (signup, chat start, etc.)
 */
export async function trackConversion(conversionType: 'signup' | 'chat_start' | 'voice_start') {
  try {
    await fetch('/api/analytics/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversionType,
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
      }),
      keepalive: true,
    });
  } catch (error) {
    console.debug('Conversion tracking failed:', error);
  }
}
