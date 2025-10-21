'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { logAdminAction } from '@/lib/admin/auth';

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true);

        // Fetch from API route (uses service role, bypasses RLS)
        const response = await fetch(`/api/admin/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        const data = await response.json();
        setSessionData(data);

        // Log admin action
        await logAdminAction('view_session_details', 'session', sessionId);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal mb-4"></div>
            <p className="text-slate">Loading session details...</p>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  if (error || !sessionData) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-navy mb-4">Error</h2>
            <p className="text-slate mb-6">{error || 'Session not found'}</p>
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

  const { session, conversations, performance } = sessionData;

  const totalTokens = performance.reduce((sum: number, p: any) => sum + p.total_tokens, 0);
  const totalCost = performance.reduce((sum: number, p: any) => sum + (Number(p.total_cost) || 0), 0);
  const avgResponseTime = performance.length
    ? Math.round(performance.reduce((sum: number, p: any) => sum + p.response_time_ms, 0) / performance.length)
    : 0;

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
            <h1 className="text-2xl font-bold text-navy">Session Details</h1>
            <p className="text-sm text-slate mt-1">
              Session ID: {sessionId.substring(0, 16)}...
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Session Info & Coaching State */}
            <div className="space-y-6">
              {/* Session Metadata */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">Session Info</h2>
                <div className="space-y-3">
                  <InfoRow label="User ID" value={`User#${session.user_id.substring(0, 8)}`} />
                  <InfoRow
                    label="Mode"
                    value={
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.mode === 'voice'
                          ? 'bg-lavender bg-opacity-20 text-navy'
                          : 'bg-teal bg-opacity-20 text-navy'
                      }`}>
                        {session.mode === 'voice' ? '🎤 Voice' : '💬 Chat'}
                      </span>
                    }
                  />
                  <InfoRow label="Started" value={new Date(session.started_at).toLocaleString()} />
                  {session.ended_at && (
                    <InfoRow label="Ended" value={new Date(session.ended_at).toLocaleString()} />
                  )}
                  <InfoRow
                    label="Status"
                    value={
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.ended_at
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-teal bg-opacity-20 text-teal'
                      }`}>
                        {session.ended_at ? 'Completed' : 'Active'}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Crisis Level"
                    value={
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.crisis_level === 'none'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-coral bg-opacity-20 text-coral'
                      }`}>
                        {session.crisis_level}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* GROW Phase Progression */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">GROW Phase</h2>
                <div className="space-y-2">
                  <PhaseIndicator phase="goal" currentPhase={session.current_phase} />
                  <PhaseIndicator phase="reality" currentPhase={session.current_phase} />
                  <PhaseIndicator phase="options" currentPhase={session.current_phase} />
                  <PhaseIndicator phase="will" currentPhase={session.current_phase} />
                  <PhaseIndicator phase="closing" currentPhase={session.current_phase} />
                </div>
              </div>

              {/* Coaching State Indicators */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">Coaching State</h2>
                <div className="space-y-3">
                  <StateIndicator
                    label="Reality Depth"
                    value={`${session.reality_exploration_depth}/10`}
                    good={session.reality_exploration_depth >= 10}
                  />
                  <StateIndicator
                    label="Emotions Reflected"
                    value={session.emotions_reflected ? 'Yes' : 'No'}
                    good={session.emotions_reflected}
                  />
                  <StateIndicator
                    label="Exceptions Explored"
                    value={session.exceptions_explored ? 'Yes' : 'No'}
                    good={session.exceptions_explored}
                  />
                  <StateIndicator
                    label="Ready for Options"
                    value={session.ready_for_options ? 'Yes' : 'No'}
                    good={session.ready_for_options}
                  />
                </div>

                {session.strengths_identified && session.strengths_identified.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-slate mb-2">Strengths Identified</h3>
                    <div className="flex flex-wrap gap-2">
                      {session.strengths_identified.map((strength: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-sage bg-opacity-20 rounded text-xs text-navy">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {session.parent_generated_ideas && session.parent_generated_ideas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-slate mb-2">Parent Ideas</h3>
                    <ul className="space-y-1">
                      {session.parent_generated_ideas.map((idea: string, idx: number) => (
                        <li key={idx} className="text-sm text-navy">• {idea}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">Performance</h2>
                <div className="space-y-3">
                  <InfoRow label="Total Tokens" value={totalTokens.toLocaleString()} />
                  <InfoRow label="Total Cost" value={`$${totalCost.toFixed(4)}`} />
                  <InfoRow label="Avg Response Time" value={`${avgResponseTime}ms`} />
                  <InfoRow label="API Calls" value={performance.length} />
                </div>
              </div>
            </div>

            {/* Right Column: Conversation Transcript */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy mb-4">
                  Conversation Transcript ({conversations.length} messages)
                </h2>
                <div className="space-y-4 max-h-[800px] overflow-y-auto">
                  {conversations.map((msg: any, idx: number) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-gray-50 border-l-4 border-teal'
                          : msg.role === 'assistant'
                          ? 'bg-lavender bg-opacity-10 border-l-4 border-lavender'
                          : 'bg-sage bg-opacity-10 border-l-4 border-sage'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold uppercase ${
                          msg.role === 'user'
                            ? 'text-teal'
                            : msg.role === 'assistant'
                            ? 'text-lavender'
                            : 'text-sage'
                        }`}>
                          {msg.role}
                        </span>
                        <span className="text-xs text-slate">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-navy whitespace-pre-wrap">{msg.content}</p>

                      {msg.tool_calls && msg.tool_calls.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-slate mb-2">Tool Calls:</p>
                          {msg.tool_calls.map((tool: any, toolIdx: number) => (
                            <div key={toolIdx} className="text-xs bg-white rounded p-2 mb-1">
                              <span className="font-mono text-sage">{tool.name}</span>
                              {tool.args && (
                                <pre className="mt-1 text-[10px] text-slate overflow-x-auto">
                                  {JSON.stringify(tool.args, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate">{label}</span>
      <span className="text-sm font-medium text-navy">{value}</span>
    </div>
  );
}

function PhaseIndicator({ phase, currentPhase }: { phase: string; currentPhase: string }) {
  const phases = ['goal', 'reality', 'options', 'will', 'closing'];
  const currentIndex = phases.indexOf(currentPhase);
  const phaseIndex = phases.indexOf(phase);

  const isActive = phase === currentPhase;
  const isCompleted = phaseIndex < currentIndex;

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        isActive
          ? 'bg-teal'
          : isCompleted
          ? 'bg-sage'
          : 'bg-gray-300'
      }`} />
      <span className={`text-sm capitalize ${
        isActive
          ? 'text-teal font-semibold'
          : isCompleted
          ? 'text-sage'
          : 'text-slate'
      }`}>
        {phase}
      </span>
    </div>
  );
}

function StateIndicator({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate">{label}</span>
      <span className={`text-sm font-semibold ${good ? 'text-teal' : 'text-coral'}`}>
        {value}
      </span>
    </div>
  );
}
