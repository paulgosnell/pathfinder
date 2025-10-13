'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import { SPACING, BORDER_RADIUS } from '@/lib/styles/spacing';

interface TimeSelectionCardProps {
  onTimeSelected: (minutes: number) => void;
}

const TIME_OPTIONS = [
  { value: 5, label: '5 mins', description: 'Quick check-in' },
  { value: 15, label: '15 mins', description: 'Short session' },
  { value: 30, label: '30 mins', description: 'Standard session' },
  { value: 50, label: '50 mins', description: 'Deep dive' },
];

/**
 * Time Selection Card Component
 *
 * Allows parents to select their available time for a coaching session.
 * The agent will adapt the coaching depth and GROW model progression based on this selection.
 *
 * Usage:
 * - Display before starting a chat or voice session
 * - Selected time is saved to session state
 * - Agent receives time budget in system prompt
 */
export function TimeSelectionCard({ onTimeSelected }: TimeSelectionCardProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const handleSelectTime = (minutes: number) => {
    setSelectedTime(minutes);
  };

  const handleConfirm = () => {
    if (selectedTime !== null) {
      onTimeSelected(selectedTime);
    }
  };

  return (
    <Card title="How much time do you have today?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.formFieldGap }}>
        {/* Description */}
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#5A6B7D',
            lineHeight: '1.5',
          }}
        >
          Choose your available time so we can tailor the session to fit your schedule. You can always extend if needed.
        </p>

        {/* Time Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectTime(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: BORDER_RADIUS.medium,
                border: selectedTime === option.value
                  ? '2px solid #B7D3D8'
                  : '2px solid rgba(215, 205, 236, 0.3)',
                background: selectedTime === option.value
                  ? 'rgba(183, 211, 216, 0.1)'
                  : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (selectedTime !== option.value) {
                  e.currentTarget.style.borderColor = 'rgba(183, 211, 216, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTime !== option.value) {
                  e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.3)';
                }
              }}
            >
              {/* Clock Icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: BORDER_RADIUS.small,
                  background: selectedTime === option.value
                    ? 'linear-gradient(to right, #D7CDEC, #B7D3D8)'
                    : 'rgba(215, 205, 236, 0.2)',
                }}
              >
                <Clock size={20} color="#2A3F5A" />
              </div>

              {/* Label and Description */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#2A3F5A',
                    marginBottom: '2px',
                  }}
                >
                  {option.label}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#5A6B7D',
                  }}
                >
                  {option.description}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedTime === option.value && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'white',
                    }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <div style={{ marginTop: '8px' }}>
          <Button
            onClick={handleConfirm}
            disabled={selectedTime === null}
          >
            Start Session
          </Button>
        </div>

        {/* Info Text */}
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#9CA3AF',
            textAlign: 'center',
            lineHeight: '1.4',
          }}
        >
          Don't worry - we can extend your session if you need more time
        </p>
      </div>
    </Card>
  );
}
