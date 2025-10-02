'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  therapeutic_goal: string | null;
  crisis_level: string;
  strategies_discussed: string[];
  started_at: string;
  ended_at: string | null;
}

export default function SessionHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    supabase.auth.getUser().then(({ data: { user }, error: authError }) => {
      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      setUserId(user.id);
      fetchSessions(user.id);
    });
  }, [router]);

  const fetchSessions = async (uid: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error: fetchError } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('user_id', uid)
        .order('started_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setSessions(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">📚</div>
          <p className="text-slate">Loading your session history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-navy mb-2">Error Loading Sessions</h2>
          <p className="text-slate mb-6">{error}</p>
          <button
            onClick={() => userId && fetchSessions(userId)}
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">📚 Your Session History</h1>
          <p className="text-slate mb-4">
            Review your past conversations and track your progress
          </p>
          <div className="flex gap-4">
            <a
              href="/"
              className="text-teal hover:underline text-sm"
            >
              ← Back to Chat
            </a>
            <a
              href="/auth/profile"
              className="text-teal hover:underline text-sm"
            >
              View Profile
            </a>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💭</div>
            <h2 className="text-2xl font-semibold text-navy mb-2">No Sessions Yet</h2>
            <p className="text-slate mb-6">
              Start a conversation with the support agent to see your session history here.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-teal text-navy rounded-full font-semibold hover:bg-opacity-80 transition"
            >
              Start a Conversation
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {sessions.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-navy mb-4">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatBox
                label="Total Sessions"
                value={sessions.length.toString()}
                icon="💬"
              />
              <StatBox
                label="Strategies Discussed"
                value={getTotalStrategies(sessions).toString()}
                icon="🎯"
              />
              <StatBox
                label="Crisis Support"
                value={getCrisisSessions(sessions).toString()}
                icon="🚨"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(session.started_at);
  const duration = session.ended_at
    ? Math.round((new Date(session.ended_at).getTime() - date.getTime()) / 1000 / 60)
    : null;

  const getCrisisColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return 'bg-coral text-white';
      case 'medium':
        return 'bg-blush text-navy';
      case 'low':
        return 'bg-lavender text-navy';
      default:
        return 'bg-sage text-navy';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💭</span>
            <div>
              <p className="text-sm text-slate">
                {date.toLocaleDateString()} at {date.toLocaleTimeString()}
              </p>
              {duration && (
                <p className="text-xs text-slate">Duration: {duration} minutes</p>
              )}
            </div>
          </div>

          {session.therapeutic_goal && (
            <p className="text-navy font-medium mb-2">
              Goal: {session.therapeutic_goal}
            </p>
          )}
        </div>

        {session.crisis_level !== 'none' && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCrisisColor(session.crisis_level)}`}>
            {session.crisis_level.toUpperCase()}
          </span>
        )}
      </div>

      {session.strategies_discussed && session.strategies_discussed.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate mb-2">Strategies Discussed:</p>
          <div className="flex flex-wrap gap-2">
            {session.strategies_discussed.slice(0, expanded ? undefined : 3).map((strategy, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-teal bg-opacity-20 text-teal rounded-lg text-xs"
              >
                {strategy}
              </span>
            ))}
            {!expanded && session.strategies_discussed.length > 3 && (
              <span className="text-xs text-slate">
                +{session.strategies_discussed.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {session.strategies_discussed && session.strategies_discussed.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-teal hover:underline"
        >
          {expanded ? 'Show less' : 'Show all strategies'}
        </button>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="text-center p-4 bg-sage bg-opacity-20 rounded-xl">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-navy mb-1">{value}</p>
      <p className="text-sm text-slate">{label}</p>
    </div>
  );
}

function getTotalStrategies(sessions: Session[]): number {
  return sessions.reduce((total, session) => {
    return total + (session.strategies_discussed?.length || 0);
  }, 0);
}

function getCrisisSessions(sessions: Session[]): number {
  return sessions.filter(s => s.crisis_level !== 'none').length;
}

