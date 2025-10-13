'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { logAdminAction } from '@/lib/admin/auth';

// Tab types
type TabType = 'overview' | 'analytics' | 'monitor' | 'sessions' | 'users' | 'waitlist';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Data states
  const [executiveMetrics, setExecutiveMetrics] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);

  // Analytics states
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [trafficSources, setTrafficSources] = useState<any>(null);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [topSearchQueries, setTopSearchQueries] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [llmBreakdown, setLLMBreakdown] = useState<any>(null);
  const [deviceBreakdown, setDeviceBreakdown] = useState<any>(null);
  const [dailyTrends, setDailyTrends] = useState<any[]>([]);
  const [realTimeVisitors, setRealTimeVisitors] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch from API routes instead of direct Supabase queries
      const [dashboardRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/analytics?days=7')
      ]);

      if (!dashboardRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await dashboardRes.json();
      const analyticsData = await analyticsRes.json();

      // Set dashboard data
      setExecutiveMetrics(dashboardData.executiveMetrics);
      setActiveSessions(dashboardData.activeSessions);
      setQualityMetrics(dashboardData.qualityMetrics);
      setTrends(dashboardData.trends);
      setUsers(dashboardData.users);
      setWaitlist(dashboardData.waitlist);
      setAllSessions(dashboardData.allSessions);

      // Set analytics data
      setAnalyticsOverview(analyticsData.overview);
      setRealTimeVisitors(analyticsData.realTimeVisitors);

      // Set empty arrays for data we're not fetching yet
      setTrafficSources({ direct: 0, search: 0, social: 0, referral: 0, llm: 0 });
      setTopReferrers([]);
      setTopSearchQueries([]);
      setTopPages([]);
      setLLMBreakdown({ chatgpt: 0, claude: 0, perplexity: 0, gemini: 0, other_bot: 0 });
      setDeviceBreakdown({ desktop: 0, mobile: 0, tablet: 0 });
      setDailyTrends([]);

      setLastRefresh(new Date());

      // Log admin action
      await logAdminAction('view_dashboard', 'dashboard', undefined, { tab: activeTab });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#F9F7F3' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2A3F5A' }}>Coaching Intelligence Center</h1>
                <p style={{ fontSize: '0.875rem', color: '#586C8E', marginTop: '0.25rem' }}>Real-time monitoring and analytics</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#B7D3D8',
                    color: 'white',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Refreshing...' : '↻ Refresh'}
                </button>
                <p style={{ fontSize: '0.75rem', color: '#586C8E', marginTop: '0.25rem' }}>
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <TabButton
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </TabButton>
              <TabButton
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
              >
                📈 Analytics
              </TabButton>
              <TabButton
                active={activeTab === 'monitor'}
                onClick={() => setActiveTab('monitor')}
              >
                🔥 Live Monitor
              </TabButton>
              <TabButton
                active={activeTab === 'sessions'}
                onClick={() => setActiveTab('sessions')}
              >
                💬 Sessions
              </TabButton>
              <TabButton
                active={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
              >
                👥 Users
              </TabButton>
              <TabButton
                active={activeTab === 'waitlist'}
                onClick={() => setActiveTab('waitlist')}
              >
                📝 Waitlist
              </TabButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && !executiveMetrics ? (
            <LoadingState />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  metrics={executiveMetrics}
                  quality={qualityMetrics}
                  trends={trends}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab
                  overview={analyticsOverview}
                  trafficSources={trafficSources}
                  topReferrers={topReferrers}
                  topSearchQueries={topSearchQueries}
                  topPages={topPages}
                  llmBreakdown={llmBreakdown}
                  deviceBreakdown={deviceBreakdown}
                  dailyTrends={dailyTrends}
                  realTimeVisitors={realTimeVisitors}
                />
              )}
              {activeTab === 'monitor' && (
                <LiveMonitorTab sessions={activeSessions} />
              )}
              {activeTab === 'sessions' && (
                <SessionsTab sessions={allSessions} />
              )}
              {activeTab === 'users' && (
                <UsersTab users={users} />
              )}
              {activeTab === 'waitlist' && (
                <WaitlistTab signups={waitlist} />
              )}
            </>
          )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

