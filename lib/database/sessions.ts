import { supabase, AgentSession } from '@/lib/supabase/client';

export class DatabaseSessionManager {
  async createSession(userId: string, therapeuticGoal?: string): Promise<AgentSession> {
    const { data, error } = await supabase
      .from('agent_sessions')
      .insert({
        user_id: userId,
        therapeutic_goal: therapeuticGoal,
        crisis_level: 'none',
        strategies_discussed: [],
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSession(sessionId: string, updates: Partial<AgentSession>) {
    const { error } = await supabase
      .from('agent_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  async saveConversation(sessionId: string, role: string, content: string, toolCalls?: any) {
    const { error } = await supabase
      .from('agent_conversations')
      .insert({
        session_id: sessionId,
        role,
        content,
        tool_calls: toolCalls,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getSessionHistory(sessionId: string, limit = 10) {
    const { data, error } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  }
}

export const dbSessionManager = new DatabaseSessionManager();