'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { MessageCircle, Target, TrendingUp, Clock, AlertCircle, CheckCircle2, Lightbulb, Calendar, List, ChevronLeft, ChevronRight, Sparkles, Star, Archive, MoreVertical, Trash2, Edit3, X, Check } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import { Alert } from '@/components/layouts/Alert';
import { SPACING } from '@/lib/styles/spacing';

type ViewMode = 'timeline' | 'calendar';
type FilterMode = 'all' | 'favorites' | 'archived';

interface Session {
  id: string;
  therapeutic_goal: string | null;
  crisis_level: string;
  strategies_discussed: string[];
  started_at: string;
  ended_at: string | null;
  interaction_mode: 'check-in' | 'coaching';
  session_type: 'discovery' | 'quick-tip' | 'update' | 'strategy' | 'crisis' | 'coaching';
  is_favorite: boolean;
  is_archived: boolean;
  deleted_at: string | null;
  custom_title: string | null;
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
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

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
        .is('deleted_at', null) // Exclude soft-deleted sessions
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

  // Filter sessions based on current filter mode
  const filteredSessions = sessions.filter(session => {
    if (filterMode === 'favorites') {
      return session.is_favorite;
    } else if (filterMode === 'archived') {
      return session.is_archived;
    } else {
      // 'all' shows non-archived sessions
      return !session.is_archived;
    }
  });

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative">

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
        <div
          className="flex-grow overflow-y-auto"
          style={{
            backgroundColor: '#F9F7F3',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
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
            ) : filteredSessions.length === 0 ? (
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

                {/* Filter Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <button
                    onClick={() => setFilterMode('all')}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: filterMode === 'all' ? '2px solid #B7D3D8' : '1px solid rgba(215, 205, 236, 0.3)',
                      background: filterMode === 'all' ? 'rgba(183, 211, 216, 0.1)' : 'white',
                      color: filterMode === 'all' ? '#2A3F5A' : '#586C8E',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterMode('favorites')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: filterMode === 'favorites' ? '2px solid #B7D3D8' : '1px solid rgba(215, 205, 236, 0.3)',
                      background: filterMode === 'favorites' ? 'rgba(183, 211, 216, 0.1)' : 'white',
                      color: filterMode === 'favorites' ? '#2A3F5A' : '#586C8E',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Star size={16} fill={filterMode === 'favorites' ? '#FFD700' : 'none'} />
                    Favorites
                  </button>
                  <button
                    onClick={() => setFilterMode('archived')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: filterMode === 'archived' ? '2px solid #B7D3D8' : '1px solid rgba(215, 205, 236, 0.3)',
                      background: filterMode === 'archived' ? 'rgba(183, 211, 216, 0.1)' : 'white',
                      color: filterMode === 'archived' ? '#2A3F5A' : '#586C8E',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Archive size={16} />
                    Archived
                  </button>
                </div>

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
                  <div style={{ position: 'relative', overflow: 'visible' }}>
                  {/* Timeline vertical line */}
                  <div style={{
                    position: 'absolute',
                    left: '19px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    background: 'linear-gradient(to bottom, #D7CDEC, #B7D3D8)',
                    opacity: 0.3,
                    pointerEvents: 'none'
                  }} />

                    {/* Sessions */}
                    {filteredSessions.map((session, index) => (
                      <SessionTimelineItem
                        key={session.id}
                        session={session}
                        isFirst={index === 0}
                        isLast={index === filteredSessions.length - 1}
                        onUpdate={() => userId && fetchSessions(userId)}
                      />
                    ))}
                  </div>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                  <CalendarView
                    sessions={filteredSessions}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onUpdate={() => userId && fetchSessions(userId)}
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

function SessionTimelineItem({
  session,
  isFirst,
  isLast,
  onUpdate
}: {
  session: Session;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(session.custom_title || '');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const date = new Date(session.started_at);
  const duration = session.ended_at
    ? Math.round((new Date(session.ended_at).getTime() - date.getTime()) / 1000 / 60)
    : null;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSessionClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking menu button or editing
    if ((e.target as HTMLElement).closest('[data-menu-button]') || isEditing) {
      return;
    }
    // Navigate to chat and load this specific session
    window.location.href = `/chat?sessionId=${session.id}`;
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsEditing(true);
    setEditedTitle(session.custom_title || '');
  };

  const handleSaveTitle = async () => {
    if (editedTitle.trim() === session.custom_title) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_title: editedTitle.trim() || null })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update title:', error);
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(session.custom_title || '');
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    setMenuOpen(false);

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !session.is_favorite })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    setMenuOpen(false);

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: !session.is_archived })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update archive:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      return;
    }

    setIsUpdating(true);
    setMenuOpen(false);

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setIsUpdating(false);
    }
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
      paddingBottom: isLast ? '0' : '24px',
      zIndex: menuOpen || isEditing ? 100 : 'auto'
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
        {/* Session Header with Title and Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  placeholder="Enter custom title..."
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#2A3F5A',
                    border: '2px solid #B7D3D8',
                    borderRadius: '8px',
                    fontFamily: 'Quicksand, sans-serif',
                    outline: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveTitle();
                  }}
                  disabled={isUpdating}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#B7D3D8',
                    color: 'white',
                    cursor: isUpdating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                  disabled={isUpdating}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(230, 168, 151, 0.2)',
                    color: '#E6A897',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Clock size={14} style={{ color: '#586C8E' }} />
                <div style={{ flex: 1 }}>
                  {session.custom_title && (
                    <p style={{ fontSize: '14px', color: '#2A3F5A', margin: '0 0 2px 0', fontWeight: 700 }}>
                      {session.custom_title}
                    </p>
                  )}
                  <p style={{ fontSize: session.custom_title ? '11px' : '13px', color: session.custom_title ? '#586C8E' : '#2A3F5A', margin: 0, fontWeight: session.custom_title ? 500 : 600 }}>
                    {getSessionTitle(session)}
                  </p>
                </div>
                {session.is_favorite && (
                  <Star size={16} fill="#FFD700" stroke="#FFD700" />
                )}
              </div>
            )}
            {duration && (
              <span style={{
                fontSize: '11px',
                color: '#586C8E',
                padding: '2px 8px',
                backgroundColor: 'rgba(227, 234, 221, 0.3)',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                {duration} min
              </span>
            )}
          </div>

          {/* Three-dot menu */}
          <div ref={menuRef} style={{ position: 'relative', zIndex: 1 }}>
            <button
              data-menu-button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              disabled={isUpdating}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: 'none',
                background: menuOpen ? 'rgba(215, 205, 236, 0.3)' : 'transparent',
                color: '#586C8E',
                cursor: isUpdating ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!menuOpen) {
                  e.currentTarget.style.background = 'rgba(215, 205, 236, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!menuOpen) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(42, 63, 90, 0.15)',
                  border: '1px solid rgba(215, 205, 236, 0.3)',
                  minWidth: '160px',
                  zIndex: 1,
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={handleStartRename}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#2A3F5A',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Quicksand, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(227, 234, 221, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Edit3 size={16} />
                  Rename
                </button>

                <button
                  onClick={handleToggleFavorite}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#2A3F5A',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Quicksand, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(227, 234, 221, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Star size={16} fill={session.is_favorite ? '#FFD700' : 'none'} stroke={session.is_favorite ? '#FFD700' : 'currentColor'} />
                  {session.is_favorite ? 'Unfavorite' : 'Favorite'}
                </button>

                <button
                  onClick={handleToggleArchive}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#2A3F5A',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Quicksand, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(227, 234, 221, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Archive size={16} />
                  {session.is_archived ? 'Unarchive' : 'Archive'}
                </button>

                <div style={{ height: '1px', background: 'rgba(215, 205, 236, 0.3)', margin: '4px 0' }} />

                <button
                  onClick={handleDelete}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#E6A897',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Quicksand, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(230, 168, 151, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
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

// Get human-readable session title
function getSessionTitle(session: Session): string {
  const date = new Date(session.started_at);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Capitalize first letter of session type
  const sessionType = session.session_type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${sessionType} • ${dateStr} at ${timeStr}`;
}

// Calendar View Component
function CalendarView({
  sessions,
  currentMonth,
  onMonthChange,
  onUpdate
}: {
  sessions: Session[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onUpdate: () => void;
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
              <SessionCalendarItem key={session.id} session={session} onUpdate={onUpdate} />
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

// Compact session item for calendar view
function SessionCalendarItem({ session, onUpdate }: { session: Session; onUpdate: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const date = new Date(session.started_at);
  const duration = session.ended_at
    ? Math.round((new Date(session.ended_at).getTime() - date.getTime()) / 1000 / 60)
    : null;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const handleSessionClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-menu-button]')) {
      return;
    }
    window.location.href = `/chat?sessionId=${session.id}`;
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    setMenuOpen(false);
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !session.is_favorite })
      });
      if (response.ok) onUpdate();
    } catch (error) {
      console.error('Failed to update favorite:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    setMenuOpen(false);
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: !session.is_archived })
      });
      if (response.ok) onUpdate();
    } catch (error) {
      console.error('Failed to update archive:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      return;
    }
    setIsUpdating(true);
    setMenuOpen(false);
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'DELETE'
      });
      if (response.ok) onUpdate();
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setIsUpdating(false);
    }
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
        transition: 'all 0.2s',
        position: 'relative',
        zIndex: menuOpen ? 100 : 'auto'
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <p style={{ fontSize: '12px', color: '#2A3F5A', fontWeight: 600, margin: 0 }}>
              {getSessionTitle(session)}
            </p>
            {session.is_favorite && (
              <Star size={14} fill="#FFD700" stroke="#FFD700" />
            )}
          </div>
          {duration && (
            <span style={{
              fontSize: '11px',
              color: '#586C8E',
              padding: '2px 6px',
              backgroundColor: 'rgba(227, 234, 221, 0.5)',
              borderRadius: '6px'
            }}>
              {duration} min
            </span>
          )}
        </div>

        {/* Three-dot menu */}
        <div ref={menuRef} style={{ position: 'relative', zIndex: 1 }}>
          <button
            data-menu-button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            disabled={isUpdating}
            style={{
              padding: '4px',
              borderRadius: '6px',
              border: 'none',
              background: menuOpen ? 'rgba(215, 205, 236, 0.3)' : 'transparent',
              color: '#586C8E',
              cursor: isUpdating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(42, 63, 90, 0.15)',
                border: '1px solid rgba(215, 205, 236, 0.3)',
                minWidth: '140px',
                zIndex: 1,
                overflow: 'hidden'
              }}
            >
              <button
                onClick={handleToggleFavorite}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#2A3F5A',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'Quicksand, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(227, 234, 221, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Star size={14} fill={session.is_favorite ? '#FFD700' : 'none'} stroke={session.is_favorite ? '#FFD700' : 'currentColor'} />
                {session.is_favorite ? 'Unfavorite' : 'Favorite'}
              </button>

              <button
                onClick={handleToggleArchive}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#2A3F5A',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'Quicksand, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(227, 234, 221, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Archive size={14} />
                {session.is_archived ? 'Unarchive' : 'Archive'}
              </button>

              <div style={{ height: '1px', background: 'rgba(215, 205, 236, 0.3)', margin: '4px 0' }} />

              <button
                onClick={handleDelete}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#E6A897',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'Quicksand, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(230, 168, 151, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
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