// Tab Button Component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        fontWeight: '500',
        fontSize: '0.875rem',
        color: active ? '#2A3F5A' : '#586C8E',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #B7D3D8' : 'none',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
}

// Loading State
function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
      <div style={{
        display: 'inline-block',
        width: '3rem',
        height: '3rem',
        border: '2px solid transparent',
        borderBottomColor: '#B7D3D8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }}></div>
      <p style={{ color: '#586C8E' }}>Loading dashboard data...</p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Overview Tab
function OverviewTab({ metrics, quality, trends }: any) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Sessions"
          value={metrics.activeSessions}
          subtitle="Currently ongoing"
          color="teal"
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          subtitle="All time"
          color="lavender"
        />
        <MetricCard
          title="Total Messages"
          value={metrics.totalConversations}
          subtitle="Conversations"
          color="sage"
        />
        <MetricCard
          title="Crisis Alerts"
          value={metrics.crisisAlerts}
          subtitle="Flagged sessions"
          color="coral"
        />
      </div>

      {/* Mode Split */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">Mode Distribution</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-teal bg-opacity-10 rounded-xl p-4">
            <p className="text-sm text-slate mb-1">💬 Chat Sessions</p>
            <p className="text-3xl font-bold text-navy">{metrics.chatSessionsPercent}%</p>
          </div>
          <div className="bg-lavender bg-opacity-20 rounded-xl p-4">
            <p className="text-sm text-slate mb-1">🎤 Voice Sessions</p>
            <p className="text-3xl font-bold text-navy">{metrics.voiceSessionsPercent}%</p>
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">Today's Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Sessions" value={metrics.todayStats.sessions} />
          <StatBox label="Tokens" value={metrics.todayStats.tokens.toLocaleString()} />
          <StatBox label="Cost" value={`$${metrics.todayStats.cost}`} />
          <StatBox label="Avg Response" value={`${metrics.todayStats.avgResponseTime}ms`} />
        </div>
      </div>

      {/* Coaching Quality */}
      {quality && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">Coaching Quality Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QualityMetric
              label="Reached Options Phase"
              value={`${quality.reachedOptionsPercent}%`}
              good={quality.reachedOptionsPercent > 50}
            />
            <QualityMetric
              label="Avg Reality Depth"
              value={quality.avgRealityDepth}
              good={parseFloat(quality.avgRealityDepth) >= 10}
            />
            <QualityMetric
              label="Emotions Reflected"
              value={`${quality.emotionsReflectedPercent}%`}
              good={quality.emotionsReflectedPercent > 70}
            />
            <QualityMetric
              label="Avg Parent Ideas"
              value={quality.avgParentIdeas}
              good={parseFloat(quality.avgParentIdeas) >= 2}
            />
          </div>
        </div>
      )}

      {/* 7-Day Trends */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">7-Day Trends</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-slate font-medium">Date</th>
                <th className="text-right py-2 px-3 text-slate font-medium">API Calls</th>
                <th className="text-right py-2 px-3 text-slate font-medium">Tokens</th>
                <th className="text-right py-2 px-3 text-slate font-medium">Cost</th>
                <th className="text-right py-2 px-3 text-slate font-medium">Avg Response</th>
                <th className="text-right py-2 px-3 text-slate font-medium">Crises</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((day: any) => (
                <tr key={day.date} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-navy">{new Date(day.date).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-right text-navy">{day.apiCalls}</td>
                  <td className="py-2 px-3 text-right text-navy">{day.totalTokens.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-navy">${day.totalCost}</td>
                  <td className="py-2 px-3 text-right text-navy">{day.avgResponseTime}ms</td>
                  <td className="py-2 px-3 text-right text-navy">{day.crisisCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Live Monitor Tab
function LiveMonitorTab({ sessions }: { sessions: any[] }) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">
          Active Sessions ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate">No active sessions at the moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-slate font-medium">User</th>
                  <th className="text-left py-3 px-3 text-slate font-medium">Mode</th>
                  <th className="text-left py-3 px-3 text-slate font-medium">Phase</th>
                  <th className="text-center py-3 px-3 text-slate font-medium">Depth</th>
                  <th className="text-center py-3 px-3 text-slate font-medium">Messages</th>
                  <th className="text-center py-3 px-3 text-slate font-medium">Duration</th>
                  <th className="text-left py-3 px-3 text-slate font-medium">Last Activity</th>
                  <th className="text-center py-3 px-3 text-slate font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-navy">
                      User#{session.user_id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.mode === 'voice'
                          ? 'bg-lavender bg-opacity-20 text-navy'
                          : 'bg-teal bg-opacity-20 text-navy'
                      }`}>
                        {session.mode === 'voice' ? '🎤 Voice' : '💬 Chat'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-sage bg-opacity-20 rounded text-xs font-medium text-navy">
                        {session.current_phase}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-semibold ${
                        session.reality_exploration_depth >= 10 ? 'text-teal' : 'text-coral'
                      }`}>
                        {session.reality_exploration_depth}/10
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-navy">{session.messageCount}</td>
                    <td className="py-3 px-3 text-center text-navy">{session.duration}m</td>
                    <td className="py-3 px-3 text-slate text-xs">
                      {new Date(session.lastActivity).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <a
                        href={`/admin/session/${session.id}`}
                        className="text-teal hover:underline text-sm font-medium"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Sessions Tab
function SessionsTab({ sessions }: { sessions: any[] }) {
  const [filter, setFilter] = useState({
    mode: 'all',
    phase: 'all',
    crisis: 'all'
  });

  const filteredSessions = sessions.filter(s => {
    if (filter.mode !== 'all' && s.mode !== filter.mode) return false;
    if (filter.phase !== 'all' && s.current_phase !== filter.phase) return false;
    if (filter.crisis !== 'all' && s.crisis_level !== filter.crisis) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-navy mb-4">Filters</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Mode</label>
            <select
              value={filter.mode}
              onChange={(e) => setFilter({ ...filter, mode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-navy"
            >
              <option value="all">All</option>
              <option value="chat">Chat</option>
              <option value="voice">Voice</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Phase</label>
            <select
              value={filter.phase}
              onChange={(e) => setFilter({ ...filter, phase: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-navy"
            >
              <option value="all">All</option>
              <option value="goal">Goal</option>
              <option value="reality">Reality</option>
              <option value="options">Options</option>
              <option value="will">Will</option>
              <option value="closing">Closing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Crisis Level</label>
            <select
              value={filter.crisis}
              onChange={(e) => setFilter({ ...filter, crisis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-navy"
            >
              <option value="all">All</option>
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">
          All Sessions ({filteredSessions.length})
        </h2>
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:border-teal transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-navy">
                      User#{session.user_id.substring(0, 8)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      session.mode === 'voice'
                        ? 'bg-lavender bg-opacity-20 text-navy'
                        : 'bg-teal bg-opacity-20 text-navy'
                    }`}>
                      {session.mode}
                    </span>
                    <span className="px-2 py-0.5 bg-sage bg-opacity-20 rounded text-xs font-medium text-navy">
                      {session.current_phase}
                    </span>
                  </div>
                  <p className="text-sm text-slate">
                    Started: {new Date(session.started_at).toLocaleString()} • {session.messageCount} messages
                  </p>
                  {session.therapeutic_goal && (
                    <p className="text-sm text-navy mt-1">Goal: {session.therapeutic_goal}</p>
                  )}
                </div>
                <a
                  href={`/admin/session/${session.id}`}
                  className="px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-opacity-90"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab({ users }: { users: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">
          All Users ({users.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 text-slate font-medium">User ID</th>
                <th className="text-center py-3 px-3 text-slate font-medium">Sessions</th>
                <th className="text-center py-3 px-3 text-slate font-medium">Total Cost</th>
                <th className="text-left py-3 px-3 text-slate font-medium">Last Active</th>
                <th className="text-center py-3 px-3 text-slate font-medium">GDPR</th>
                <th className="text-center py-3 px-3 text-slate font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 text-navy font-mono text-xs">
                    {user.id.substring(0, 12)}...
                  </td>
                  <td className="py-3 px-3 text-center text-navy">{user.sessionCount}</td>
                  <td className="py-3 px-3 text-center text-navy">${user.totalCost.toFixed(4)}</td>
                  <td className="py-3 px-3 text-slate text-xs">
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.consent_given
                        ? 'bg-teal bg-opacity-20 text-navy'
                        : 'bg-coral bg-opacity-20 text-navy'
                    }`}>
                      {user.consent_given ? 'Consent' : 'No Consent'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <a
                      href={`/admin/user/${user.id}`}
                      className="text-teal hover:underline text-sm font-medium"
                    >
                      View Profile
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Waitlist Tab
function WaitlistTab({ signups }: { signups: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">
          Waitlist Signups ({signups.length})
        </h2>

        {signups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate">No waitlist signups yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-slate font-medium">Email</th>
                  <th className="text-center py-3 px-3 text-slate font-medium">Early Tester</th>
                  <th className="text-left py-3 px-3 text-slate font-medium">Signup Date</th>
                  <th className="text-center py-3 px-3 text-slate font-medium">Contacted</th>
                  <th className="text-left py-3 px-3 text-slate font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((signup) => (
                  <tr key={signup.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-navy">{signup.email}</td>
                    <td className="py-3 px-3 text-center">
                      {signup.early_tester ? (
                        <span className="px-2 py-1 bg-teal bg-opacity-20 rounded text-xs font-medium text-navy">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate text-xs">
                      {new Date(signup.signup_date).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {signup.contacted ? (
                        <span className="px-2 py-1 bg-sage bg-opacity-20 rounded text-xs font-medium text-navy">
                          ✓ Contacted
                        </span>
                      ) : (
                        <span className="text-coral font-medium">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate">{signup.source || 'landing_page'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab({ overview, trafficSources, topReferrers, topSearchQueries, topPages, llmBreakdown, deviceBreakdown, dailyTrends, realTimeVisitors }: any) {
  if (!overview) return null;

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visits"
          value={overview.totalVisits.toLocaleString()}
          subtitle="Last 7 days"
          color="teal"
        />
        <MetricCard
          title="Unique Visitors"
          value={overview.uniqueVisitors.toLocaleString()}
          subtitle="Last 7 days"
          color="lavender"
        />
        <MetricCard
          title="LLM Traffic"
          value={overview.llmTraffic}
          subtitle="AI bot visits"
          color="coral"
        />
        <MetricCard
          title="Real-Time"
          value={realTimeVisitors}
          subtitle="Visitors now"
          color="sage"
        />
      </div>

      {/* Session Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">Session Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Avg Duration" value={`${Math.floor(overview.avgSessionDuration / 60)}m ${overview.avgSessionDuration % 60}s`} />
          <StatBox label="Pages/Session" value={overview.pagesPerSession} />
          <StatBox label="Bounce Rate" value={`${overview.bounceRate}%`} />
          <StatBox label="Total Sessions" value={overview.totalSessions.toLocaleString()} />
        </div>
      </div>

      {/* Conversions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-navy mb-4">Conversions</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-teal bg-opacity-10 rounded-xl p-4">
            <p className="text-sm text-slate mb-1">📧 Signups</p>
            <p className="text-3xl font-bold text-navy">{overview.conversions.signups}</p>
          </div>
          <div className="bg-lavender bg-opacity-20 rounded-xl p-4">
            <p className="text-sm text-slate mb-1">💬 Chat Started</p>
            <p className="text-3xl font-bold text-navy">{overview.conversions.chatStarts}</p>
          </div>
          <div className="bg-sage bg-opacity-20 rounded-xl p-4">
            <p className="text-sm text-slate mb-1">🎤 Voice Started</p>
            <p className="text-3xl font-bold text-navy">{overview.conversions.voiceStarts}</p>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      {trafficSources && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">Traffic Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <TrafficSource label="Direct" count={trafficSources.direct} color="teal" />
            <TrafficSource label="Search" count={trafficSources.search} color="lavender" />
            <TrafficSource label="Social" count={trafficSources.social} color="sage" />
            <TrafficSource label="Referral" count={trafficSources.referral} color="coral" />
            <TrafficSource label="LLM" count={trafficSources.llm} color="blush" />
          </div>
        </div>
      )}

      {/* LLM Traffic Breakdown */}
      {llmBreakdown && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">🤖 LLM Traffic Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <LLMSourceBox label="ChatGPT" count={llmBreakdown.chatgpt} />
            <LLMSourceBox label="Claude" count={llmBreakdown.claude} />
            <LLMSourceBox label="Perplexity" count={llmBreakdown.perplexity} />
            <LLMSourceBox label="Gemini" count={llmBreakdown.gemini} />
            <LLMSourceBox label="Other Bots" count={llmBreakdown.other_bot} />
          </div>
        </div>
      )}

      {/* Device Breakdown */}
      {deviceBreakdown && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">Device Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            <DeviceBox label="Desktop" count={deviceBreakdown.desktop} icon="🖥️" />
            <DeviceBox label="Mobile" count={deviceBreakdown.mobile} icon="📱" />
            <DeviceBox label="Tablet" count={deviceBreakdown.tablet} icon="📲" />
          </div>
        </div>
      )}

      {/* Top Pages */}
      {topPages && topPages.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">Top Pages</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-slate font-medium">Page</th>
                  <th className="text-right py-2 px-3 text-slate font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-navy font-mono text-xs">{page.path}</td>
                    <td className="py-2 px-3 text-right text-navy font-semibold">{page.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {topReferrers && topReferrers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">Top Referrers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-slate font-medium">Domain</th>
                  <th className="text-right py-2 px-3 text-slate font-medium">Visits</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((ref: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-navy">{ref.domain}</td>
                    <td className="py-2 px-3 text-right text-navy font-semibold">{ref.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Search Queries */}
      {topSearchQueries && topSearchQueries.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">🔍 Top Search Queries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-slate font-medium">Search Query</th>
                  <th className="text-right py-2 px-3 text-slate font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {topSearchQueries.map((query: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-navy">{query.query}</td>
                    <td className="py-2 px-3 text-right text-navy font-semibold">{query.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Trends */}
      {dailyTrends && dailyTrends.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy mb-4">7-Day Trend</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-slate font-medium">Date</th>
                  <th className="text-right py-2 px-3 text-slate font-medium">Visits</th>
                </tr>
              </thead>
              <tbody>
                {dailyTrends.map((day: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-navy">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="py-2 px-3 text-right text-navy font-semibold">{day.visits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics Helper Components
function TrafficSource({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    teal: '#B7D3D8',
    lavender: '#D7CDEC',
    sage: '#E3EADD',
    coral: '#E6A897',
    blush: '#F0D9DA',
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-slate mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy">{count}</p>
      <div style={{ height: '3px', backgroundColor: colors[color], borderRadius: '9999px', marginTop: '8px' }} />
    </div>
  );
}

function LLMSourceBox({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-lavender bg-opacity-10 rounded-xl p-4">
      <p className="text-xs text-slate mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy">{count}</p>
    </div>
  );
}

function DeviceBox({ label, count, icon }: { label: string; count: number; icon: string }) {
  return (
    <div className="bg-teal bg-opacity-10 rounded-xl p-4">
      <p className="text-sm text-slate mb-1">{icon} {label}</p>
      <p className="text-3xl font-bold text-navy">{count}</p>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, subtitle, color }: any) {
  const colors: Record<string, string> = {
    teal: '#B7D3D8',
    lavender: '#D7CDEC',
    sage: '#E3EADD',
    coral: '#E6A897',
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#586C8E', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2A3F5A', marginBottom: '0.25rem' }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#586C8E' }}>{subtitle}</p>
      <div style={{ height: '0.25rem', backgroundColor: colors[color], borderRadius: '9999px', marginTop: '0.75rem' }} />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '0.75rem' }}>
      <p style={{ fontSize: '0.75rem', color: '#586C8E', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2A3F5A' }}>{value}</p>
    </div>
  );
}

function QualityMetric({ label, value, good }: { label: string; value: any; good: boolean }) {
  return (
    <div style={{
      borderRadius: '0.75rem',
      padding: '1rem',
      backgroundColor: good ? 'rgba(183, 211, 216, 0.1)' : 'rgba(230, 168, 151, 0.1)'
    }}>
      <p style={{ fontSize: '0.75rem', color: '#586C8E', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: good ? '#B7D3D8' : '#E6A897'
      }}>
        {value}
      </p>
    </div>
  );
}
