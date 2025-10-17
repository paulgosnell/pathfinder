'use client';

import { useState } from 'react';
import {
  Compass,
  Zap,
  MessageCircle,
  Target,
  AlertCircle,
  Heart,
  type LucideIcon
} from 'lucide-react';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import { SPACING, BORDER_RADIUS } from '@/lib/styles/spacing';
import { SESSION_TYPE_CONFIG, getSessionTypesOrdered, type SessionType } from '@/lib/config/session-types';

interface SessionTypeCardProps {
  onTypeSelected: (type: SessionType, suggestedTime: number) => void;
  discoveryCompleted?: boolean;
}

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  'Compass': Compass,
  'Zap': Zap,
  'MessageCircle': MessageCircle,
  'Target': Target,
  'AlertCircle': AlertCircle,
  'Heart': Heart,
};

/**
 * Session Type Selection Card Component
 *
 * Replaces the old TimeSelectionCard with purpose-based session selection.
 * Shows 6 session types:
 * - Discovery: Initial onboarding (shown first for new users)
 * - Quick Tip: Fast advice
 * - Update: Progress check-in
 * - Strategy: Issue deep-dive
 * - Crisis: Emergency support
 * - Coaching: Full GROW exploration
 *
 * Usage:
 * ```tsx
 * <SessionTypeCard
 *   onTypeSelected={(type, time) => {
 *     setSessionType(type);
 *     setTimeBudgetMinutes(time);
 *   }}
 *   discoveryCompleted={userProfile?.discovery_completed}
 * />
 * ```
 */
export function SessionTypeCard({ onTypeSelected, discoveryCompleted = false }: SessionTypeCardProps) {
  const [selectedType, setSelectedType] = useState<SessionType | null>(null);

  const handleSelectType = (type: SessionType) => {
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (selectedType !== null) {
      const config = SESSION_TYPE_CONFIG[selectedType];
      onTypeSelected(selectedType, config.suggestedTimeMinutes);
    }
  };

  // Get session types in recommended order (discovery first if not completed)
  const orderedTypes = getSessionTypesOrdered(discoveryCompleted);

  return (
    <Card title="What brings you here today?">
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
          Choose the type of session that fits what you need right now.
        </p>

        {/* Discovery Call Banner (if not completed) */}
        {!discoveryCompleted && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: BORDER_RADIUS.medium,
              background: 'rgba(240, 217, 218, 0.2)',
              border: '2px solid rgba(240, 217, 218, 0.5)',
              marginBottom: '8px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#2A3F5A',
                fontWeight: 600,
                lineHeight: '1.4',
              }}
            >
              💡 First time here? Start with a Discovery call so I can understand you and your child.
            </p>
          </div>
        )}

        {/* Session Type Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orderedTypes.map((typeId) => {
            const config = SESSION_TYPE_CONFIG[typeId];
            const IconComponent = ICON_MAP[config.icon];

            // Highlight discovery if not completed
            const isHighlighted = !discoveryCompleted && typeId === 'discovery';

            return (
              <button
                key={typeId}
                onClick={() => handleSelectType(typeId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: BORDER_RADIUS.medium,
                  border: selectedType === typeId
                    ? `2px solid ${config.color}`
                    : isHighlighted
                    ? '2px solid rgba(240, 217, 218, 0.5)'
                    : '2px solid rgba(215, 205, 236, 0.3)',
                  background: selectedType === typeId
                    ? `${config.color}20`  // 20% opacity
                    : isHighlighted
                    ? 'rgba(240, 217, 218, 0.1)'
                    : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== typeId) {
                    e.currentTarget.style.borderColor = `${config.color}80`;  // 50% opacity
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== typeId) {
                    e.currentTarget.style.borderColor = isHighlighted
                      ? 'rgba(240, 217, 218, 0.5)'
                      : 'rgba(215, 205, 236, 0.3)';
                  }
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: BORDER_RADIUS.small,
                    background: selectedType === typeId
                      ? config.color
                      : `${config.color}40`,  // 40% opacity
                  }}
                >
                  <IconComponent size={20} color="#2A3F5A" />
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
                    {config.title}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#5A6B7D',
                    }}
                  >
                    {config.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedType === typeId && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: config.color,
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
            );
          })}
        </div>

        {/* Confirm Button */}
        <div style={{ marginTop: '8px' }}>
          <Button
            onClick={handleConfirm}
            disabled={selectedType === null}
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
          We'll work at your pace - take as long as you need
        </p>
      </div>
    </Card>
  );
}
