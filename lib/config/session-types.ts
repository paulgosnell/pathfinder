/**
 * Session Type Configuration
 *
 * Defines the 6 session types and their characteristics:
 * - Discovery: Initial onboarding to gather profile data
 * - Quick Tip: Fast advice (1-2 exchanges)
 * - Update: Progress check-in (5-7 exchanges)
 * - Strategy: Issue deep-dive (8-12 exchanges)
 * - Crisis: Emergency support (immediate intervention)
 * - Coaching: Full GROW model exploration (10-15+ exchanges)
 */

export type SessionType = 'discovery' | 'quick-tip' | 'update' | 'strategy' | 'crisis' | 'coaching';

export interface SessionTypeConfig {
  id: SessionType;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;  // Lucide icon name
  color: string;  // Design system color
  minExchanges: number;
  suggestedTimeMinutes: number;
  showForFirstTime: boolean;  // Show prominently for first-time users
}

export const SESSION_TYPE_CONFIG: Record<SessionType, SessionTypeConfig> = {
  'discovery': {
    id: 'discovery',
    title: 'Discovery call',
    shortTitle: 'Discovery',
    description: 'So I can understand you and your child',
    icon: 'Compass',  // Lucide icon
    color: '#F0D9DA',  // Soft pink
    minExchanges: 8,  // 8-10 exchanges for full onboarding
    suggestedTimeMinutes: 10,  // 5-10 mins, can run longer
    showForFirstTime: true,
  },
  'quick-tip': {
    id: 'quick-tip',
    title: 'Quick tip',
    shortTitle: 'Quick Tip',
    description: 'Brainstorm an issue right now',
    icon: 'Zap',  // Lucide icon
    color: '#E6A897',  // Warm coral
    minExchanges: 2,  // 1-2 exchanges
    suggestedTimeMinutes: 5,
    showForFirstTime: false,
  },
  'update': {
    id: 'update',
    title: 'Update',
    shortTitle: 'Update',
    description: "Let's talk about how it's going",
    icon: 'MessageCircle',  // Lucide icon
    color: '#B7D3D8',  // Soft blue
    minExchanges: 6,  // 5-7 exchanges
    suggestedTimeMinutes: 15,
    showForFirstTime: false,
  },
  'strategy': {
    id: 'strategy',
    title: 'Strategy',
    shortTitle: 'Strategy',
    description: 'Develop a strategy to deal with a particular issue',
    icon: 'Target',  // Lucide icon
    color: '#D7CDEC',  // Soft purple
    minExchanges: 9,  // 8-12 exchanges
    suggestedTimeMinutes: 30,
    showForFirstTime: false,
  },
  'crisis': {
    id: 'crisis',
    title: 'Crisis',
    shortTitle: 'Crisis',
    description: 'You need help now!',
    icon: 'AlertCircle',  // Lucide icon
    color: '#E6A897',  // Alert coral
    minExchanges: 0,  // Immediate response
    suggestedTimeMinutes: 15,  // Variable, but start with 15
    showForFirstTime: false,
  },
  'coaching': {
    id: 'coaching',
    title: 'Coaching',
    shortTitle: 'Coaching',
    description: 'A deeper dive to explore why things might be happening the way they are',
    icon: 'Heart',  // Lucide icon
    color: '#E3EADD',  // Soft green
    minExchanges: 10,  // 10-15+ exchanges
    suggestedTimeMinutes: 50,
    showForFirstTime: false,
  },
};

/**
 * Get session type configuration
 */
export function getSessionTypeConfig(type: SessionType): SessionTypeConfig {
  return SESSION_TYPE_CONFIG[type];
}

/**
 * Get all session types in recommended order for UI display
 * Discovery first if not completed, then ordered by typical usage
 */
export function getSessionTypesOrdered(discoveryCompleted: boolean = false): SessionType[] {
  if (!discoveryCompleted) {
    // Show discovery first for new users
    return ['discovery', 'quick-tip', 'update', 'strategy', 'crisis', 'coaching'];
  }

  // Regular order for returning users (discovery last since it's done)
  return ['quick-tip', 'update', 'strategy', 'coaching', 'crisis', 'discovery'];
}

/**
 * Get minimum exchanges required for session type
 * Used by API to determine when to move to Options phase
 */
export function getMinExchanges(sessionType: SessionType): number {
  return SESSION_TYPE_CONFIG[sessionType].minExchanges;
}

/**
 * Get suggested time budget for session type
 */
export function getSuggestedTime(sessionType: SessionType): number {
  return SESSION_TYPE_CONFIG[sessionType].suggestedTimeMinutes;
}
