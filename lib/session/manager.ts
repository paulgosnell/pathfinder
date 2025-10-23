import { dbChats } from '@/lib/database/chats';

export interface SessionState {
  id: string;
  userId: string;
  sessionType: string;                  // Session type (discovery, quick-tip, update, strategy, crisis, coaching)
  interactionMode: 'check-in' | 'coaching';  // NEW: Interaction mode (check-in = casual, coaching = GROW)
  status: 'active' | 'complete' | 'scheduled';  // NEW: Session status
  scheduledFor?: Date;                  // NEW: For scheduled coaching sessions
  therapeuticGoal?: string;
  strategiesDiscussed: string[];
  crisisLevel: string;
  startedAt: Date;
  lastActivity: Date;
  // Coaching phases - track where we are in GROW model (only used in coaching mode)
  currentPhase: 'goal' | 'reality' | 'options' | 'will' | 'closing';
  realityExplorationDepth: number;      // How many exchanges in Reality phase
  emotionsReflected: boolean;           // Have we validated feelings?
  exceptionsExplored: boolean;          // Have we asked about when it works?
  strengthsIdentified: string[];        // What's working well
  parentGeneratedIdeas: string[];       // Their ideas, not ours
  readyForOptions: boolean;             // Only true after thorough Reality exploration
  currentChallenge?: string;
  parentStressLevel?: string;
  // Time tracking
  timeBudgetMinutes: number;            // Parent's available time (5, 15, 30, 50)
  timeElapsedMinutes: number;           // Estimated time elapsed so far
  canExtendTime: boolean;               // Whether parent can extend if needed
  timeExtensionOffered: boolean;        // Prevent repeated extension asks
}

class SessionManager {
  async createSession(
    userId: string,
    interactionMode: 'check-in' | 'coaching' = 'check-in',  // Default to check-in mode
    timeBudgetMinutes?: number,
    scheduledFor?: Date,
    sessionType?: string,  // NEW: explicit session type (discovery, quick-tip, etc.)
    forceNew: boolean = false  // NEW: force new session (auto-close old active sessions)
  ): Promise<SessionState> {
    // Use explicit session type if provided, otherwise infer from interaction mode
    const finalSessionType = sessionType || (interactionMode === 'coaching' ? 'coaching' : 'quick-tip');

    // CRITICAL: Check for existing active discovery session
    // If forceNew is true, auto-complete any old discovery sessions to start fresh
    // If forceNew is false, resume existing discovery session
    if (finalSessionType === 'discovery') {
      const existingDiscovery = await dbChats.getActiveDiscoverySession(userId);
      if (existingDiscovery) {
        if (forceNew) {
          // User wants to start fresh - auto-complete the old discovery session
          console.log(`🔄 Auto-completing old discovery session ${existingDiscovery.id} to start fresh`);
          await this.closeSession(existingDiscovery.id);
        } else {
          // Resume existing discovery session
          console.log(`⚠️ Active discovery session already exists: ${existingDiscovery.id} - resuming`);
          return existingDiscovery;
        }
      }
    }

    const sessionId = crypto.randomUUID();
    const startedAt = scheduledFor || new Date();

    // Default time budgets based on interaction mode
    const defaultTimeBudget = interactionMode === 'coaching' ? 30 : 15;
    const finalTimeBudget = timeBudgetMinutes || defaultTimeBudget;

    await dbChats.createSession({
      id: sessionId,
      userId,
      crisisLevel: 'none',
      startedAt: startedAt.toISOString(),
      sessionType: finalSessionType,
      interactionMode,
      status: scheduledFor ? 'scheduled' : 'active',
      scheduledFor: scheduledFor?.toISOString(),
      timeBudgetMinutes: finalTimeBudget,
      timeElapsedMinutes: 0,
      canExtendTime: true,
      timeExtensionOffered: false
    });

    return {
      id: sessionId,
      userId,
      sessionType: finalSessionType,
      interactionMode,
      status: scheduledFor ? 'scheduled' : 'active',
      scheduledFor,
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
      readyForOptions: false,
      timeBudgetMinutes: finalTimeBudget,
      timeElapsedMinutes: 0,
      canExtendTime: true,
      timeExtensionOffered: false
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

    if (updates.interactionMode !== undefined) {
      payload.interaction_mode = updates.interactionMode;
    }

    if (updates.status !== undefined) {
      payload.status = updates.status;
    }

    if (updates.scheduledFor !== undefined) {
      payload.scheduled_for = updates.scheduledFor.toISOString();
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

    if (updates.timeBudgetMinutes !== undefined) {
      payload.time_budget_minutes = updates.timeBudgetMinutes;
    }

    if (updates.timeElapsedMinutes !== undefined) {
      payload.time_elapsed_minutes = updates.timeElapsedMinutes;
    }

    if (updates.canExtendTime !== undefined) {
      payload.can_extend_time = updates.canExtendTime;
    }

    if (updates.timeExtensionOffered !== undefined) {
      payload.time_extension_offered = updates.timeExtensionOffered;
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
      sessionType: session.session_type || 'coaching',
      interactionMode: session.interaction_mode || 'check-in',
      status: session.status || 'active',
      scheduledFor: session.scheduled_for ? new Date(session.scheduled_for) : undefined,
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
      parentStressLevel: session.parent_stress_level || undefined,
      timeBudgetMinutes: session.time_budget_minutes || 50,
      timeElapsedMinutes: session.time_elapsed_minutes || 0,
      canExtendTime: session.can_extend_time ?? true,
      timeExtensionOffered: session.time_extension_offered || false
    };
  }

  async addStrategy(sessionId: string, strategyId: string) {
    await dbChats.appendStrategy(sessionId, strategyId);
  }

  /**
   * Close a session (mark as complete)
   * Used for:
   * - Coaching sessions when GROW phase reaches 'closing'
   * - Discovery sessions when discovery_completed = true
   */
  async closeSession(sessionId: string): Promise<void> {
    await dbChats.updateSession(sessionId, {
      status: 'complete',
      ended_at: new Date().toISOString()
    });
    console.log(`✅ Session ${sessionId} marked as complete`);
  }

  /**
   * Check if a coaching session should be auto-closed
   * Returns true if:
   * - Session type is 'coaching'
   * - Current phase is 'closing'
   * - Last message is from assistant (bot delivered final summary)
   */
  shouldAutoCloseCoachingSession(
    session: SessionState,
    lastMessageRole: 'user' | 'assistant'
  ): boolean {
    return (
      session.sessionType === 'coaching' &&
      session.currentPhase === 'closing' &&
      lastMessageRole === 'assistant'
    );
  }

  /**
   * Check if a discovery session should be auto-closed
   * Returns true if:
   * - Session type is 'discovery'
   * - Discovery progress is 100%
   */
  shouldAutoCloseDiscoverySession(
    session: SessionState,
    discoveryProgressPercent: number
  ): boolean {
    return (
      session.sessionType === 'discovery' &&
      discoveryProgressPercent === 100
    );
  }
}

export const sessionManager = new SessionManager();