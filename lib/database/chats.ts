import { createServiceClient } from '@/lib/supabase/service-client';

const supabase = createServiceClient();

interface CreateSessionInput {
  id: string;
  userId: string;
  crisisLevel: string;
  startedAt: string;
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

