'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { createBrowserClient } from '@supabase/ssr';
import { logAdminAction } from '@/lib/admin/auth';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        setLoading(true);

        // Get user data
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Get sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('agent_sessions')
          .select(`
            *,
            conversations:agent_conversations(id)
          `)
          .eq('user_id', userId)
          .order('started_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        // Get performance
        const { data: performance, error: perfError } = await supabase
          .from('agent_performance')
          .select('*')
          .eq('user_id', userId);

        if (perfError) throw perfError;

        setUserData({
          user,
          profile: profile || null,
          sessions: sessions || [],
          performance: performance || [],
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
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal mb-4"></div>
            <p className="text-slate">Loading user profile...</p>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  if (error || !userData) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-navy mb-4">Error</h2>
            <p className="text-slate mb-6">{error || 'User not found'}</p>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-teal text-white rounded-lg font-medium hover:bg-opacity-90"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  const { user, profile, sessions, performance } = userData;

  const totalCost = performance.reduce((sum: number, p: any) => sum + (Number(p.total_cost) || 0), 0);
  const totalTokens = performance.reduce((sum: number, p: any) => sum + p.total_tokens, 0);
  const totalMessages = sessions.reduce((sum: number, s: any) => sum + (s.conversations?.length || 0), 0);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-cream">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push('/admin')}
              className="text-teal hover:underline text-sm mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-navy">User Profile</h1>
            <p className="text-sm text-slate mt-1 font-mono">
              {userId}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: User Info */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">Account</h2>
                <div className="space-y-3">
                  <InfoRow label="User ID" value={userId.substring(0, 12) + '...'} />
                  <InfoRow label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
                  <InfoRow
                    label="GDPR Consent"
                    value={
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.consent_given
                          ? 'bg-teal bg-opacity-20 text-navy'
                          : 'bg-coral bg-opacity-20 text-navy'
                      }`}>
                        {user.consent_given ? 'Given' : 'Not Given'}
                      </span>
                    }
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
              </div>

              {/* Usage Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">Usage Stats</h2>
                <div className="space-y-3">
                  <InfoRow label="Total Sessions" value={sessions.length} />
                  <InfoRow label="Total Messages" value={totalMessages} />
                  <InfoRow label="Total Tokens" value={totalTokens.toLocaleString()} />
                  <InfoRow label="Total Cost" value={`$${totalCost.toFixed(4)}`} />
                  <InfoRow
                    label="Avg Messages/Session"
                    value={sessions.length ? Math.round(totalMessages / sessions.length) : 0}
                  />
                </div>
              </div>

              {/* Learned Profile */}
              {profile && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-navy mb-4">Learned Context</h2>
                  <div className="space-y-4">
                    {profile.child_age_range && (
                      <div>
                        <p className="text-xs text-slate mb-1">Child Age Range</p>
                        <p className="text-sm font-medium text-navy">{profile.child_age_range}</p>
                      </div>
                    )}

                    {profile.parent_stress_level && profile.parent_stress_level !== 'unknown' && (
                      <div>
                        <p className="text-xs text-slate mb-1">Parent Stress Level</p>
                        <p className="text-sm font-medium text-navy capitalize">{profile.parent_stress_level}</p>
                      </div>
                    )}

                    {profile.common_triggers && profile.common_triggers.length > 0 && (
                      <div>
                        <p className="text-xs text-slate mb-2">Common Triggers</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.common_triggers.map((trigger: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-coral bg-opacity-20 rounded text-xs text-navy">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.home_constraints && profile.home_constraints.length > 0 && (
                      <div>
                        <p className="text-xs text-slate mb-2">Home Constraints</p>
                        <ul className="space-y-1">
                          {profile.home_constraints.map((constraint: string, idx: number) => (
                            <li key={idx} className="text-sm text-navy">• {constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {profile.successful_strategies && profile.successful_strategies.length > 0 && (
                      <div>
                        <p className="text-xs text-slate mb-2">Successful Strategies</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.successful_strategies.map((strategy: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-teal bg-opacity-20 rounded text-xs text-navy">
                              {strategy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.failed_strategies && profile.failed_strategies.length > 0 && (
                      <div>
                        <p className="text-xs text-slate mb-2">Failed Strategies</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.failed_strategies.map((strategy: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-gray-200 rounded text-xs text-navy line-through">
                              {strategy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Session History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">
                  Session History ({sessions.length})
                </h2>

                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate">No sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-teal transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                session.mode === 'voice'
                                  ? 'bg-lavender bg-opacity-20 text-navy'
                                  : 'bg-teal bg-opacity-20 text-navy'
                              }`}>
                                {session.mode === 'voice' ? '🎤 Voice' : '💬 Chat'}
                              </span>
                              <span className="px-2 py-1 bg-sage bg-opacity-20 rounded text-xs font-medium text-navy">
                                {session.current_phase}
                              </span>
                              {session.crisis_level !== 'none' && (
                                <span className="px-2 py-1 bg-coral bg-opacity-20 rounded text-xs font-medium text-coral">
                                  Crisis: {session.crisis_level}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate">
                              {new Date(session.started_at).toLocaleString()}
                            </p>
                            {session.therapeutic_goal && (
                              <p className="text-sm text-navy mt-2">{session.therapeutic_goal}</p>
                            )}
                          </div>
                          <a
                            href={`/admin/session/${session.id}`}
                            className="px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-opacity-90 whitespace-nowrap"
                          >
                            View Details
                          </a>
                        </div>

                        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-slate">Messages</p>
                            <p className="text-sm font-semibold text-navy">{session.conversations?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate">Depth</p>
                            <p className={`text-sm font-semibold ${
                              session.reality_exploration_depth >= 10 ? 'text-teal' : 'text-coral'
                            }`}>
                              {session.reality_exploration_depth}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate">Strategies</p>
                            <p className="text-sm font-semibold text-navy">
                              {session.strategies_discussed?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate">Ideas</p>
                            <p className="text-sm font-semibold text-navy">
                              {session.parent_generated_ideas?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

// Helper Component
function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate">{label}</span>
      <span className="text-sm font-medium text-navy">{value}</span>
    </div>
  );
}
