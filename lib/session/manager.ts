import { dbChats } from '@/lib/database/chats';

export interface SessionState {
  id: string;
  userId: string;
  therapeuticGoal?: string;
  strategiesDiscussed: string[];
  crisisLevel: string;
  startedAt: Date;
  lastActivity: Date;
  discoveryPhaseComplete?: boolean;
  questionsAsked?: number;
  contextGathered?: Record<string, any>;
  currentChallenge?: string;
  parentStressLevel?: string;
}

class SessionManager {
  async createSession(userId: string): Promise<SessionState> {
    const sessionId = crypto.randomUUID();
    const startedAt = new Date();

    await dbChats.createSession({
      id: sessionId,
      userId,
      crisisLevel: 'none',
      startedAt: startedAt.toISOString()
    });

    return {
      id: sessionId,
      userId,
      strategiesDiscussed: [],
      crisisLevel: 'none',
      therapeuticGoal: undefined,
      startedAt,
      lastActivity: startedAt,
      discoveryPhaseComplete: false,
      questionsAsked: 0,
      contextGathered: {}
    };
  }

  async updateSession(sessionId: string, updates: Partial<SessionState>) {
    const payload: Record<string, any> = {};

    if (updates.therapeuticGoal !== undefined) {
      payload.therapeutic_goal = updates.therapeuticGoal;
    }

    if (updates.strategiesDiscussed) {
      payload.strategies_discussed = updates.strategiesDiscussed;
    }

    if (updates.crisisLevel !== undefined) {
      payload.crisis_level = updates.crisisLevel;
    }

    if (updates.discoveryPhaseComplete !== undefined) {
      payload.discovery_phase_complete = updates.discoveryPhaseComplete;
    }

    if (updates.questionsAsked !== undefined) {
      payload.questions_asked = updates.questionsAsked;
    }

    if (updates.contextGathered !== undefined) {
      payload.context_gathered = updates.contextGathered;
    }

    if (updates.currentChallenge !== undefined) {
      payload.current_challenge = updates.currentChallenge;
    }

    if (updates.parentStressLevel !== undefined) {
      payload.parent_stress_level = updates.parentStressLevel;
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    await dbChats.updateSession(sessionId, payload);
  }

  async getSession(sessionId: string): Promise<SessionState | null> {
    const session = await dbChats.getSession(sessionId);
    if (!session) return null;

    return {
      id: session.id,
      userId: session.user_id,
      therapeuticGoal: session.therapeutic_goal || undefined,
      strategiesDiscussed: session.strategies_discussed || [],
      crisisLevel: session.crisis_level || 'none',
      startedAt: new Date(session.started_at),
      lastActivity: new Date(session.updated_at || session.started_at),
      discoveryPhaseComplete: session.discovery_phase_complete || false,
      questionsAsked: session.questions_asked || 0,
      contextGathered: session.context_gathered || {},
      currentChallenge: session.current_challenge || undefined,
      parentStressLevel: session.parent_stress_level || undefined
    };
  }

  async addStrategy(sessionId: string, strategyId: string) {
    await dbChats.appendStrategy(sessionId, strategyId);
  }
}

export const sessionManager = new SessionManager();