'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { logAdminAction } from '@/lib/admin/auth';
import { BarChart3, Users, MessageSquare, AlertTriangle, TrendingUp, Activity, RefreshCw } from 'lucide-react';

type TabType = 'overview' | 'analytics' | 'monitor' | 'sessions' | 'users' | 'waitlist';

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/analytics?days=7')
      ]);

      if (!dashboardRes.ok || !analyticsRes.ok) throw new Error('Failed to fetch');

      const dashboardData = await dashboardRes.json();
      const analyticsData = await analyticsRes.json();

      setExecutiveMetrics(dashboardData.executiveMetrics);
      setActiveSessions(dashboardData.activeSessions);
      setQualityMetrics(dashboardData.qualityMetrics);
      setTrends(dashboardData.trends);
      setUsers(dashboardData.users);
      setWaitlist(dashboardData.waitlist);
      setAllSessions(dashboardData.allSessions);
      setAnalyticsOverview(analyticsData.overview);
      setRealTimeVisitors(analyticsData.realTimeVisitors);
      setLastRefresh(new Date());

      await logAdminAction('view_dashboard', 'dashboard', undefined, { tab: activeTab });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs: TabType[] = ['overview', 'analytics', 'monitor', 'sessions', 'users', 'waitlist'];

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
          <div style={{ paddingLeft: '48px', paddingRight: '48px', paddingTop: '32px', paddingBottom: '32px' }}>
            {/* Title Section */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ color: '#2A3F5A', fontSize: '40px', margin: 0, fontWeight: '700', letterSpacing: '-0.5px' }}>
                Coaching Intelligence Center
              </h1>
              <p style={{ color: '#586C8E', fontSize: '17px', margin: '6px 0 0 0' }}>
                Real-time monitoring and coaching analytics
              </p>
            </div>

            {/* Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ color: '#586C8E', fontSize: '15px' }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={18} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', gap: '32px', borderTop: '1px solid rgba(215, 205, 236, 0.15)', paddingTop: '20px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: activeTab === tab ? '#2A3F5A' : '#586C8E',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderBottom: activeTab === tab ? '3px solid #B7D3D8' : 'none',
                    paddingBottom: '12px',
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
  if (!overview) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard label="Total Visits" value={overview.totalVisits.toLocaleString()} sublabel="Last 7 Days" icon={<BarChart3 size={32} />} color="#B7D3D8" />
        <MetricCard label="Unique Visitors" value={overview.uniqueVisitors.toLocaleString()} sublabel="Last 7 Days" icon={<Users size={32} />} color="#D7CDEC" />
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
