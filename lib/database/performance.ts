import { supabase } from '@/lib/supabase/client';

export interface AgentPerformanceData {
  session_id: string;
  user_id: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  tools_used: number;
  response_time_ms: number;
  successful_completion: boolean;
  crisis_detected: boolean;
  strategies_provided: number;
  prompt_cost: number;
  completion_cost: number;
  total_cost: number;
  model_used?: string;
}

export interface AgentErrorData {
  session_id?: string;
  user_id?: string;
  agent_type: 'crisis' | 'main';
  error_message: string;
  error_context?: any;
  model_used?: string;
  message_length?: number;
}

export interface ToolUsageData {
  session_id: string;
  user_id: string;
  tool_name: string;
  tool_input?: any;
  tool_output?: any;
  execution_time_ms?: number;
  success: boolean;
}

export interface AuthEventData {
  userId: string;
  type: 'register' | 'login' | 'logout';
  metadata?: Record<string, any>;
}

export class DatabasePerformanceManager {
  async savePerformanceMetrics(data: AgentPerformanceData) {
    try {
      const { error } = await supabase
        .from('agent_performance')
        .insert(data);

      if (error) {
        console.error('Failed to save performance metrics:', error);
        throw error;
      }

      // Update daily stats
      await this.updateDailyStats(data.user_id, data);
      
    } catch (error) {
      console.error('Error in savePerformanceMetrics:', error);
      throw error;
    }
  }

  async logError(data: AgentErrorData) {
    try {
      const { error } = await supabase
        .from('agent_errors')
        .insert(data);

      if (error) {
        console.error('Failed to log error:', error);
      }
    } catch (error) {
      console.error('Error in logError:', error);
    }
  }

  async saveToolUsage(data: ToolUsageData) {
    try {
      const { error } = await supabase
        .from('agent_tool_usage')
        .insert(data);

      if (error) {
        console.error('Failed to save tool usage:', error);
      }
    } catch (error) {
      console.error('Error in saveToolUsage:', error);
    }
  }

  private async updateDailyStats(userId: string, performanceData: AgentPerformanceData) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Use upsert to update existing or create new daily stats
      const { error } = await supabase
        .from('agent_daily_stats')
        .upsert({
          user_id: userId,
          date: today,
          total_sessions: 1,
          total_tokens: performanceData.total_tokens,
          total_cost: performanceData.total_cost,
          avg_response_time_ms: performanceData.response_time_ms,
          crisis_sessions: performanceData.crisis_detected ? 1 : 0,
          successful_sessions: performanceData.successful_completion ? 1 : 0,
          strategies_provided: performanceData.strategies_provided,
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Failed to update daily stats:', error);
      }
    } catch (error) {
      console.error('Error in updateDailyStats:', error);
    }
  }

  async getDailyStats(userId: string, date?: string) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('agent_daily_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('date', targetDate)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Failed to get daily stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDailyStats:', error);
      return null;
    }
  }

  async getUsageReport(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('agent_daily_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to get usage report:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUsageReport:', error);
      return [];
    }
  }

  async getToolUsageStats(userId: string, days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('agent_tool_usage')
        .select('tool_name, success, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get tool usage stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getToolUsageStats:', error);
      return [];
    }
  }

  async getErrorReport(days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('agent_errors')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Failed to get error report:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getErrorReport:', error);
      return [];
    }
  }

  async recordAuthEvent({ userId, type, metadata }: AuthEventData) {
    try {
      const { error } = await supabase
        .from('auth_event_logs')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          event_type: type,
          metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to record auth event', error);
      }
    } catch (error) {
      console.error('Error in recordAuthEvent', error);
    }
  }
}

export const dbPerformanceManager = new DatabasePerformanceManager();

export const recordAuthEvent = (params: AuthEventData) => dbPerformanceManager.recordAuthEvent(params);