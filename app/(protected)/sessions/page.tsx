'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { MessageCircle, Target, TrendingUp, Clock, AlertCircle, CheckCircle2, Lightbulb, Calendar, List, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import { Alert } from '@/components/layouts/Alert';

type ViewMode = 'timeline' | 'calendar';

interface Session {
  id: string;
  therapeutic_goal: string | null;
  crisis_level: string;
  strategies_discussed: string[];
  started_at: string;
  ended_at: string | null;
  interaction_mode: 'check-in' | 'coaching';
}

export default function SessionHistoryPage() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative" style={{ overflow: 'hidden' }}>

        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="Session History"
          subtitle="Your coaching journey"
        />

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>

            {loading ? (
              <div className="text-center py-12">
                <Clock size={48} style={{ color: '#D7CDEC', margin: '0 auto 16px' }} className="animate-pulse" />
                <p style={{ color: '#586C8E' }}>Loading your sessions...</p>
              </div>
            ) : error ? (
              <>
                <Alert type="error">
                  {error}
                </Alert>
                <Button onClick={() => userId && fetchSessions(userId)} variant="secondary">
                  Try Again
                </Button>
              </>
            ) : sessions.length === 0 ? (
              <Card padding="large">
                <div className="text-center py-8">
                  <MessageCircle size={64} style={{ color: '#D7CDEC', margin: '0 auto 16px' }} />
                  <h2 style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#2A3F5A',
                    marginBottom: '12px'
                  }}>
                    No Sessions Yet
                  </h2>
                  <p style={{
                    color: '#586C8E',
                    marginBottom: '24px',
                    lineHeight: 1.6
                  }}>
                    Start a conversation to see your session history here.
                  </p>
                  <Button onClick={() => router.push('/chat')}>
                    Start Coaching
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* Progress Stats */}
                <Card title="Your Progress" padding="large">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}>
                    <StatBox
                      label="Sessions"
                      value={sessions.length.toString()}
                      icon={<MessageCircle size={24} />}
                    />
                    <StatBox
                      label="Strategies"
                      value={getTotalStrategies(sessions).toString()}
                      icon={<Lightbulb size={24} />}
                    />
                    <StatBox
                      label="Crisis"
                      value={getCrisisSessions(sessions).toString()}
                      icon={<AlertCircle size={24} />}
                    />
                  </div>
                </Card>

                {/* View Switcher */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '4px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(42, 63, 90, 0.08)',
                  border: '1px solid rgba(215, 205, 236, 0.2)'
                }}>
                  <button
                    onClick={() => setViewMode('timeline')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode === 'timeline'
                        ? 'linear-gradient(to right, #D7CDEC, #B7D3D8)'
                        : 'transparent',
                      color: viewMode === 'timeline' ? '#2A3F5A' : '#586C8E',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <List size={18} />
                    Timeline
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode === 'calendar'
                        ? 'linear-gradient(to right, #D7CDEC, #B7D3D8)'
                        : 'transparent',
                      color: viewMode === 'calendar' ? '#2A3F5A' : '#586C8E',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Calendar size={18} />
                    Calendar
                  </button>
                </div>

                {/* Timeline View */}
                {viewMode === 'timeline' && (
                  <div style={{ position: 'relative' }}>
                  {/* Timeline vertical line */}
                  <div style={{
                    position: 'absolute',
                    left: '19px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    background: 'linear-gradient(to bottom, #D7CDEC, #B7D3D8)',
                    opacity: 0.3
                  }} />

                    {/* Sessions */}
                    {sessions.map((session, index) => (
                      <SessionTimelineItem
                        key={session.id}
                        session={session}
                        isFirst={index === 0}
                        isLast={index === sessions.length - 1}
                      />
                    ))}
                  </div>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                  <CalendarView
                    sessions={sessions}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                  />
                )}
              </>
            )}

          </ContentContainer>
        </div>

      </div>
    </MobileDeviceMockup>
  );
}

