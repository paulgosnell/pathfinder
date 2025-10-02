import { NextRequest } from 'next/server';
import { performanceTracker } from '@/lib/monitoring/performance-tracker';

export async function GET(req: NextRequest) {
  try {
    // Get daily statistics
    const dailyStats = performanceTracker.getDailyStats();
    const recentErrors = performanceTracker.getRecentErrors(10);
    const allMetrics = performanceTracker.getAllMetrics();

    // Calculate additional insights
    const totalSessions = allMetrics.length;
    const totalCrises = allMetrics.filter(m => m.crisisDetected).length;
    const averageTokens = totalSessions > 0 
      ? Math.round(allMetrics.reduce((sum, m) => sum + m.totalTokens, 0) / totalSessions)
      : 0;

    const response = {
      summary: {
        totalSessionsAllTime: totalSessions,
        totalCrisesDetected: totalCrises,
        averageTokensPerSession: averageTokens,
        crisisRate: totalSessions > 0 ? ((totalCrises / totalSessions) * 100).toFixed(2) + '%' : '0%'
      },
      today: dailyStats,
      recentErrors: recentErrors.map(err => ({
        sessionId: err.sessionId,
        agentType: err.agentType,
        message: err.message,
        timestamp: err.timestamp
      })),
      costEstimates: {
        todayCost: `$${dailyStats.totalCost.toFixed(4)}`,
        projectedMonthlyCost: `$${(dailyStats.totalCost * 30).toFixed(2)}`,
        averageCostPerSession: totalSessions > 0 
          ? `$${(dailyStats.totalCost / dailyStats.totalSessions).toFixed(4)}`
          : '$0.0000'
      },
      performance: {
        averageResponseTime: `${dailyStats.averageResponseTime}ms`,
        successRate: `${(dailyStats.successRate * 100).toFixed(1)}%`,
        strategiesProvidedToday: dailyStats.strategiesProvided
      },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to retrieve analytics',
      message: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}