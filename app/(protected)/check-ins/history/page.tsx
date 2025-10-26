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
import { calculateAverageScore } from '@/lib/database/checkins';
import { BORDER_RADIUS } from '@/lib/styles/spacing';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function CheckInHistoryPage() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChildId) {
      loadCheckIns();
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

      if (data && data.length > 0) {
        setSelectedChildId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckIns = async () => {
    if (!selectedChildId) return;

    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('child_id', selectedChildId)
        .order('checkin_date', { ascending: false })
        .limit(90); // Last 90 days

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error loading check-ins:', error);
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

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative" style={{ overflow: 'hidden' }}>
        <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="Check-in History"
          subtitle={selectedChild ? selectedChild.child_name : 'All check-ins'}
        />

        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>
            {/* Back Button */}
            <button
              onClick={() => (window.location.href = '/check-ins')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: '#586C8E',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Quicksand, sans-serif',
              }}
            >
              <ArrowLeft size={16} />
              Back to Check-ins
            </button>

            {/* Child Selector */}
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

            {/* History List */}
            {checkIns.length === 0 ? (
              <Card padding="large">
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Calendar size={48} style={{ color: '#D7CDEC', margin: '0 auto 16px' }} />
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#2A3F5A',
                      marginBottom: '8px',
                      fontFamily: 'Quicksand, sans-serif',
                    }}
                  >
                    No check-ins yet
                  </h3>
                  <p style={{ fontSize: '14px', color: '#586C8E', margin: 0 }}>
                    Start tracking daily patterns to see your history here.
                  </p>
                </div>
              </Card>
            ) : (
              <Card title={`${checkIns.length} Check-ins`} padding="large">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {checkIns.map((checkIn) => {
                    const avgScore = calculateAverageScore(checkIn);
                    const date = new Date(checkIn.checkin_date);
                    const dateStr = date.toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={checkIn.id}
                        style={{
                          padding: '16px',
                          background: 'white',
                          borderRadius: BORDER_RADIUS.medium,
                          border: '1px solid rgba(215, 205, 236, 0.3)',
                        }}
                      >
                        {/* Date and Overall Score */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#2A3F5A' }}>
                            {dateStr}
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
                            }}
                          >
                            {avgScore.toFixed(1)}/10
                          </div>
                        </div>

                        {/* Individual Dimensions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {checkIn.sleep_quality !== null && (
                            <div style={{ fontSize: '12px', color: '#586C8E' }}>
                              😴 Sleep: <strong>{checkIn.sleep_quality}/10</strong>
                            </div>
                          )}
                          {checkIn.attention_focus !== null && (
                            <div style={{ fontSize: '12px', color: '#586C8E' }}>
                              🎯 Attention: <strong>{checkIn.attention_focus}/10</strong>
                            </div>
                          )}
                          {checkIn.emotional_regulation !== null && (
                            <div style={{ fontSize: '12px', color: '#586C8E' }}>
                              😊 Emotions: <strong>{checkIn.emotional_regulation}/10</strong>
                            </div>
                          )}
                          {checkIn.behavior_quality !== null && (
                            <div style={{ fontSize: '12px', color: '#586C8E' }}>
                              ✨ Behavior: <strong>{checkIn.behavior_quality}/10</strong>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {checkIn.notes && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '8px 12px',
                              background: 'rgba(215, 205, 236, 0.1)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              color: '#586C8E',
                              fontStyle: 'italic',
                            }}
                          >
                            "{checkIn.notes}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </ContentContainer>
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