function SessionTimelineItem({ session, isFirst, isLast }: { session: Session; isFirst: boolean; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(session.started_at);
  const duration = session.ended_at
    ? Math.round((new Date(session.ended_at).getTime() - date.getTime()) / 1000 / 60)
    : null;

  const handleSessionClick = () => {
    // Navigate to chat and load this specific session
    window.location.href = `/chat?sessionId=${session.id}`;
  };

  const getCrisisColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return { bg: '#E6A897', color: 'white', border: '#E6A897' };
      case 'medium':
        return { bg: '#F0D9DA', color: '#2A3F5A', border: '#E6A897' };
      case 'low':
        return { bg: '#D7CDEC', color: '#2A3F5A', border: '#D7CDEC' };
      default:
        return { bg: '#E3EADD', color: '#2A3F5A', border: '#B7D3D8' };
    }
  };

  const crisisColors = getCrisisColor(session.crisis_level);

  return (
    <div style={{
      position: 'relative',
      paddingLeft: '52px',
      paddingBottom: isLast ? '0' : '24px'
    }}>
      {/* Timeline dot/icon */}
      <div style={{
        position: 'absolute',
        left: '0',
        top: '4px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: isFirst
          ? 'linear-gradient(135deg, #D7CDEC, #B7D3D8)'
          : 'white',
        border: `3px solid ${crisisColors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(42, 63, 90, 0.15)',
        zIndex: 1
      }}>
        {session.crisis_level !== 'none' ? (
          <AlertCircle size={20} style={{ color: crisisColors.border }} />
        ) : isFirst ? (
          <CheckCircle2 size={20} style={{ color: '#2A3F5A' }} />
        ) : (
          <MessageCircle size={18} style={{ color: '#B7D3D8' }} />
        )}
      </div>

      {/* Session card - clickable */}
      <div
        onClick={handleSessionClick}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(42, 63, 90, 0.08)',
          border: `1px solid ${isFirst ? 'rgba(183, 211, 216, 0.4)' : 'rgba(215, 205, 236, 0.2)'}`,
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(42, 63, 90, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(42, 63, 90, 0.08)';
        }}
      >
        {/* Date & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Clock size={14} style={{ color: '#586C8E' }} />
          <p style={{ fontSize: '13px', color: '#586C8E', margin: 0, fontWeight: 500 }}>
            {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {duration && (
            <span style={{
              fontSize: '11px',
              color: '#586C8E',
              padding: '2px 8px',
              backgroundColor: 'rgba(227, 234, 221, 0.3)',
              borderRadius: '8px',
              marginLeft: 'auto'
            }}>
              {duration} min
            </span>
          )}
        </div>

        {/* Session Type Badge */}
        {session.interaction_mode === 'coaching' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
            color: '#2A3F5A',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            <Sparkles size={14} />
            COACHING SESSION
          </div>
        )}

        {/* Goal */}
        {session.therapeutic_goal && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
            <Target size={16} style={{ color: '#D7CDEC', marginTop: '2px', flexShrink: 0 }} />
            <p style={{
              color: '#2A3F5A',
              fontWeight: 500,
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.5
            }}>
              {session.therapeutic_goal}
            </p>
          </div>
        )}

        {/* Crisis Badge */}
        {session.crisis_level !== 'none' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: crisisColors.bg,
            color: crisisColors.color,
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            <AlertCircle size={14} />
            {session.crisis_level.toUpperCase()}
          </div>
        )}

        {/* Strategies */}
        {session.strategies_discussed && session.strategies_discussed.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Lightbulb size={14} style={{ color: '#B7D3D8' }} />
              <p style={{ fontSize: '12px', color: '#586C8E', margin: 0, fontWeight: 600 }}>
                Strategies Discussed
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: expanded ? '0' : '8px' }}>
              {session.strategies_discussed.slice(0, expanded ? undefined : 2).map((strategy, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: 'rgba(183, 211, 216, 0.2)',
                    color: '#2A3F5A',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 500,
                    lineHeight: 1.3
                  }}
                >
                  {strategy}
                </span>
              ))}
              {!expanded && session.strategies_discussed.length > 2 && (
                <button
                  onClick={() => setExpanded(true)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: 'rgba(215, 205, 236, 0.2)',
                    color: '#D7CDEC',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  +{session.strategies_discussed.length - 2} more
                </button>
              )}
            </div>
            {expanded && session.strategies_discussed.length > 2 && (
              <button
                onClick={() => setExpanded(false)}
                style={{
                  fontSize: '12px',
                  color: '#B7D3D8',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  marginTop: '8px'
                }}
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '16px 8px',
      backgroundColor: 'rgba(227, 234, 221, 0.3)',
      borderRadius: '12px'
    }}>
      <div style={{ color: '#B7D3D8', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <p style={{
        fontSize: '20px',
        fontWeight: 700,
        color: '#2A3F5A',
        margin: '0 0 4px 0'
      }}>
        {value}
      </p>
      <p style={{
        fontSize: '11px',
        color: '#586C8E',
        margin: 0,
        fontWeight: 600
      }}>
        {label}
      </p>
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

// Calendar View Component
function CalendarView({
  sessions,
  currentMonth,
  onMonthChange
}: {
  sessions: Session[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date): Session[] => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.started_at);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
    setSelectedDate(null);
  };

  const sessionsForSelectedDate = selectedDate ? getSessionsForDate(selectedDate) : [];

  return (
    <>
      <Card padding="large">
        {/* Month Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(215, 205, 236, 0.2)',
              color: '#2A3F5A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <h3 style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#2A3F5A',
            margin: 0
          }}>
            {monthName}
          </h3>

          <button
            onClick={goToNextMonth}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(215, 205, 236, 0.2)',
              color: '#2A3F5A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day Labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginBottom: '8px'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: '#586C8E',
                padding: '8px 4px'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}>
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} style={{ aspectRatio: '1' }} />;
            }

            const daySessions = getSessionsForDate(date);
            const hasSession = daySessions.length > 0;
            const hasCrisis = daySessions.some(s => s.crisis_level !== 'none');
            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();
            const isSelected = selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  border: isToday ? '2px solid #B7D3D8' : '1px solid rgba(215, 205, 236, 0.2)',
                  background: isSelected
                    ? 'linear-gradient(to right, #D7CDEC, #B7D3D8)'
                    : hasSession
                    ? 'rgba(227, 234, 221, 0.3)'
                    : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(183, 211, 216, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = hasSession ? 'rgba(227, 234, 221, 0.3)' : 'white';
                  }
                }}
              >
                <span style={{
                  fontSize: '13px',
                  fontWeight: isToday ? 700 : 500,
                  color: isSelected ? '#2A3F5A' : isToday ? '#B7D3D8' : '#2A3F5A'
                }}>
                  {date.getDate()}
                </span>

                {hasSession && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {daySessions.slice(0, 3).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: hasCrisis ? '#E6A897' : '#B7D3D8'
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(215, 205, 236, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#B7D3D8'
            }} />
            <span style={{ fontSize: '11px', color: '#586C8E' }}>Session</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#E6A897'
            }} />
            <span style={{ fontSize: '11px', color: '#586C8E' }}>Crisis</span>
          </div>
        </div>
      </Card>

      {/* Selected Date Sessions */}
      {selectedDate && sessionsForSelectedDate.length > 0 && (
        <Card title={`Sessions on ${selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessionsForSelectedDate.map(session => (
              <SessionCalendarItem key={session.id} session={session} />
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

// Compact session item for calendar view
function SessionCalendarItem({ session }: { session: Session }) {
  const date = new Date(session.started_at);
  const duration = session.ended_at
    ? Math.round((new Date(session.ended_at).getTime() - date.getTime()) / 1000 / 60)
    : null;

  const handleSessionClick = () => {
    window.location.href = `/chat?sessionId=${session.id}`;
  };

  const getCrisisColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return '#E6A897';
      case 'medium':
        return '#F0D9DA';
      case 'low':
        return '#D7CDEC';
      default:
        return '#E3EADD';
    }
  };

  return (
    <div
      onClick={handleSessionClick}
      style={{
        padding: '12px',
        borderRadius: '12px',
        background: 'rgba(249, 247, 243, 0.5)',
        border: '1px solid rgba(215, 205, 236, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(227, 234, 221, 0.4)';
        e.currentTarget.style.borderColor = 'rgba(183, 211, 216, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(249, 247, 243, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.2)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Clock size={14} style={{ color: '#586C8E' }} />
        <span style={{ fontSize: '12px', color: '#586C8E', fontWeight: 500 }}>
          {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {duration && (
          <span style={{
            fontSize: '11px',
            color: '#586C8E',
            padding: '2px 6px',
            backgroundColor: 'rgba(227, 234, 221, 0.5)',
            borderRadius: '6px',
            marginLeft: 'auto'
          }}>
            {duration} min
          </span>
        )}
      </div>

      {session.interaction_mode === 'coaching' && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
          color: '#2A3F5A',
          marginBottom: '8px'
        }}>
          <Sparkles size={12} />
          COACHING
        </div>
      )}

      {session.therapeutic_goal && (
        <p style={{
          fontSize: '13px',
          color: '#2A3F5A',
          margin: '0 0 8px 0',
          lineHeight: 1.4
        }}>
          {session.therapeutic_goal}
        </p>
      )}

      {session.crisis_level !== 'none' && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 600,
          backgroundColor: getCrisisColor(session.crisis_level),
          color: session.crisis_level === 'critical' || session.crisis_level === 'high' ? 'white' : '#2A3F5A'
        }}>
          <AlertCircle size={12} />
          {session.crisis_level.toUpperCase()}
        </div>
      )}
    </div>
  );
}
