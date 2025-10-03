import { dbChats } from '@/lib/database/chats';

export interface SessionState {
  id: string;
  userId: string;
  therapeuticGoal?: string;
  strategiesDiscussed: string[];
  crisisLevel: string;
  startedAt: Date;
  lastActivity: Date;
  // Coaching phases - track where we are in GROW model
  currentPhase: 'goal' | 'reality' | 'options' | 'will' | 'closing';
  realityExplorationDepth: number;      // How many exchanges in Reality phase
  emotionsReflected: boolean;           // Have we validated feelings?
  exceptionsExplored: boolean;          // Have we asked about when it works?
  strengthsIdentified: string[];        // What's working well
  parentGeneratedIdeas: string[];       // Their ideas, not ours
  readyForOptions: boolean;             // Only true after thorough Reality exploration
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
      currentPhase: 'goal',
      realityExplorationDepth: 0,
      emotionsReflected: false,
      exceptionsExplored: false,
      strengthsIdentified: [],
      parentGeneratedIdeas: [],
      readyForOptions: false
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

    if (updates.currentPhase !== undefined) {
      payload.current_phase = updates.currentPhase;
    }

    if (updates.realityExplorationDepth !== undefined) {
      payload.reality_exploration_depth = updates.realityExplorationDepth;
    }

    if (updates.emotionsReflected !== undefined) {
      payload.emotions_reflected = updates.emotionsReflected;
    }

    if (updates.exceptionsExplored !== undefined) {
      payload.exceptions_explored = updates.exceptionsExplored;
    }

    if (updates.strengthsIdentified !== undefined) {
      payload.strengths_identified = updates.strengthsIdentified;
    }

    if (updates.parentGeneratedIdeas !== undefined) {
      payload.parent_generated_ideas = updates.parentGeneratedIdeas;
    }

    if (updates.readyForOptions !== undefined) {
      payload.ready_for_options = updates.readyForOptions;
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
      currentPhase: session.current_phase || 'goal',
      realityExplorationDepth: session.reality_exploration_depth || 0,
      emotionsReflected: session.emotions_reflected || false,
      exceptionsExplored: session.exceptions_explored || false,
      strengthsIdentified: session.strengths_identified || [],
      parentGeneratedIdeas: session.parent_generated_ideas || [],
      readyForOptions: session.ready_for_options || false,
      currentChallenge: session.current_challenge || undefined,
      parentStressLevel: session.parent_stress_level || undefined
    };
  }

  async addStrategy(sessionId: string, strategyId: string) {
    await dbChats.appendStrategy(sessionId, strategyId);
  }
}

export const sessionManager = new SessionManager();