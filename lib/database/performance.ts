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

// Removed unused interfaces:
// - AgentErrorData (agent_errors table dropped)
// - ToolUsageData (agent_tool_usage table dropped)
// - AuthEventData (auth_event_logs table doesn't exist)

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

    } catch (error) {
      console.error('Error in savePerformanceMetrics:', error);
      throw error;
    }
  }

  // Removed methods for dropped tables:
  // - logError() - agent_errors table dropped
  // - saveToolUsage() - agent_tool_usage table dropped
  // - updateDailyStats() - agent_daily_stats table dropped (broken upsert logic)
  // - getDailyStats() - agent_daily_stats table dropped
  // - getUsageReport() - agent_daily_stats table dropped
  // - getToolUsageStats() - agent_tool_usage table dropped
  // - getErrorReport() - agent_errors table dropped
  // - recordAuthEvent() - auth_event_logs table never existed
}

export const dbPerformanceManager = new DatabasePerformanceManager();