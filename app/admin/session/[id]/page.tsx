'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { logAdminAction } from '@/lib/admin/auth';
import { ArrowLeft, Clock } from 'lucide-react';

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
            <p style={{ color: '#586C8E' }}>Loading session details...</p>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  if (error || !sessionData) {
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
            <p style={{ color: '#586C8E', marginBottom: '24px' }}>{error || 'Session not found'}</p>
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

  const { session, conversations, performance } = sessionData;

  const totalTokens = performance.reduce((sum: number, p: any) => sum + p.total_tokens, 0);
  const totalCost = performance.reduce((sum: number, p: any) => sum + (Number(p.total_cost) || 0), 0);
  const avgResponseTime = performance.length
    ? Math.round(performance.reduce((sum: number, p: any) => sum + p.response_time_ms, 0) / performance.length)
    : 0;

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
              Session Details
            </h1>
            <p style={{ fontSize: '13px', color: '#586C8E', marginTop: '4px', fontFamily: 'monospace' }}>
              {sessionId}
            </p>
          </div>
        </header>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            {/* Left Column: Session Info & Coaching State */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Session Metadata */}
              <Card title="Session Info">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <InfoRow label="User ID" value={`User#${session.user_id.substring(0, 8)}`} />
                  <InfoRow
                    label="Session Type"
                    value={<Badge text={session.interaction_mode === 'coaching' ? '🎯 Coaching Session' : '✅ Check-in'} color={session.interaction_mode === 'coaching' ? '#D7CDEC' : '#E3EADD'} />}
                  />
                  <InfoRow
                    label="Mode"
                    value={<Badge text={session.mode === 'voice' ? '🎤 Voice' : '💬 Chat'} color={session.mode === 'voice' ? '#D7CDEC' : '#B7D3D8'} />}
                  />
                  <InfoRow label="Started" value={new Date(session.started_at).toLocaleString()} />
                  {session.ended_at && (
                    <InfoRow label="Ended" value={new Date(session.ended_at).toLocaleString()} />
                  )}
                  <InfoRow
                    label="Status"
                    value={<Badge text={session.ended_at ? 'Completed' : 'Active'} color={session.ended_at ? '#586C8E' : '#B7D3D8'} />}
                  />
                  <InfoRow
                    label="Crisis Level"
                    value={<Badge text={session.crisis_level} color={session.crisis_level === 'none' ? '#E3EADD' : '#E6A897'} />}
                  />
                </div>
              </Card>

              {/* GROW Phase Progression - Only show for coaching sessions */}
              {session.interaction_mode === 'coaching' && (
                <Card title="GROW Phase">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <PhaseIndicator phase="goal" currentPhase={session.current_phase} />
                    <PhaseIndicator phase="reality" currentPhase={session.current_phase} />
                    <PhaseIndicator phase="options" currentPhase={session.current_phase} />
                    <PhaseIndicator phase="will" currentPhase={session.current_phase} />
                    <PhaseIndicator phase="closing" currentPhase={session.current_phase} />
                  </div>
                </Card>
              )}

              {/* Session Metrics - Show different content for check-ins vs coaching */}
              <Card title={session.interaction_mode === 'coaching' ? 'Coaching State' : 'Check-in Summary'}>
                {session.interaction_mode === 'coaching' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <InfoRow label="Duration" value={session.ended_at ? `${Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)} minutes` : `${session.time_elapsed_minutes || 0} minutes (ongoing)`} />
                    <InfoRow label="Messages" value={conversations.length} />
                    <InfoRow label="Time Budget" value={`${session.time_budget_minutes} minutes`} />
                  </div>
                )}

                {session.strengths_identified && session.strengths_identified.length > 0 && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(215, 205, 236, 0.2)' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#586C8E', marginBottom: '12px' }}>Strengths Identified</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {session.strengths_identified.map((strength: string, idx: number) => (
                        <span key={idx} style={{ background: 'rgba(227, 234, 221, 0.4)', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', color: '#2A3F5A', fontWeight: '500' }}>
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {session.parent_generated_ideas && session.parent_generated_ideas.length > 0 && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(215, 205, 236, 0.2)' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#586C8E', marginBottom: '12px' }}>Parent Ideas</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {session.parent_generated_ideas.map((idea: string, idx: number) => (
                        <li key={idx} style={{ fontSize: '14px', color: '#2A3F5A', lineHeight: '1.5' }}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Performance Metrics */}
              <Card title="Performance">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <InfoRow label="Total Tokens" value={totalTokens.toLocaleString()} />
                  <InfoRow label="Total Cost" value={`$${totalCost.toFixed(4)}`} />
                  <InfoRow label="Avg Response Time" value={`${avgResponseTime}ms`} />
                  <InfoRow label="API Calls" value={performance.length} />
                </div>
              </Card>
            </div>

            {/* Right Column: Conversation Transcript */}
            <div>
              <Card title={`Conversation Transcript (${conversations.length} messages)`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '900px', overflowY: 'auto', paddingRight: '8px' }}>
                  {conversations.map((msg: any) => (
                    <div
                      key={msg.id}
                      style={{
                        padding: '20px',
                        borderRadius: '10px',
                        border: '1px solid rgba(215, 205, 236, 0.2)',
                        background: msg.role === 'user'
                          ? 'rgba(183, 211, 216, 0.08)'
                          : msg.role === 'assistant'
                          ? 'rgba(215, 205, 236, 0.08)'
                          : 'rgba(227, 234, 221, 0.08)',
                        borderLeft: `4px solid ${
                          msg.role === 'user'
                            ? '#B7D3D8'
                            : msg.role === 'assistant'
                            ? '#D7CDEC'
                            : '#E3EADD'
                        }`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: msg.role === 'user'
                            ? '#B7D3D8'
                            : msg.role === 'assistant'
                            ? '#D7CDEC'
                            : '#E3EADD'
                        }}>
                          {msg.role}
                        </span>
                        <span style={{ fontSize: '12px', color: '#586C8E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#2A3F5A', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {msg.content}
                      </p>

                      {msg.tool_calls && msg.tool_calls.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(215, 205, 236, 0.2)' }}>
                          <p style={{ fontSize: '11px', fontWeight: '600', color: '#586C8E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Tool Calls
                          </p>
                          {msg.tool_calls.map((tool: any, toolIdx: number) => (
                            <div key={toolIdx} style={{ fontSize: '12px', background: 'white', borderRadius: '6px', padding: '12px', marginBottom: '8px', border: '1px solid rgba(215, 205, 236, 0.2)' }}>
                              <span style={{ fontFamily: 'monospace', color: '#E3EADD', fontWeight: '600' }}>{tool.name}</span>
                              {tool.args && (
                                <pre style={{ marginTop: '8px', fontSize: '11px', color: '#586C8E', overflowX: 'auto', fontFamily: 'monospace' }}>
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

function PhaseIndicator({ phase, currentPhase }: { phase: string; currentPhase: string }) {
  const phases = ['goal', 'reality', 'options', 'will', 'closing'];
  const currentIndex = phases.indexOf(currentPhase);
  const phaseIndex = phases.indexOf(phase);

  const isActive = phase === currentPhase;
  const isCompleted = phaseIndex < currentIndex;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: isActive ? '#B7D3D8' : isCompleted ? '#E3EADD' : 'rgba(88, 108, 142, 0.2)'
      }} />
      <span style={{
        fontSize: '14px',
        textTransform: 'capitalize',
        color: isActive ? '#B7D3D8' : isCompleted ? '#E3EADD' : '#586C8E',
        fontWeight: isActive ? '600' : '500'
      }}>
        {phase}
      </span>
    </div>
  );
}

function StateIndicator({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#586C8E', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '700', color: good ? '#B7D3D8' : '#E6A897' }}>
        {value}
      </span>
    </div>
  );
}
