interface PerformanceMetrics {
  sessionId: string;
  userId: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  toolsUsed: number;
  responseTimeMs: number;
  successfulCompletion: boolean;
  crisisDetected: boolean;
  strategiesProvided: number;
}

interface DailyStats {
  date: string;
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  crisisDetections: number;
  strategiesProvided: number;
  successRate: number;
}

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  private errorLog: any[] = [];

  // GPT-4o-mini pricing (per 1K tokens)
  private readonly PROMPT_COST_PER_1K = 0.00015; // $0.15 per 1M tokens
  private readonly COMPLETION_COST_PER_1K = 0.0006; // $0.60 per 1M tokens

  /**
   * Calculate cost for a given number of tokens
   */
  calculateCost(promptTokens: number, completionTokens: number): number {
    const promptCost = (promptTokens / 1000) * this.PROMPT_COST_PER_1K;
    const completionCost = (completionTokens / 1000) * this.COMPLETION_COST_PER_1K;
    return promptCost + completionCost;
  }

  /**
   * Track a session's performance metrics
   */
  async trackSession(metrics: PerformanceMetrics): Promise<void> {
    this.metrics.push({
      ...metrics,
      timestamp: new Date().toISOString()
    } as any);

    const cost = this.calculateCost(metrics.promptTokens, metrics.completionTokens);

    console.log('📊 Performance Metrics:', {
      sessionId: metrics.sessionId,
      tokens: metrics.totalTokens,
      cost: `$${cost.toFixed(6)}`,
      responseTime: `${metrics.responseTimeMs}ms`,
      toolsUsed: metrics.toolsUsed,
      crisis: metrics.crisisDetected,
      strategies: metrics.strategiesProvided
    });

    // Try to persist to database using service role (bypasses RLS)
    try {
      const { createServiceClient } = await import('@/lib/supabase/service-client');
      const supabase = createServiceClient();
      
      await supabase.from('agent_performance').insert({
        session_id: metrics.sessionId,
        user_id: metrics.userId,
        total_tokens: metrics.totalTokens,
        prompt_tokens: metrics.promptTokens,
        completion_tokens: metrics.completionTokens,
        tools_used: metrics.toolsUsed,
        response_time_ms: metrics.responseTimeMs,
        successful_completion: metrics.successfulCompletion,
        crisis_detected: metrics.crisisDetected,
        strategies_provided: metrics.strategiesProvided,
        prompt_cost: (metrics.promptTokens / 1000) * this.PROMPT_COST_PER_1K,
        completion_cost: (metrics.completionTokens / 1000) * this.COMPLETION_COST_PER_1K,
        total_cost: cost,
        model_used: 'gpt-4o-mini'
      });
    } catch (error) {
      // Silently fail if database not available - metrics still logged to console
      console.warn('⚠️ Could not persist metrics to database:', (error as Error).message);
    }
  }

  /**
   * Log an error with context
   */
  async logError(
    sessionId: string,
    userId: string,
    agentType: string,
    error: Error,
    context: any
  ): Promise<void> {
    const errorEntry = {
      sessionId,
      userId,
      agentType,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };

    this.errorLog.push(errorEntry);

    console.error('❌ Error logged:', {
      sessionId,
      agentType,
      message: error.message,
      timestamp: errorEntry.timestamp
    });

    // Note: agent_errors table was removed in cleanup migration (Oct 2025)
    // Error tracking now done via console logging only
  }

  /**
   * Get daily statistics
   */
  getDailyStats(): DailyStats {
    const today = new Date().toISOString().split('T')[0];
    const todayMetrics = this.metrics.filter((m: any) => 
      m.timestamp?.startsWith(today)
    );

    if (todayMetrics.length === 0) {
      return {
        date: today,
        totalSessions: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        crisisDetections: 0,
        strategiesProvided: 0,
        successRate: 0
      };
    }

    const totalTokens = todayMetrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const totalCost = todayMetrics.reduce((sum, m) => 
      sum + this.calculateCost(m.promptTokens, m.completionTokens), 0
    );
    const avgResponseTime = todayMetrics.reduce((sum, m) => 
      sum + m.responseTimeMs, 0
    ) / todayMetrics.length;
    const crisisDetections = todayMetrics.filter(m => m.crisisDetected).length;
    const strategiesProvided = todayMetrics.reduce((sum, m) => 
      sum + m.strategiesProvided, 0
    );
    const successRate = todayMetrics.filter(m => m.successfulCompletion).length / 
      todayMetrics.length;

    return {
      date: today,
      totalSessions: todayMetrics.length,
      totalTokens,
      totalCost,
      averageResponseTime: Math.round(avgResponseTime),
      crisisDetections,
      strategiesProvided,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): any[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear old metrics (keep last 1000)
   */
  cleanupOldMetrics(): void {
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();