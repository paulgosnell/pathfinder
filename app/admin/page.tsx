'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  summary: {
    totalSessionsAllTime: number;
    totalCrisesDetected: number;
    averageTokensPerSession: number;
    crisisRate: string;
  };
  today: {
    totalSessions: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    successRate: number;
    strategiesProvided: number;
  };
  costEstimates: {
    todayCost: string;
    projectedMonthlyCost: string;
    averageCostPerSession: string;
  };
  performance: {
    averageResponseTime: string;
    successRate: string;
    strategiesProvidedToday: number;
  };
  recentErrors: Array<{
    sessionId: string;
    agentType: string;
    message: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analyticsData = await response.json();
      setData(analyticsData);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">📊</div>
          <p className="text-slate">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-navy mb-2">Error Loading Data</h2>
          <p className="text-slate mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-teal text-navy rounded-full font-semibold hover:bg-opacity-80 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">📊 Admin Dashboard</h1>
              <p className="text-slate">
                Real-time monitoring and analytics for ADHD Support Agent
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="px-4 py-2 bg-lavender text-navy rounded-full font-semibold hover:bg-opacity-80 transition disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
              <p className="text-xs text-slate mt-2">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <a
            href="/"
            className="text-teal hover:underline text-sm"
          >
            ← Back to Chat
          </a>
        </div>

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Sessions"
                value={data.summary.totalSessionsAllTime.toLocaleString()}
                icon="💬"
                subtitle="All time"
              />
              <StatCard
                title="Crisis Detections"
                value={data.summary.totalCrisesDetected.toLocaleString()}
                icon="🚨"
                subtitle={`${data.summary.crisisRate} of sessions`}
              />
              <StatCard
                title="Avg Tokens"
                value={data.summary.averageTokensPerSession.toLocaleString()}
                icon="🎯"
                subtitle="Per session"
              />
              <StatCard
                title="Success Rate"
                value={data.performance.successRate}
                icon="✅"
                subtitle="Today"
              />
            </div>

            {/* Today's Activity */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-navy mb-6">📅 Today's Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricBox
                  label="Sessions"
                  value={data.today.totalSessions.toString()}
                  color="teal"
                />
                <MetricBox
                  label="Tokens Used"
                  value={data.today.totalTokens.toLocaleString()}
                  color="lavender"
                />
                <MetricBox
                  label="Strategies Provided"
                  value={data.performance.strategiesProvidedToday.toString()}
                  color="sage"
                />
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-navy mb-6">💰 Cost Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CostBox
                  label="Today's Cost"
                  value={data.costEstimates.todayCost}
                  trend="neutral"
                />
                <CostBox
                  label="Projected Monthly"
                  value={data.costEstimates.projectedMonthlyCost}
                  trend="neutral"
                />
                <CostBox
                  label="Avg per Session"
                  value={data.costEstimates.averageCostPerSession}
                  trend="neutral"
                />
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-navy mb-6">⚡ Performance Metrics</h2>
              <div className="space-y-4">
                <ProgressBar
                  label="Success Rate"
                  value={parseFloat(data.performance.successRate)}
                  max={100}
                  color="teal"
                  suffix="%"
                />
                <ProgressBar
                  label="Average Response Time"
                  value={parseInt(data.performance.averageResponseTime)}
                  max={10000}
                  color="lavender"
                  suffix="ms"
                />
              </div>
            </div>

            {/* Recent Errors */}
            {data.recentErrors && data.recentErrors.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-navy mb-6">⚠️ Recent Errors</h2>
                <div className="space-y-3">
                  {data.recentErrors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-blush bg-opacity-20 rounded-xl border border-coral border-opacity-20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-coral px-2 py-1 bg-white rounded">
                          {err.agentType}
                        </span>
                        <span className="text-xs text-slate">
                          {new Date(err.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-navy font-mono">{err.message}</p>
                      <p className="text-xs text-slate mt-1">Session: {err.sessionId.substring(0, 8)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Errors Message */}
            {(!data.recentErrors || data.recentErrors.length === 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-4xl mb-2">✨</div>
                <h3 className="text-xl font-semibold text-navy mb-2">All Clear!</h3>
                <p className="text-slate">No errors detected in recent sessions.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, subtitle }: { title: string; value: string; icon: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-sm text-slate mb-1">{title}</h3>
      <p className="text-3xl font-bold text-navy mb-1">{value}</p>
      <p className="text-xs text-slate">{subtitle}</p>
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  const bgColors: Record<string, string> = {
    teal: 'bg-teal',
    lavender: 'bg-lavender',
    sage: 'bg-sage',
  };

  return (
    <div className={`${bgColors[color]} bg-opacity-20 rounded-xl p-4`}>
      <p className="text-sm text-slate mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}

function CostBox({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="border-2 border-lavender border-opacity-20 rounded-xl p-4">
      <p className="text-sm text-slate mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, max, color, suffix }: { label: string; value: number; max: number; color: string; suffix: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const bgColors: Record<string, string> = {
    teal: 'bg-teal',
    lavender: 'bg-lavender',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate">{label}</span>
        <span className="text-sm font-semibold text-navy">{value}{suffix}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${bgColors[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

