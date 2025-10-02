import { supabase } from '@/lib/supabase/client';

export class AgentMonitor {
  static async logAgentDecision(
    sessionId: string,
    decisionPoint: string,
    context: any,
    decision: string
  ) {
    try {
      await supabase.from('agent_decisions').insert({
        session_id: sessionId,
        decision_point: decisionPoint,
        context_factors: context,
        decision_made: decision,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log agent decision:', error);
    }
  }

  static async trackAgentPerformance(sessionId: string, outcome: string) {
    try {
      await supabase
        .from('agent_sessions')
        .update({ session_outcome: outcome })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }
}