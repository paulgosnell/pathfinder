'use client';

import { useState } from 'react';
import { X, Clock, Calendar, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CoachingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoachingBookingModal({ isOpen, onClose }: CoachingBookingModalProps) {
  const router = useRouter();
  const [timeBudget, setTimeBudget] = useState<30 | 50>(30);
  const [startOption, setStartOption] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartSession = async () => {
    if (startOption === 'now') {
      // Start coaching session immediately
      setLoading(true);

      // Close modal first
      onClose();

      // Use window.location.href for hard navigation to force page re-mount
      // This ensures the URL params are picked up even if already on /chat
      setTimeout(() => {
        window.location.href = `/chat?new=true&mode=coaching&time=${timeBudget}`;
      }, 100);
    } else {
      // Schedule for later
      if (!scheduledDate || !scheduledTime) {
        alert('Please select a date and time for your session');
        return;
      }

      setLoading(true);

      try {
        const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);

        const response = await fetch('/api/sessions/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scheduledFor: scheduledFor.toISOString(),
            timeBudgetMinutes: timeBudget,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to schedule session');
        }

        const result = await response.json();

        // Success! Automatically download calendar event
        generateCalendarEvent('apple');

        // Show success message and redirect to sessions page
        alert('Session scheduled successfully! Check your calendar and the Sessions page.');
        onClose();

        // Redirect to sessions page to see scheduled session
        setTimeout(() => {
          router.push('/sessions?tab=upcoming');
        }, 500);

      } catch (error) {
        console.error('Error scheduling session:', error);
        alert(error instanceof Error ? error.message : 'Failed to schedule session. Please try again.');
        setLoading(false);
      }
    }
  };

  const generateCalendarEvent = (format: 'google' | 'apple') => {
    if (!scheduledDate || !scheduledTime) {
      alert('Please select a date and time first');
      return;
    }

    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const endTime = new Date(dateTime.getTime() + timeBudget * 60000);

    const title = 'ADHD Parent Coaching Session';
    const description = `Structured GROW model coaching session (${timeBudget} minutes)`;
    const location = 'Pathfinder App';

    if (format === 'google') {
      // Google Calendar format
      const startStr = dateTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const endStr = endTime.toISOString().replace(/-|:|\.\d\d\d/g, '');

      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

      window.open(url, '_blank');
    } else {
      // Apple Calendar (.ics file)
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${dateTime.toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
        `DTEND:${endTime.toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pathfinder-coaching-session.ics';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(42, 63, 90, 0.6)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(42, 63, 90, 0.2)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
              padding: '20px',
              position: 'relative'
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#586C8E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: '#2A3F5A',
              marginBottom: '8px'
            }}>
              Book Coaching Session
            </h2>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#586C8E',
              lineHeight: 1.5
            }}>
              Structured GROW model coaching to help you work through challenges in depth
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {/* Time Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#2A3F5A',
                marginBottom: '12px'
              }}>
                How much time do you have?
              </label>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setTimeBudget(30)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: timeBudget === 30 ? '2px solid #D7CDEC' : '2px solid rgba(215, 205, 236, 0.3)',
                    backgroundColor: timeBudget === 30 ? 'rgba(215, 205, 236, 0.1)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Clock size={18} style={{ marginBottom: '4px', color: '#D7CDEC' }} />
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#2A3F5A' }}>30 min</div>
                  <div style={{ fontSize: '12px', color: '#586C8E' }}>Standard</div>
                </button>

                <button
                  onClick={() => setTimeBudget(50)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: timeBudget === 50 ? '2px solid #D7CDEC' : '2px solid rgba(215, 205, 236, 0.3)',
                    backgroundColor: timeBudget === 50 ? 'rgba(215, 205, 236, 0.1)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Clock size={18} style={{ marginBottom: '4px', color: '#D7CDEC' }} />
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#2A3F5A' }}>50 min</div>
                  <div style={{ fontSize: '12px', color: '#586C8E' }}>Deep dive</div>
                </button>
              </div>
            </div>

            {/* Start Time */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#2A3F5A',
                marginBottom: '12px'
              }}>
                When?
              </label>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button
                  onClick={() => setStartOption('now')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: startOption === 'now' ? '2px solid #D7CDEC' : '2px solid rgba(215, 205, 236, 0.3)',
                    backgroundColor: startOption === 'now' ? 'rgba(215, 205, 236, 0.1)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2A3F5A'
                  }}
                >
                  Start now
                </button>

                <button
                  onClick={() => setStartOption('later')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: startOption === 'later' ? '2px solid #D7CDEC' : '2px solid rgba(215, 205, 236, 0.3)',
                    backgroundColor: startOption === 'later' ? 'rgba(215, 205, 236, 0.1)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2A3F5A'
                  }}
                >
                  Schedule for later
                </button>
              </div>

              {/* Schedule inputs */}
              {startOption === 'later' && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(227, 234, 221, 0.3)', borderRadius: '8px' }}>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(215, 205, 236, 0.3)',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(215, 205, 236, 0.3)',
                      marginBottom: '12px',
                      fontSize: '14px'
                    }}
                  />

                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#2A3F5A', marginBottom: '8px' }}>
                    Add to calendar:
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => generateCalendarEvent('google')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(215, 205, 236, 0.3)',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Calendar size={14} />
                      Google
                    </button>
                    <button
                      onClick={() => generateCalendarEvent('apple')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(215, 205, 236, 0.3)',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Download size={14} />
                      Apple
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartSession}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
                color: '#2A3F5A',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Starting...' : startOption === 'now' ? 'Start Session' : 'Save & Set Reminder'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
