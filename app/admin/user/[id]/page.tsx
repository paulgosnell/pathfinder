'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { logAdminAction } from '@/lib/admin/auth';
import { ArrowLeft } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);

        // Fetch from API route (uses service role, bypasses RLS)
        const response = await fetch(`/api/admin/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();

        // Format data to match expected structure
        setUserData({
          user: data.user,
          profile: data.profile,
          sessions: data.sessions,
          performance: data.performance,
          metrics: data.metrics
        });

        // Log admin action
        await logAdminAction('view_user_profile', 'user', userId);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <AdminProtectedRoute>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
          * { font-family: 'Atkinson Hyperlegible', sans-serif; }
          h1, h2, h3, h4, h5, h6 { font-family: 'Quicksand', sans-serif; font-weight: 600; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ minHeight: '100vh', backgroundColor: '#F9F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <p style={{ color: '#586C8E' }}>Loading user profile...</p>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  if (error || !userData) {
    return (
      <AdminProtectedRoute>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
          * { font-family: 'Atkinson Hyperlegible', sans-serif; }
          h1, h2, h3, h4, h5, h6 { font-family: 'Quicksand', sans-serif; font-weight: 600; }
        `}</style>
        <div style={{ minHeight: '100vh', backgroundColor: '#F9F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: 'white', borderRadius: '10px', padding: '32px', textAlign: 'center', border: '1px solid rgba(215, 205, 236, 0.2)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2A3F5A', marginBottom: '16px' }}>Error</h2>
            <p style={{ color: '#586C8E', marginBottom: '24px' }}>{error || 'User not found'}</p>
            <button
              onClick={() => router.push('/admin')}
              style={{
                background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  const { user, profile, sessions, performance, metrics } = userData;

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
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 48px' }}>
            <button
              onClick={() => router.push('/admin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#B7D3D8',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                padding: 0
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2A3F5A', margin: 0, letterSpacing: '-0.5px' }}>
              User Profile
            </h1>
            <p style={{ fontSize: '13px', color: '#586C8E', marginTop: '4px', fontFamily: 'monospace' }}>
              {userId}
            </p>
          </div>
        </header>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            {/* Left Column: User Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Account Info */}
              <Card title="Account">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <InfoRow label="User ID" value={userId.substring(0, 12) + '...'} />
                  <InfoRow label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
                  <InfoRow
                    label="GDPR Consent"
                    value={<Badge text={user.consent_given ? 'Given' : 'Not Given'} color={user.consent_given ? '#B7D3D8' : '#E6A897'} />}
                  />
                  {user.consent_timestamp && (
                    <InfoRow
                      label="Consent Date"
                      value={new Date(user.consent_timestamp).toLocaleDateString()}
                    />
                  )}
                  {user.gdpr_delete_at && (
                    <InfoRow
                      label="Scheduled Deletion"
                      value={new Date(user.gdpr_delete_at).toLocaleDateString()}
                    />
                  )}
                </div>
              </Card>

              {/* Usage Stats */}
              <Card title="Usage Stats">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <InfoRow label="Total Sessions" value={metrics.totalSessions} />
                  <InfoRow label="Total Tokens" value={metrics.totalTokens.toLocaleString()} />
                  <InfoRow label="Total Cost" value={`$${metrics.totalCost.toFixed(4)}`} />
                  <InfoRow label="Avg Response Time" value={`${metrics.avgResponseTime}ms`} />
                </div>
              </Card>

              {/* Learned Profile */}
              {profile && (
                <Card title="Learned Context">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {profile.child_age_range && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#586C8E', marginBottom: '6px', fontWeight: '600' }}>Child Age Range</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#2A3F5A' }}>{profile.child_age_range}</p>
                      </div>
                    )}

                    {profile.parent_stress_level && profile.parent_stress_level !== 'unknown' && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#586C8E', marginBottom: '6px', fontWeight: '600' }}>Parent Stress Level</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#2A3F5A', textTransform: 'capitalize' }}>{profile.parent_stress_level}</p>
                      </div>
                    )}

                    {profile.common_triggers && profile.common_triggers.length > 0 && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#586C8E', marginBottom: '8px', fontWeight: '600' }}>Common Triggers</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {profile.common_triggers.map((trigger: string, idx: number) => (
                            <span key={idx} style={{ background: 'rgba(230, 168, 151, 0.3)', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', color: '#2A3F5A', fontWeight: '500' }}>
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.home_constraints && profile.home_constraints.length > 0 && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#586C8E', marginBottom: '8px', fontWeight: '600' }}>Home Constraints</p>
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {profile.home_constraints.map((constraint: string, idx: number) => (
                            <li key={idx} style={{ fontSize: '14px', color: '#2A3F5A', lineHeight: '1.5' }}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {profile.successful_strategies && profile.successful_strategies.length > 0 && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#586C8E', marginBottom: '8px', fontWeight: '600' }}>Successful Strategies</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {profile.successful_strategies.map((strategy: string, idx: number) => (
                            <span key={idx} style={{ background: 'rgba(183, 211, 216, 0.3)', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', color: '#2A3F5A', fontWeight: '500' }}>
                              {strategy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.failed_strategies && profile.failed_strategies.length > 0 && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#586C8E', marginBottom: '8px', fontWeight: '600' }}>Failed Strategies</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {profile.failed_strategies.map((strategy: string, idx: number) => (
                            <span key={idx} style={{ background: 'rgba(88, 108, 142, 0.15)', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', color: '#586C8E', fontWeight: '500', textDecoration: 'line-through' }}>
                              {strategy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: Session History */}
            <div>
              <Card title={`Session History (${sessions.length})`}>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 32px', color: '#586C8E' }}>
                    <p>No sessions yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '900px', overflowY: 'auto', paddingRight: '8px' }}>
                    {sessions.map((session: any) => (
                      <div
                        key={session.id}
                        style={{
                          border: '1px solid rgba(215, 205, 236, 0.2)',
                          borderRadius: '10px',
                          padding: '20px',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                              <Badge text={session.mode === 'voice' ? 'Voice' : 'Chat'} color={session.mode === 'voice' ? '#D7CDEC' : '#B7D3D8'} />
                              <Badge text={session.current_phase} color="#E3EADD" />
                              {session.crisis_level !== 'none' && (
                                <Badge text={`Crisis: ${session.crisis_level}`} color="#E6A897" />
                              )}
                            </div>
                            <p style={{ fontSize: '13px', color: '#586C8E', marginBottom: '8px' }}>
                              {new Date(session.started_at).toLocaleString()}
                            </p>
                            {session.therapeutic_goal && (
                              <p style={{ fontSize: '14px', color: '#2A3F5A', fontWeight: '500' }}>{session.therapeutic_goal}</p>
                            )}
                          </div>
                          <a
                            href={`/admin/session/${session.id}`}
                            style={{
                              background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
                              color: 'white',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              marginLeft: '16px'
                            }}
                          >
                            View Details
                          </a>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(215, 205, 236, 0.15)' }}>
                          <div>
                            <p style={{ fontSize: '11px', color: '#586C8E', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Messages</p>
                            <p style={{ fontSize: '16px', fontWeight: '700', color: '#2A3F5A' }}>{session.conversations?.length || 0}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#586C8E', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Depth</p>
                            <p style={{
                              fontSize: '16px',
                              fontWeight: '700',
                              color: session.reality_exploration_depth >= 10 ? '#B7D3D8' : '#E6A897'
                            }}>
                              {session.reality_exploration_depth}/10
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#586C8E', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Strategies</p>
                            <p style={{ fontSize: '16px', fontWeight: '700', color: '#2A3F5A' }}>
                              {session.strategies_discussed?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#586C8E', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ideas</p>
                            <p style={{ fontSize: '16px', fontWeight: '700', color: '#2A3F5A' }}>
                              {session.parent_generated_ideas?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

// Helper Components
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid rgba(215, 205, 236, 0.2)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(215, 205, 236, 0.15)' }}>
        <h2 style={{ color: '#2A3F5A', fontSize: '16px', margin: 0, fontWeight: '600' }}>{title}</h2>
      </div>
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#586C8E', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '600', color: '#2A3F5A' }}>{value}</span>
    </div>
  );
}

function Badge({ text, color }: { text: string; color?: string }) {
  return (
    <span style={{
      background: `${color || '#E3EADD'}40`,
      color: '#2A3F5A',
      padding: '4px 10px',
      borderRadius: '14px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'capitalize'
    }}>
      {text}
    </span>
  );
}
