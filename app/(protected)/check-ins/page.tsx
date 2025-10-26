'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import type { ChildProfile, DailyCheckIn } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import CheckInSlider from '@/components/CheckInSlider';
import { calculateAverageScore } from '@/lib/database/checkins';
import { generateInsights, type Insight } from '@/lib/analytics/checkin-insights';
import { BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';
import { Calendar, TrendingUp, Lightbulb, ChevronRight } from 'lucide-react';

export default function CheckInsPage() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<DailyCheckIn[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state for today's check-in
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [attentionFocus, setAttentionFocus] = useState<number | null>(null);
  const [emotionalRegulation, setEmotionalRegulation] = useState<number | null>(null);
  const [behaviorQuality, setBehaviorQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  // Load children on mount
  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  // Load check-in data when selected child changes
  useEffect(() => {
    if (selectedChildId) {
      loadCheckInData();
    }
  }, [selectedChildId]);

  const loadChildren = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      setChildren(data || []);

      // Auto-select first child (primary or first in list)
      if (data && data.length > 0) {
        setSelectedChildId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckInData = async () => {
    if (!selectedChildId) return;

    try {
      // Load check-ins from API
      const response = await fetch(`/api/checkins?child_id=${selectedChildId}&days=7`);

      if (!response.ok) {
        throw new Error('Failed to load check-ins');
      }

      const data = await response.json();
      const checkIns = data.checkins || [];

      setRecentCheckIns(checkIns);

      // Find today's check-in
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIn = checkIns.find((c: DailyCheckIn) => c.checkin_date === today);

      setTodayCheckIn(todayCheckIn || null);

      // Populate form with today's values if they exist
      if (todayCheckIn) {
        setSleepQuality(todayCheckIn.sleep_quality);
        setAttentionFocus(todayCheckIn.attention_focus);
        setEmotionalRegulation(todayCheckIn.emotional_regulation);
        setBehaviorQuality(todayCheckIn.behavior_quality);
        setNotes(todayCheckIn.notes || '');
      } else {
        // Reset form for new check-in
        setSleepQuality(null);
        setAttentionFocus(null);
        setEmotionalRegulation(null);
        setBehaviorQuality(null);
        setNotes('');
      }

      // Generate insights if enough data
      if (checkIns.length >= 7) {
        const generatedInsights = generateInsights(checkIns);
        setInsights(generatedInsights);
      } else {
        setInsights([]);
      }
    } catch (error) {
      console.error('Error loading check-in data:', error);
    }
  };

  const handleSaveCheckIn = async () => {
    if (!user || !selectedChildId) return;

    // Validation: at least one dimension must be filled
    if (
      sleepQuality === null &&
      attentionFocus === null &&
      emotionalRegulation === null &&
      behaviorQuality === null
    ) {
      alert('Please fill in at least one dimension before saving.');
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Use API endpoint instead of direct database call
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_id: selectedChildId,
          checkin_date: today,
          sleep_quality: sleepQuality,
          attention_focus: attentionFocus,
          emotional_regulation: emotionalRegulation,
          behavior_quality: behaviorQuality,
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save check-in');
      }

      // Reload check-in data
      await loadCheckInData();

      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving check-in:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Keep alert for errors for now
      alert(`Failed to save check-in: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  if (loading) {
    return (
      <MobileDeviceMockup>
        <div className="w-full h-full bg-white flex items-center justify-center">
          <div style={{ color: '#7F8FA6' }}>Loading...</div>
        </div>
      </MobileDeviceMockup>
    );
  }

  // Empty state: no children
  if (children.length === 0) {
    return (
      <MobileDeviceMockup>
        <div className="w-full h-full bg-white flex flex-col relative" style={{ overflow: 'hidden' }}>
          <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

          <AppHeader
            onMenuClick={() => setIsDrawerOpen(true)}
            title="Daily Check-ins"
            subtitle="Track daily patterns"
          />

          <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
            <ContentContainer>
              <Card padding="large">
                <div className="text-center py-8">
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #D7CDEC 0%, #B7D3D8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      fontSize: '36px',
                    }}
                  >
                    📅
                  </div>

                  <h2
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#2C3E50',
                      marginBottom: '12px',
                      lineHeight: 1.3,
                      fontFamily: 'Quicksand, sans-serif',
                    }}
                  >
                    Add a child profile first
                  </h2>

                  <p
                    style={{
                      fontSize: '15px',
                      color: '#586C8E',
                      lineHeight: 1.6,
                      marginBottom: '24px',
                    }}
                  >
                    To start tracking daily check-ins, you'll need to add a child profile first.
                  </p>

                  <Button onClick={() => (window.location.href = '/family')} variant="primary">
                    Go to My Family
                  </Button>
                </div>
              </Card>
            </ContentContainer>
          </div>
        </div>
      </MobileDeviceMockup>
    );
  }

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative" style={{ overflow: 'hidden' }}>
        <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="Daily Check-ins"
          subtitle="Track daily patterns"
        />

        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>

            {/* Child Selector (if multiple children) */}
            {children.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  marginBottom: '16px',
                  paddingBottom: '4px',
                }}
              >
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    style={{
                      flex: '0 0 auto',
                      minWidth: '140px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border:
                        selectedChildId === child.id
                          ? '2px solid #B7D3D8'
                          : '1px solid rgba(215, 205, 236, 0.3)',
                      background:
                        selectedChildId === child.id
                          ? 'linear-gradient(135deg, rgba(215, 205, 236, 0.2), rgba(183, 211, 216, 0.2))'
                          : 'white',
                      color: '#2A3F5A',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {child.is_primary ? '⭐' : '👦'}
                    </span>
                    {child.child_name}
                  </button>
                ))}
              </div>
            )}

            {/* Success Message - Show at top of page */}
            {saveSuccess && (
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(107, 207, 127, 0.15)',
                  border: '2px solid rgba(107, 207, 127, 0.4)',
                  borderRadius: BORDER_RADIUS.medium,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  animation: 'slideDown 0.3s ease-out',
                }}
              >
                <span style={{ fontSize: '24px' }}>✅</span>
                <span style={{ fontSize: '16px', color: '#2E7D32', fontWeight: 700, fontFamily: 'Quicksand, sans-serif' }}>
                  Check-in saved! You're all set for today.
                </span>
              </div>
            )}

            {/* Already Checked In Notice */}
            {todayCheckIn && !saveSuccess && (
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(183, 211, 216, 0.15)',
                  border: '2px solid rgba(183, 211, 216, 0.4)',
                  borderRadius: BORDER_RADIUS.medium,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '20px' }}>ℹ️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px', color: '#2A3F5A', fontFamily: 'Quicksand, sans-serif', fontSize: '15px' }}>
                    Already checked in today
                  </div>
                  <div style={{ fontSize: '13px', color: '#586C8E' }}>
                    You've already completed today's check-in for {selectedChild?.child_name}. Come back tomorrow!
                  </div>
                </div>
              </div>
            )}

            {/* Today's Check-in Card */}
            <Card title={`Today - ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`} padding="large">
              {selectedChild && (
                <div style={{ marginBottom: '20px' }}>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#586C8E',
                      margin: 0,
                    }}
                  >
                    Checking in for <strong>{selectedChild.child_name}</strong>
                  </p>
                </div>
              )}

              {/* 4 Sliders */}
              <CheckInSlider
                label="Sleep Quality"
                icon="😴"
                value={sleepQuality}
                onChange={setSleepQuality}
                dimension="sleep_quality"
                disabled={!!todayCheckIn}
              />

              <CheckInSlider
                label="Attention & Focus"
                icon="🎯"
                value={attentionFocus}
                onChange={setAttentionFocus}
                dimension="attention_focus"
                disabled={!!todayCheckIn}
              />

              <CheckInSlider
                label="Emotional Regulation"
                icon="😊"
                value={emotionalRegulation}
                onChange={setEmotionalRegulation}
                dimension="emotional_regulation"
                disabled={!!todayCheckIn}
              />

              <CheckInSlider
                label="Behavior"
                icon="✨"
                value={behaviorQuality}
                onChange={setBehaviorQuality}
                dimension="behavior_quality"
                disabled={!!todayCheckIn}
              />

              {/* Optional Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="notes"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2A3F5A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontFamily: 'Quicksand, sans-serif',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📝</span>
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any context for today? (e.g., bad night - sibling conflict)"
                  maxLength={500}
                  rows={3}
                  disabled={!!todayCheckIn}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#2A3F5A',
                    border: '1px solid rgba(215, 205, 236, 0.3)',
                    borderRadius: BORDER_RADIUS.medium,
                    fontFamily: 'Quicksand, sans-serif',
                    resize: 'vertical',
                    outline: 'none',
                    cursor: todayCheckIn ? 'not-allowed' : 'text',
                    opacity: todayCheckIn ? 0.6 : 1,
                  }}
                />
                <div
                  style={{
                    fontSize: '11px',
                    color: '#7F8FA6',
                    marginTop: '4px',
                    textAlign: 'right',
                  }}
                >
                  {notes.length}/500
                </div>
              </div>

              {/* Save Button - Hide if already checked in today */}
              {!todayCheckIn && (
                <Button
                  onClick={handleSaveCheckIn}
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Check-in'}
                </Button>
              )}
            </Card>

            {/* Last 7 Days Card */}
            {recentCheckIns.length > 0 && (
              <Card title="Last 7 Days" padding="large">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentCheckIns.map((checkIn) => {
                    const avgScore = calculateAverageScore(checkIn);
                    const date = new Date(checkIn.checkin_date);
                    const dateStr = date.toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    });

                    return (
                      <div
                        key={checkIn.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'rgba(227, 234, 221, 0.2)',
                          borderRadius: BORDER_RADIUS.medium,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#2A3F5A',
                              marginBottom: '4px',
                            }}
                          >
                            {dateStr}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {/* Visual dots representing score out of 10 */}
                            {Array.from({ length: 10 }).map((_, idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background:
                                    idx < Math.round(avgScore)
                                      ? avgScore <= 3
                                        ? '#E6A897'
                                        : avgScore <= 7
                                        ? '#FFD93D'
                                        : '#6BCF7F'
                                      : 'rgba(209, 216, 224, 0.3)',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color:
                              avgScore <= 3
                                ? '#E6A897'
                                : avgScore <= 7
                                ? '#FFD93D'
                                : '#6BCF7F',
                            minWidth: '50px',
                            textAlign: 'right',
                          }}
                        >
                          {avgScore.toFixed(1)}/10
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View Full History Link */}
                <button
                  onClick={() => (window.location.href = '/check-ins/history')}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(215, 205, 236, 0.3)',
                    borderRadius: BORDER_RADIUS.medium,
                    color: '#586C8E',
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'Quicksand, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(227, 234, 221, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(183, 211, 216, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.3)';
                  }}
                >
                  View Full History
                  <ChevronRight size={16} />
                </button>
              </Card>
            )}

            {/* Pattern Insights Card (only if 7+ check-ins) */}
            {insights.length > 0 && (
              <Card title="Pattern Insights" padding="large">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <Lightbulb size={20} style={{ color: '#FFD93D' }} />
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#586C8E',
                      margin: 0,
                      fontStyle: 'italic',
                    }}
                  >
                    Based on your last {recentCheckIns.length} check-ins
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {insights.map((insight, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px',
                        background:
                          insight.severity === 'positive'
                            ? 'rgba(107, 207, 127, 0.1)'
                            : insight.severity === 'negative'
                            ? 'rgba(230, 168, 151, 0.1)'
                            : 'rgba(215, 205, 236, 0.1)',
                        borderRadius: BORDER_RADIUS.medium,
                        border: `1px solid ${
                          insight.severity === 'positive'
                            ? 'rgba(107, 207, 127, 0.3)'
                            : insight.severity === 'negative'
                            ? 'rgba(230, 168, 151, 0.3)'
                            : 'rgba(215, 205, 236, 0.3)'
                        }`,
                      }}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>
                        {insight.severity === 'positive'
                          ? '✅'
                          : insight.severity === 'negative'
                          ? '⚠️'
                          : '💡'}
                      </span>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#2A3F5A',
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {insight.message}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Encouragement message if less than 7 check-ins */}
            {recentCheckIns.length > 0 && recentCheckIns.length < 7 && (
              <Card padding="large">
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <TrendingUp
                    size={32}
                    style={{ color: '#D7CDEC', margin: '0 auto 12px' }}
                  />
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#586C8E',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    Keep going! Complete {7 - recentCheckIns.length} more check-in
                    {7 - recentCheckIns.length === 1 ? '' : 's'} to unlock pattern insights.
                  </p>
                </div>
              </Card>
            )}

          </ContentContainer>
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
