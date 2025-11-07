'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { logAdminAction } from '@/lib/admin/auth';
import { BarChart3, Users, MessageSquare, AlertTriangle, TrendingUp, Activity, RefreshCw, FileText, Database, Upload, AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';

type TabType = 'overview' | 'analytics' | 'monitor' | 'sessions' | 'users' | 'waitlist' | 'feedback' | 'knowledge';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [executiveMetrics, setExecutiveMetrics] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [realTimeVisitors, setRealTimeVisitors] = useState<number>(0);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, analyticsRes, feedbackRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/analytics?days=30'),
        fetch('/api/admin/feedback')
      ]);

      if (!dashboardRes.ok) {
        console.error('Dashboard API error:', await dashboardRes.text());
        throw new Error('Failed to fetch dashboard data');
      }

      if (!analyticsRes.ok) {
        console.error('Analytics API error:', await analyticsRes.text());
        throw new Error('Failed to fetch analytics data');
      }

      const dashboardData = await dashboardRes.json();
      const analyticsData = await analyticsRes.json();
      let feedbackDataResponse: { feedback: any[]; stats: any } = { feedback: [], stats: null };
      if (feedbackRes.ok) {
        feedbackDataResponse = await feedbackRes.json();
      } else {
        console.error('[Admin] Feedback API error:', feedbackRes.status, await feedbackRes.text());
      }

      console.log('[Admin] Dashboard data loaded:', {
        hasMetrics: !!dashboardData.executiveMetrics,
        sessionCount: dashboardData.activeSessions?.length || 0,
        userCount: dashboardData.users?.length || 0
      });
      console.log('[Admin] Analytics data loaded:', {
        hasOverview: !!analyticsData.overview,
        totalVisits: analyticsData.overview?.totalVisits || 0,
        realTimeVisitors: analyticsData.realTimeVisitors || 0
      });
      console.log('[Admin] Feedback data loaded:', {
        feedbackCount: feedbackDataResponse.feedback?.length || 0,
        avgRating: feedbackDataResponse.stats?.avgRating || 0,
        hasStats: !!feedbackDataResponse.stats
      });

      setExecutiveMetrics(dashboardData.executiveMetrics);
      setActiveSessions(dashboardData.activeSessions);
      setQualityMetrics(dashboardData.qualityMetrics);
      setTrends(dashboardData.trends);
      setUsers(dashboardData.users);
      setWaitlist(dashboardData.waitlist);
      setAllSessions(dashboardData.allSessions);
      setAnalyticsOverview(analyticsData.overview);
      setRealTimeVisitors(analyticsData.realTimeVisitors);
      setFeedbackData(feedbackDataResponse.feedback || []);
      setFeedbackStats(feedbackDataResponse.stats);
      setLastRefresh(new Date());

      await logAdminAction('view_dashboard', 'dashboard', undefined, { tab: activeTab });
    } catch (error) {
      console.error('[Admin] Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs: TabType[] = ['overview', 'analytics', 'monitor', 'sessions', 'users', 'waitlist', 'feedback', 'knowledge'];

  return (
    <AdminProtectedRoute>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
        * { font-family: 'Atkinson Hyperlegible', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Quicksand', sans-serif; font-weight: 600; }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#F9F7F3' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(215, 205, 236, 0.2)' }}>
          <div style={{ paddingLeft: '48px', paddingRight: '48px', paddingTop: '16px', paddingBottom: '12px' }}>
            {/* Title Section */}
            <div style={{ marginBottom: '12px' }}>
              <h1 style={{ color: '#2A3F5A', fontSize: '24px', margin: 0, fontWeight: '700', letterSpacing: '-0.5px' }}>
                Coaching Intelligence Center
              </h1>
              <p style={{ color: '#586C8E', fontSize: '13px', margin: '2px 0 0 0' }}>
                Real-time monitoring and coaching analytics
              </p>
            </div>

            {/* Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ color: '#586C8E', fontSize: '13px' }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={14} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', gap: '24px', borderTop: '1px solid rgba(215, 205, 236, 0.15)', paddingTop: '10px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '14px',
                    fontWeight: '600',
                    color: activeTab === tab ? '#2A3F5A' : '#586C8E',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderBottom: activeTab === tab ? '2px solid #B7D3D8' : 'none',
                    paddingBottom: '8px',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Content */}
        <main style={{ paddingLeft: '48px', paddingRight: '48px', paddingTop: '40px', paddingBottom: '40px' }}>
          {loading && !executiveMetrics ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid transparent',
                  borderTopColor: '#B7D3D8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: '#586C8E' }}>Loading dashboard...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab metrics={executiveMetrics} quality={qualityMetrics} trends={trends} />}
              {activeTab === 'analytics' && <AnalyticsTab overview={analyticsOverview} realTimeVisitors={realTimeVisitors} />}
              {activeTab === 'monitor' && <LiveMonitorTab sessions={activeSessions} />}
              {activeTab === 'sessions' && <SessionsTab sessions={allSessions} />}
              {activeTab === 'users' && <UsersTab users={users} />}
              {activeTab === 'waitlist' && <WaitlistTab signups={waitlist} />}
              {activeTab === 'feedback' && <FeedbackTab feedback={feedbackData} stats={feedbackStats} />}
              {activeTab === 'knowledge' && <KnowledgeTab />}
            </>
          )}
        </main>
      </div>
    </AdminProtectedRoute>
  );
}

function OverviewTab({ metrics, quality, trends }: any) {
  if (!metrics) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard label="Active Sessions" value={metrics.activeSessions} sublabel="Currently Online" icon={<Activity size={32} />} color="#B7D3D8" />
        <MetricCard label="Total Users" value={metrics.totalUsers} sublabel="All Time" icon={<Users size={32} />} color="#D7CDEC" />
        <MetricCard label="Total Messages" value={metrics.totalConversations} sublabel="Conversations" icon={<MessageSquare size={32} />} color="#E3EADD" />
        <MetricCard label="Crisis Alerts" value={metrics.crisisAlerts} sublabel="Flagged" icon={<AlertTriangle size={32} />} color="#E6A897" />
      </div>

      {/* 2/3 + 1/3 Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today's Activity */}
          <Card title="Today's Activity">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
              <StatItem label="Sessions" value={metrics.todayStats.sessions} />
              <StatItem label="Tokens Used" value={metrics.todayStats.tokens.toLocaleString()} />
              <StatItem label="Cost" value={`$${metrics.todayStats.cost}`} />
              <StatItem label="Avg Response" value={`${metrics.todayStats.avgResponseTime}ms`} />
            </div>
          </Card>

          {/* Coaching Quality */}
          {quality && (
            <Card title="Coaching Quality">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                <QualityItem label="Options Reached" value={`${quality.reachedOptionsPercent}%`} good={quality.reachedOptionsPercent > 50} />
                <QualityItem label="Reality Depth" value={quality.avgRealityDepth} good={parseFloat(quality.avgRealityDepth) >= 10} />
                <QualityItem label="Emotions Reflected" value={`${quality.emotionsReflectedPercent}%`} good={quality.emotionsReflectedPercent > 70} />
                <QualityItem label="Parent Ideas" value={quality.avgParentIdeas} good={parseFloat(quality.avgParentIdeas) >= 2} />
              </div>
            </Card>
          )}

          {/* Trends Table */}
          <Card title="7-Day Trends">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(215, 205, 236, 0.3)' }}>
                  <th style={{ textAlign: 'left', padding: '14px 12px', fontWeight: '600', color: '#2A3F5A' }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '14px 12px', fontWeight: '600', color: '#2A3F5A' }}>API Calls</th>
                  <th style={{ textAlign: 'right', padding: '14px 12px', fontWeight: '600', color: '#2A3F5A' }}>Tokens</th>
                  <th style={{ textAlign: 'right', padding: '14px 12px', fontWeight: '600', color: '#2A3F5A' }}>Cost</th>
                  <th style={{ textAlign: 'right', padding: '14px 12px', fontWeight: '600', color: '#2A3F5A' }}>Response</th>
                  <th style={{ textAlign: 'right', padding: '14px 12px', fontWeight: '600', color: '#2A3F5A' }}>Crises</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((day: any, idx: number) => (
                  <tr key={day.date} style={{ borderBottom: '1px solid rgba(215, 205, 236, 0.15)', backgroundColor: idx % 2 === 0 ? 'rgba(227, 234, 221, 0.08)' : 'transparent' }}>
                    <td style={{ padding: '14px 12px', color: '#2A3F5A' }}>{new Date(day.date).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right', padding: '14px 12px', color: '#586C8E' }}>{day.apiCalls}</td>
                    <td style={{ textAlign: 'right', padding: '14px 12px', color: '#586C8E' }}>{day.totalTokens.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '14px 12px', color: '#586C8E' }}>${day.totalCost}</td>
                    <td style={{ textAlign: 'right', padding: '14px 12px', color: '#586C8E' }}>{day.avgResponseTime}ms</td>
                    <td style={{ textAlign: 'right', padding: '14px 12px', color: day.crisisCount > 0 ? '#E6A897' : '#586C8E', fontWeight: day.crisisCount > 0 ? '600' : 'normal' }}>{day.crisisCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Session Distribution">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(183, 211, 216, 0.15), rgba(227, 234, 221, 0.15))', padding: '24px 16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(183, 211, 216, 0.3)' }}>
                <div style={{ fontSize: '40px', fontWeight: '700', color: '#2A3F5A', margin: 0 }}>{metrics.chatSessionsPercent}%</div>
                <div style={{ fontSize: '14px', color: '#586C8E', marginTop: '6px' }}>Chat</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.15), rgba(240, 217, 218, 0.15))', padding: '24px 16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(215, 205, 236, 0.3)' }}>
                <div style={{ fontSize: '40px', fontWeight: '700', color: '#2A3F5A', margin: 0 }}>{metrics.voiceSessionsPercent}%</div>
                <div style={{ fontSize: '14px', color: '#586C8E', marginTop: '6px' }}>Voice</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab({ overview, realTimeVisitors }: any) {
  if (!overview) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 32px', color: '#586C8E' }}>
        <AlertTriangle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p style={{ fontSize: '16px', fontWeight: '600' }}>No analytics data available</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Analytics data may be loading or unavailable for the selected time period.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard label="Total Visits" value={overview.totalVisits.toLocaleString()} sublabel="Last 30 Days" icon={<BarChart3 size={32} />} color="#B7D3D8" />
        <MetricCard label="Unique Visitors" value={overview.uniqueVisitors.toLocaleString()} sublabel="Last 30 Days" icon={<Users size={32} />} color="#D7CDEC" />
        <MetricCard label="LLM Traffic" value={overview.llmTraffic} sublabel="Bot Visits" icon={<TrendingUp size={32} />} color="#E6A897" />
        <MetricCard label="Real-Time" value={realTimeVisitors} sublabel="Now" icon={<Activity size={32} />} color="#E3EADD" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card title="Session Metrics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <StatItem label="Avg Duration" value={`${Math.floor(overview.avgSessionDuration / 60)}m`} />
            <StatItem label="Pages/Session" value={overview.pagesPerSession} />
            <StatItem label="Bounce Rate" value={`${overview.bounceRate}%`} />
            <StatItem label="Sessions" value={overview.totalSessions.toLocaleString()} />
          </div>
        </Card>

        <Card title="Conversions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(183, 211, 216, 0.15), rgba(227, 234, 221, 0.15))', padding: '16px', borderRadius: '10px', border: '1px solid rgba(183, 211, 216, 0.3)' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#2A3F5A' }}>{overview.conversions.signups}</div>
              <div style={{ fontSize: '13px', color: '#586C8E', marginTop: '4px' }}>Signups</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.15), rgba(240, 217, 218, 0.15))', padding: '16px', borderRadius: '10px', border: '1px solid rgba(215, 205, 236, 0.3)' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#2A3F5A' }}>{overview.conversions.chatStarts}</div>
              <div style={{ fontSize: '13px', color: '#586C8E', marginTop: '4px' }}>Chat Started</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LiveMonitorTab({ sessions }: { sessions: any[] }) {
  return (
    <Card title={`Active Sessions (${sessions.length})`}>
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 32px', color: '#586C8E' }}>No active sessions</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ background: 'rgba(227, 234, 221, 0.3)', borderBottom: '1px solid rgba(215, 205, 236, 0.2)' }}>
              <th style={{ textAlign: 'left', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>User</th>
              <th style={{ textAlign: 'left', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>Mode</th>
              <th style={{ textAlign: 'left', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>Phase</th>
              <th style={{ textAlign: 'center', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>Depth</th>
              <th style={{ textAlign: 'center', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>Msgs</th>
              <th style={{ textAlign: 'center', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>Dur</th>
              <th style={{ textAlign: 'left', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>Last Activity</th>
              <th style={{ textAlign: 'center', padding: '16px 16px', fontWeight: '600', color: '#2A3F5A' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, idx) => (
              <tr key={session.id} style={{ borderBottom: '1px solid rgba(215, 205, 236, 0.1)', backgroundColor: idx % 2 === 0 ? 'rgba(227, 234, 221, 0.05)' : 'transparent' }}>
                <td style={{ padding: '16px', color: '#2A3F5A', fontWeight: '500' }}>User#{session.user_id ? session.user_id.substring(0, 8) : 'unknown'}</td>
                <td style={{ padding: '16px' }}><Badge text={session.mode} /></td>
                <td style={{ padding: '16px' }}><Badge text={session.current_phase} /></td>
                <td style={{ textAlign: 'center', padding: '16px', color: session.reality_exploration_depth >= 10 ? '#B7D3D8' : '#E6A897', fontWeight: '600' }}>{session.reality_exploration_depth}/10</td>
                <td style={{ textAlign: 'center', padding: '16px', color: '#586C8E' }}>{session.messageCount}</td>
                <td style={{ textAlign: 'center', padding: '16px', color: '#586C8E' }}>{session.duration}m</td>
                <td style={{ padding: '16px', color: '#586C8E', fontSize: '14px' }}>{new Date(session.lastActivity).toLocaleTimeString()}</td>
                <td style={{ textAlign: 'center', padding: '16px' }}><a href={`/admin/session/${session.id}`} style={{ color: '#B7D3D8', fontWeight: '600', textDecoration: 'none' }}>View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function SessionsTab({ sessions }: { sessions: any[] }) {
  const [filter, setFilter] = useState({ mode: 'all', phase: 'all', crisis: 'all' });
  const filteredSessions = sessions.filter(s => {
    if (filter.mode !== 'all' && s.mode !== filter.mode) return false;
    if (filter.phase !== 'all' && s.current_phase !== filter.phase) return false;
    if (filter.crisis !== 'all' && s.crisis_level !== filter.crisis) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card title="Filters">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <SelectField label="Mode" value={filter.mode} onChange={(v) => setFilter({ ...filter, mode: v })} options={['all', 'chat', 'voice']} />
          <SelectField label="Phase" value={filter.phase} onChange={(v) => setFilter({ ...filter, phase: v })} options={['all', 'goal', 'reality', 'options', 'will', 'closing']} />
          <SelectField label="Crisis" value={filter.crisis} onChange={(v) => setFilter({ ...filter, crisis: v })} options={['all', 'none', 'low', 'medium', 'high']} />
        </div>
      </Card>

      <Card title={`Sessions (${filteredSessions.length})`}>
        {filteredSessions.map((session, idx) => (
          <div key={session.id} style={{ padding: '20px', borderBottom: idx !== filteredSessions.length - 1 ? '1px solid rgba(215, 205, 236, 0.15)' : 'none', backgroundColor: idx % 2 === 0 ? 'rgba(227, 234, 221, 0.05)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#2A3F5A' }}>User#{session.user_id ? session.user_id.substring(0, 8) : 'unknown'}</span>
                <Badge text={session.mode} />
                <Badge text={session.current_phase} />
              </div>
              <p style={{ fontSize: '14px', color: '#586C8E', margin: '6px 0' }}>Started: {new Date(session.started_at).toLocaleString()}</p>
              {session.therapeutic_goal && <p style={{ fontSize: '14px', color: '#2A3F5A', margin: '6px 0 0 0' }}>Goal: {session.therapeutic_goal}</p>}
            </div>
            <a href={`/admin/session/${session.id}`} style={{ background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)', color: 'white', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', marginLeft: '16px' }}>View</a>
          </div>
        ))}
      </Card>
    </div>
  );
}

function UsersTab({ users }: { users: any[] }) {
  return (
    <Card title={`Users (${users.length})`}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr style={{ background: 'rgba(227, 234, 221, 0.3)', borderBottom: '1px solid rgba(215, 205, 236, 0.2)' }}>
            <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>User ID</th>
            <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Sessions</th>
            <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Cost</th>
            <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Last Active</th>
            <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>GDPR</th>
            <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id} style={{ borderBottom: '1px solid rgba(215, 205, 236, 0.1)', backgroundColor: idx % 2 === 0 ? 'rgba(227, 234, 221, 0.05)' : 'transparent' }}>
              <td style={{ padding: '16px', color: '#2A3F5A', fontFamily: 'monospace', fontSize: '14px' }}>{user.id.substring(0, 12)}...</td>
              <td style={{ textAlign: 'center', padding: '16px', color: '#586C8E' }}>{user.sessionCount}</td>
              <td style={{ textAlign: 'center', padding: '16px', color: '#586C8E' }}>${user.totalCost.toFixed(4)}</td>
              <td style={{ padding: '16px', color: '#586C8E', fontSize: '14px' }}>{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</td>
              <td style={{ textAlign: 'center', padding: '16px' }}><Badge text={user.consent_given ? 'Yes' : 'No'} /></td>
              <td style={{ textAlign: 'center', padding: '16px' }}><a href={`/admin/user/${user.id}`} style={{ color: '#B7D3D8', fontWeight: '600', textDecoration: 'none' }}>View</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function WaitlistTab({ signups }: { signups: any[] }) {
  return (
    <Card title={`Waitlist (${signups.length})`}>
      {signups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 32px', color: '#586C8E' }}>No signups yet</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ background: 'rgba(227, 234, 221, 0.3)', borderBottom: '1px solid rgba(215, 205, 236, 0.2)' }}>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Email</th>
              <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Early Tester</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Signup Date</th>
              <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Contacted</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {signups.map((signup, idx) => (
              <tr key={signup.id} style={{ borderBottom: '1px solid rgba(215, 205, 236, 0.1)', backgroundColor: idx % 2 === 0 ? 'rgba(227, 234, 221, 0.05)' : 'transparent' }}>
                <td style={{ padding: '16px', color: '#2A3F5A' }}>{signup.email}</td>
                <td style={{ textAlign: 'center', padding: '16px' }}><Badge text={signup.early_tester ? 'Yes' : 'No'} /></td>
                <td style={{ padding: '16px', color: '#586C8E', fontSize: '14px' }}>{new Date(signup.signup_date).toLocaleString()}</td>
                <td style={{ textAlign: 'center', padding: '16px' }}><Badge text={signup.contacted ? '✓' : 'Pending'} /></td>
                <td style={{ padding: '16px', color: '#586C8E', fontSize: '14px' }}>{signup.source || 'landing_page'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// Components
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid rgba(215, 205, 236, 0.2)' }}>
      <div style={{ padding: '28px', borderBottom: '1px solid rgba(215, 205, 236, 0.15)' }}>
        <h2 style={{ color: '#2A3F5A', fontSize: '18px', margin: 0, fontWeight: '600' }}>{title}</h2>
      </div>
      <div style={{ padding: '28px' }}>
        {children}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sublabel, icon, color }: any) {
  return (
    <div style={{ background: 'white', border: '1px solid rgba(215, 205, 236, 0.2)', borderRadius: '10px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#586C8E', marginBottom: '10px' }}>{label}</div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#2A3F5A', marginBottom: '6px' }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#586C8E' }}>{sublabel}</div>
      </div>
      <div style={{ background: `${color}25`, borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        {icon}
      </div>
    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#586C8E', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '700', color: '#2A3F5A' }}>{value}</div>
    </div>
  );
}

function QualityItem({ label, value, good }: any) {
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#586C8E', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '700', color: good ? '#B7D3D8' : '#E6A897' }}>{value}</div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span style={{ background: 'rgba(227, 234, 221, 0.3)', color: '#2A3F5A', padding: '4px 10px', borderRadius: '14px', fontSize: '12px', fontWeight: '600' }}>
      {text}
    </span>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#2A3F5A', marginBottom: '6px' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(215, 205, 236, 0.3)', borderRadius: '6px', fontSize: '14px', color: '#2A3F5A' }}>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}

function FeedbackTab({ feedback, stats }: { feedback: any[]; stats: any }) {
  const [filter, setFilter] = useState({ rating: 'all', hasSession: 'all' });
  const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set());

  const filteredFeedback = feedback.filter(f => {
    if (filter.rating !== 'all') {
      if (filter.rating === 'low' && (f.rating < 1 || f.rating > 3)) return false;
      if (filter.rating === 'medium' && (f.rating < 4 || f.rating > 6)) return false;
      if (filter.rating === 'high' && (f.rating < 7 || f.rating > 8)) return false;
      if (filter.rating === 'excellent' && (f.rating < 9 || f.rating > 10)) return false;
    }
    if (filter.hasSession !== 'all') {
      if (filter.hasSession === 'yes' && !f.session_id) return false;
      if (filter.hasSession === 'no' && f.session_id) return false;
    }
    return true;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return '#B7D3D8'; // Green
    if (rating >= 7) return '#E3EADD'; // Light green
    if (rating >= 4) return '#F0D9DA'; // Yellow/orange
    return '#E6A897'; // Red
  };

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedFeedback);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedFeedback(newSet);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!feedback || feedback.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 32px', color: '#586C8E' }}>
        <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p style={{ fontSize: '16px', fontWeight: '600' }}>No feedback data available</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Feedback will appear here once users submit ratings.</p>
      </div>
    );
  }

  // Use default stats if unavailable
  const safeStats = stats || {
    totalFeedback: feedback.length,
    avgRating: feedback.length > 0
      ? feedback.reduce((sum: number, f: any) => sum + f.rating, 0) / feedback.length
      : 0,
    ratingDistribution: {
      low: feedback.filter((f: any) => f.rating >= 1 && f.rating <= 3).length,
      medium: feedback.filter((f: any) => f.rating >= 4 && f.rating <= 6).length,
      high: feedback.filter((f: any) => f.rating >= 7 && f.rating <= 8).length,
      excellent: feedback.filter((f: any) => f.rating >= 9 && f.rating <= 10).length,
    },
    latestFeedback: feedback[0]?.submitted_at || null,
    responseRate: 0,
    totalSessions: 0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard
          label="Total Feedback"
          value={safeStats.totalFeedback}
          sublabel="All Time"
          icon={<MessageSquare size={32} />}
          color="#B7D3D8"
        />
        <MetricCard
          label="Average Rating"
          value={safeStats.avgRating.toFixed(1)}
          sublabel={`${safeStats.ratingDistribution.excellent} Excellent`}
          icon={<TrendingUp size={32} />}
          color={safeStats.avgRating >= 8 ? '#B7D3D8' : safeStats.avgRating >= 6 ? '#E3EADD' : '#E6A897'}
        />
        <MetricCard
          label="Response Rate"
          value={`${safeStats.responseRate}%`}
          sublabel={`${safeStats.totalFeedback}/${safeStats.totalSessions} Sessions`}
          icon={<Activity size={32} />}
          color="#D7CDEC"
        />
        <MetricCard
          label="Latest Feedback"
          value={safeStats.latestFeedback ? new Date(safeStats.latestFeedback).toLocaleDateString() : 'N/A'}
          sublabel={safeStats.latestFeedback ? new Date(safeStats.latestFeedback).toLocaleTimeString() : ''}
          icon={<BarChart3 size={32} />}
          color="#E3EADD"
        />
      </div>

      {/* Rating Distribution */}
      <Card title="Rating Distribution">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <StatItem label="1-3 (Low)" value={safeStats.ratingDistribution.low} />
          <StatItem label="4-6 (Medium)" value={safeStats.ratingDistribution.medium} />
          <StatItem label="7-8 (High)" value={safeStats.ratingDistribution.high} />
          <StatItem label="9-10 (Excellent)" value={safeStats.ratingDistribution.excellent} />
        </div>
      </Card>

      {/* Filters */}
      <Card title="Filters">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <SelectField
            label="Rating Range"
            value={filter.rating}
            onChange={(v) => setFilter({ ...filter, rating: v })}
            options={['all', 'low', 'medium', 'high', 'excellent']}
          />
          <SelectField
            label="Has Session Link"
            value={filter.hasSession}
            onChange={(v) => setFilter({ ...filter, hasSession: v })}
            options={['all', 'yes', 'no']}
          />
        </div>
      </Card>

      {/* Feedback Table */}
      <Card title={`Feedback (${filteredFeedback.length})`}>
        {filteredFeedback.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px', color: '#586C8E' }}>No feedback matches filters</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ background: 'rgba(227, 234, 221, 0.3)', borderBottom: '1px solid rgba(215, 205, 236, 0.2)' }}>
                <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>User</th>
                <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Feedback</th>
                <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Session</th>
                <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Submitted</th>
                <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#2A3F5A' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedback.map((item, idx) => {
                const isExpanded = expandedFeedback.has(item.id);
                const displayText = isExpanded ? item.feedback_text : truncateText(item.feedback_text, 80);

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(215, 205, 236, 0.1)', backgroundColor: idx % 2 === 0 ? 'rgba(227, 234, 221, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '16px', color: '#2A3F5A', fontFamily: 'monospace', fontSize: '13px' }}>
                      <a href={`/admin/user/${item.user_id}`} style={{ color: '#B7D3D8', textDecoration: 'none' }}>
                        {item.user_id.substring(0, 8)}...
                      </a>
                    </td>
                    <td style={{ textAlign: 'center', padding: '16px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: getRatingColor(item.rating),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: '#2A3F5A',
                        fontSize: '16px',
                        margin: '0 auto'
                      }}>
                        {item.rating}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#2A3F5A', maxWidth: '400px' }}>
                      {displayText}
                      {item.feedback_text.length > 80 && (
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          style={{
                            marginLeft: '8px',
                            color: '#B7D3D8',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'underline'
                          }}
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {item.session_id ? (
                        <a href={`/admin/session/${item.session_id}`} style={{ color: '#B7D3D8', fontWeight: '600', textDecoration: 'none' }}>
                          View Session
                        </a>
                      ) : (
                        <span style={{ color: '#586C8E', fontSize: '13px' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#586C8E', fontSize: '14px' }}>
                      {new Date(item.submitted_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center', padding: '16px' }}>
                      <a href={`/admin/user/${item.user_id}`} style={{ color: '#B7D3D8', fontWeight: '600', textDecoration: 'none' }}>
                        View User
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// KNOWLEDGE BASE TAB - RAG Content Management
// ============================================================================

function KnowledgeTab() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [processingDocs, setProcessingDocs] = useState<any[]>([]);
  const [flaggedChunks, setFlaggedChunks] = useState<any[]>([]);
  const [knowledgeBaseChunks, setKnowledgeBaseChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  // Mock data for now - will connect to API later
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setDocuments([
        { id: '1', title: 'Dr Barkley ADHD Guide.pdf', status: 'completed', chunks: 142, approved: 128, flagged: 12, rejected: 2, uploadedAt: '2025-11-07T10:00:00Z' },
        { id: '2', title: 'Morning Routines Research.md', status: 'processing', chunks: 0, uploadedAt: '2025-11-07T11:30:00Z' }
      ]);
      setProcessingDocs([
        { id: '2', title: 'Morning Routines Research.md', progress: 45, stage: 'Quality filtering chunks...' }
      ]);
      setFlaggedChunks([
        { id: 'c1', text: 'Consider implementing a reward system for positive behaviors. Rewards can be effective when used consistently...', source: 'Dr Barkley ADHD Guide.pdf', confidence: 0.65, reasoning: 'Generic advice that may not be ADHD-specific enough' },
        { id: 'c2', text: 'Consistency is key when managing ADHD behaviors...', source: 'Dr Barkley ADHD Guide.pdf', confidence: 0.58, reasoning: 'Lacks specific actionable steps' }
      ]);
      setKnowledgeBaseChunks([
        { id: 'kb1', text: 'Break homework into 15-minute chunks using a visible timer. Research shows ADHD children perform better with time-boxed tasks...', source: 'Dr Barkley ADHD Guide.pdf', tags: ['homework', 'time-management'], confidence: 0.92 },
        { id: 'kb2', text: 'Morning routines should include movement breaks. ADHD brains need physical activity to regulate attention...', source: 'Morning Routines Research.md', tags: ['morning-routine', 'exercise'], confidence: 0.88 }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  function handleFileUpload(files: FileList) {
    console.log('Files to upload:', files);
    // Will implement API call later
    alert(`Would upload ${files.length} file(s)`);
  }

  function handleURLSubmit(url: string) {
    console.log('URL to process:', url);
    // Will implement API call later
    alert(`Would process URL: ${url}`);
  }

  function handleApproveChunk(chunkId: string) {
    console.log('Approve chunk:', chunkId);
    setFlaggedChunks(prev => prev.filter(c => c.id !== chunkId));
  }

  function handleRejectChunk(chunkId: string) {
    console.log('Reject chunk:', chunkId);
    setFlaggedChunks(prev => prev.filter(c => c.id !== chunkId));
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid transparent',
            borderTopColor: '#B7D3D8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#586C8E' }}>Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard
          label="Total Documents"
          value={documents.length}
          sublabel="Uploaded"
          icon={<FileText size={32} />}
          color="#B7D3D8"
        />
        <MetricCard
          label="Knowledge Chunks"
          value={knowledgeBaseChunks.length}
          sublabel="Approved & Ready"
          icon={<Database size={32} />}
          color="#D7CDEC"
        />
        <MetricCard
          label="Needs Review"
          value={flaggedChunks.length}
          sublabel="Flagged Content"
          icon={<AlertCircle size={32} />}
          color="#E6A897"
        />
        <MetricCard
          label="Processing"
          value={processingDocs.length}
          sublabel="In Queue"
          icon={<RefreshCw size={32} />}
          color="#E3EADD"
        />
      </div>

      {/* Upload Section */}
      <Card title="Upload Content">
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={() => setUploadMode('file')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: uploadMode === 'file' ? 'linear-gradient(135deg, #D7CDEC, #B7D3D8)' : '#E3EADD',
                color: uploadMode === 'file' ? 'white' : '#586C8E',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Upload size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Upload Files
            </button>
            <button
              onClick={() => setUploadMode('url')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: uploadMode === 'url' ? 'linear-gradient(135deg, #D7CDEC, #B7D3D8)' : '#E3EADD',
                color: uploadMode === 'url' ? 'white' : '#586C8E',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Add URL
            </button>
          </div>

          {uploadMode === 'file' ? (
            <FileUploadZone onUpload={handleFileUpload} />
          ) : (
            <URLInputForm onSubmit={handleURLSubmit} />
          )}
        </div>

        <div style={{
          padding: '16px',
          background: 'rgba(183, 211, 216, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(183, 211, 216, 0.3)'
        }}>
          <p style={{ color: '#2A3F5A', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            AI Quality Filtering
          </p>
          <p style={{ color: '#586C8E', fontSize: '13px', margin: 0 }}>
            All uploaded content is automatically evaluated by AI. High-quality, ADHD-specific guidance is auto-approved.
            Generic or potentially harmful content is filtered out. Medium-confidence content is flagged for your review below.
          </p>
        </div>
      </Card>

      {/* Processing Queue */}
      {processingDocs.length > 0 && (
        <Card title="Processing Queue">
          <ProcessingQueue documents={processingDocs} />
        </Card>
      )}

      {/* Review Queue */}
      {flaggedChunks.length > 0 && (
        <Card title="Needs Review - Medium Confidence Content">
          <p style={{ color: '#586C8E', fontSize: '14px', marginBottom: '16px' }}>
            These chunks scored 0.5-0.7 confidence. Review and approve/reject manually.
          </p>
          <ReviewQueue
            chunks={flaggedChunks}
            onApprove={handleApproveChunk}
            onReject={handleRejectChunk}
          />
        </Card>
      )}

      {/* Source Documents Table */}
      <Card title="Source Documents">
        <SourceDocumentsTable documents={documents} />
      </Card>

      {/* Knowledge Base Browser */}
      <Card title="Knowledge Base - Approved Chunks">
        <KnowledgeBaseBrowser chunks={knowledgeBaseChunks} />
      </Card>
    </div>
  );
}

// Helper Component: File Upload Zone
function FileUploadZone({ onUpload }: { onUpload: (files: FileList) => void }) {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onClick={() => inputRef?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
          onUpload(e.dataTransfer.files);
        }
      }}
      style={{
        border: `2px dashed ${isDragging ? '#B7D3D8' : '#D7CDEC'}`,
        borderRadius: '10px',
        padding: '48px',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragging ? 'rgba(183, 211, 216, 0.1)' : 'rgba(215, 205, 236, 0.05)',
        transition: 'all 0.2s'
      }}
    >
      <Upload size={48} style={{ color: isDragging ? '#B7D3D8' : '#D7CDEC', marginBottom: '16px' }} />
      <p style={{ color: '#2A3F5A', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
        {isDragging ? 'Drop files here' : 'Drop files here or click to upload'}
      </p>
      <p style={{ color: '#586C8E', fontSize: '14px', margin: 0 }}>
        Supports: PDF, Markdown, Text files
      </p>
      <input
        ref={(el) => setInputRef(el)}
        type="file"
        multiple
        accept=".pdf,.md,.txt"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
    </div>
  );
}

// Helper Component: URL Input Form
function URLInputForm({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState('');

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/article or https://youtube.com/watch?v=..."
        style={{
          flex: 1,
          padding: '12px 16px',
          border: '1px solid rgba(215, 205, 236, 0.3)',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#2A3F5A'
        }}
      />
      <button
        onClick={() => {
          if (url) {
            onSubmit(url);
            setUrl('');
          }
        }}
        disabled={!url}
        style={{
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          background: url ? 'linear-gradient(135deg, #D7CDEC, #B7D3D8)' : '#E3EADD',
          color: 'white',
          fontWeight: '600',
          cursor: url ? 'pointer' : 'not-allowed',
          opacity: url ? 1 : 0.5,
          transition: 'all 0.2s'
        }}
      >
        Add URL
      </button>
    </div>
  );
}

// Helper Component: Processing Queue
function ProcessingQueue({ documents }: { documents: any[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          style={{
            padding: '16px',
            background: 'rgba(227, 234, 221, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(227, 234, 221, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={20} style={{ color: '#B7D3D8', animation: 'spin 2s linear infinite' }} />
              <div>
                <p style={{ color: '#2A3F5A', fontSize: '15px', fontWeight: '600', margin: 0 }}>
                  {doc.title}
                </p>
                <p style={{ color: '#586C8E', fontSize: '13px', margin: '4px 0 0 0' }}>
                  {doc.stage}
                </p>
              </div>
            </div>
            <span style={{ color: '#B7D3D8', fontSize: '18px', fontWeight: '700' }}>
              {doc.progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(183, 211, 216, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${doc.progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #D7CDEC, #B7D3D8)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper Component: Review Queue
function ReviewQueue({
  chunks,
  onApprove,
  onReject
}: {
  chunks: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {chunks.map((chunk) => (
        <div
          key={chunk.id}
          style={{
            padding: '20px',
            background: 'rgba(230, 168, 151, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(230, 168, 151, 0.2)'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{
                color: '#586C8E',
                fontSize: '13px',
                background: 'rgba(215, 205, 236, 0.2)',
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                {chunk.source}
              </span>
              <span style={{
                color: '#E6A897',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                {(chunk.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <p style={{ color: '#2A3F5A', fontSize: '15px', lineHeight: '1.6', margin: '12px 0' }}>
              {chunk.text}
            </p>
            <div style={{
              padding: '12px',
              background: 'rgba(183, 211, 216, 0.1)',
              borderRadius: '6px',
              marginTop: '12px'
            }}>
              <p style={{ color: '#586C8E', fontSize: '13px', margin: 0 }}>
                <strong>AI Reasoning:</strong> {chunk.reasoning}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onApprove(chunk.id)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg, #B7D3D8, #E3EADD)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <CheckCircle size={18} />
              Approve & Add to Knowledge Base
            </button>
            <button
              onClick={() => onReject(chunk.id)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(230, 168, 151, 0.3)',
                background: 'white',
                color: '#E6A897',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <XCircle size={18} />
              Reject & Discard
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper Component: Source Documents Table
function SourceDocumentsTable({ documents }: { documents: any[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr style={{ background: 'rgba(227, 234, 221, 0.3)', borderBottom: '1px solid rgba(215, 205, 236, 0.2)' }}>
          <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#2A3F5A' }}>Document</th>
          <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: '600', color: '#2A3F5A' }}>Status</th>
          <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: '600', color: '#2A3F5A' }}>Chunks</th>
          <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: '600', color: '#2A3F5A' }}>Approved</th>
          <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: '600', color: '#2A3F5A' }}>Flagged</th>
          <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: '600', color: '#2A3F5A' }}>Rejected</th>
          <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#2A3F5A' }}>Uploaded</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc, idx) => (
          <tr
            key={doc.id}
            style={{
              borderBottom: '1px solid rgba(215, 205, 236, 0.1)',
              backgroundColor: idx % 2 === 0 ? 'rgba(227, 234, 221, 0.05)' : 'transparent'
            }}
          >
            <td style={{ padding: '14px 16px', color: '#2A3F5A' }}>
              <FileText size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#B7D3D8' }} />
              {doc.title}
            </td>
            <td style={{ textAlign: 'center', padding: '14px 16px' }}>
              <Badge
                text={doc.status}
              />
            </td>
            <td style={{ textAlign: 'center', padding: '14px 16px', color: '#586C8E' }}>{doc.chunks || 0}</td>
            <td style={{ textAlign: 'center', padding: '14px 16px', color: '#B7D3D8', fontWeight: '600' }}>{doc.approved || 0}</td>
            <td style={{ textAlign: 'center', padding: '14px 16px', color: '#E6A897', fontWeight: '600' }}>{doc.flagged || 0}</td>
            <td style={{ textAlign: 'center', padding: '14px 16px', color: '#586C8E' }}>{doc.rejected || 0}</td>
            <td style={{ padding: '14px 16px', color: '#586C8E', fontSize: '13px' }}>
              {new Date(doc.uploadedAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Helper Component: Knowledge Base Browser
function KnowledgeBaseBrowser({ chunks }: { chunks: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = ['all', ...Array.from(new Set(chunks.flatMap(c => c.tags)))];

  const filteredChunks = chunks.filter(chunk => {
    const matchesSearch = !searchTerm || chunk.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || chunk.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search chunks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: '1px solid rgba(215, 205, 236, 0.3)',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2A3F5A'
          }}
        />
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid rgba(215, 205, 236, 0.3)',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2A3F5A',
            cursor: 'pointer'
          }}
        >
          {allTags.map(tag => (
            <option key={tag} value={tag}>
              {tag === 'all' ? 'All Topics' : tag}
            </option>
          ))}
        </select>
      </div>

      {/* Chunks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredChunks.map((chunk) => (
          <div
            key={chunk.id}
            style={{
              padding: '16px',
              background: 'rgba(183, 211, 216, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(183, 211, 216, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {chunk.tags.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(215, 205, 236, 0.3)',
                      color: '#2A3F5A',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{
                color: '#B7D3D8',
                fontSize: '13px',
                fontWeight: '700'
              }}>
                {(chunk.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p style={{ color: '#2A3F5A', fontSize: '14px', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              {chunk.text}
            </p>
            <p style={{ color: '#586C8E', fontSize: '12px', margin: 0 }}>
              Source: {chunk.source}
            </p>
          </div>
        ))}
      </div>

      {filteredChunks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 32px', color: '#586C8E' }}>
          <Database size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', fontWeight: '600' }}>No chunks found</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
