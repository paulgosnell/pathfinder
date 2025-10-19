import { createServiceClient } from '@/lib/supabase/service-client';

const supabase = createServiceClient();

interface CreateSessionInput {
  id: string;
  userId: string;
  crisisLevel: string;
  startedAt: string;
  sessionType?: string;
  interactionMode?: 'check-in' | 'coaching';
  status?: 'active' | 'complete' | 'scheduled';
  scheduledFor?: string;
  timeBudgetMinutes?: number;
  timeElapsedMinutes?: number;
  canExtendTime?: boolean;
  timeExtensionOffered?: boolean;
}

export const dbChats = {
  async createSession({
    id,
    userId,
    crisisLevel,
    startedAt,
    sessionType = 'coaching',
    interactionMode = 'check-in',
    status = 'active',
    scheduledFor,
    timeBudgetMinutes = 50,
    timeElapsedMinutes = 0,
    canExtendTime = true,
    timeExtensionOffered = false
  }: CreateSessionInput) {
    const { error } = await supabase.from('agent_sessions').insert({
      id,
      user_id: userId,
      crisis_level: crisisLevel,
      started_at: startedAt,
      session_type: sessionType,
      interaction_mode: interactionMode,
      status,
      scheduled_for: scheduledFor,
      time_budget_minutes: timeBudgetMinutes,
      time_elapsed_minutes: timeElapsedMinutes,
      can_extend_time: canExtendTime,
      time_extension_offered: timeExtensionOffered
    });

    if (error) {
      throw error;
    }
  },

  async updateSession(sessionId: string, updates: Record<string, any>) {
    const { error } = await supabase
      .from('agent_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      throw error;
    }
  },

  async getSession(sessionId: string) {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  async getActiveDiscoverySession(userId: string) {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_type', 'discovery')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[dbChats] Error fetching active discovery session:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Convert database format to SessionState format
    return {
      id: data.id,
      userId: data.user_id,
      sessionType: data.session_type,
      interactionMode: data.interaction_mode || 'check-in',
      status: data.status || 'active',
      scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      strategiesDiscussed: data.strategies_discussed || [],
      crisisLevel: data.crisis_level || 'none',
      therapeuticGoal: data.therapeutic_goal,
      startedAt: new Date(data.started_at),
      lastActivity: new Date(data.updated_at || data.started_at),
      currentPhase: data.current_phase || 'goal',
      realityExplorationDepth: data.reality_exploration_depth || 0,
      emotionsReflected: data.emotions_reflected || false,
      exceptionsExplored: data.exceptions_explored || false,
      strengthsIdentified: data.strengths_identified || [],
      parentGeneratedIdeas: data.parent_generated_ideas || [],
      readyForOptions: data.ready_for_options || false,
      currentChallenge: data.current_challenge,
      parentStressLevel: data.parent_stress_level,
      timeBudgetMinutes: data.time_budget_minutes || 50,
      timeElapsedMinutes: data.time_elapsed_minutes || 0,
      canExtendTime: data.can_extend_time !== false,
      timeExtensionOffered: data.time_extension_offered || false
    };
  },

  async appendStrategy(sessionId: string, strategyId: string) {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('strategies_discussed')
      .eq('id', sessionId)
      .single();

    if (error) {
      throw error;
    }

    const strategies = data?.strategies_discussed || [];
    if (!strategies.includes(strategyId)) {
      strategies.push(strategyId);
      await this.updateSession(sessionId, { strategies_discussed: strategies });
    }
  },

  async createMessage({
    sessionId,
    role,
    content,
    toolCalls,
    agentReasoning,
  }: {
    sessionId: string;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    toolCalls?: any;
    agentReasoning?: string;
  }) {
    const { error } = await supabase.from('agent_conversations').insert({
      session_id: sessionId,
      role,
      content,
      tool_calls: toolCalls,
      agent_reasoning: agentReasoning
    });

    if (error) {
      throw error;
    }
  }
};

