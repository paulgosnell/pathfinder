'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ElevenLabsVoiceAssistant } from '@/components/ElevenLabsVoiceAssistant';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { SPACING } from '@/lib/styles/spacing';
import type { SessionType } from '@/lib/config/session-types';
import { Settings } from 'lucide-react';
import Link from 'next/link';

// TEMPORARY: Set to true to enable maintenance mode
const VOICE_MAINTENANCE_MODE = true;

// Design system colors
const colors = {
  background: '#F9F7F3',
  primary: '#2A3F5A',
  secondary: '#586C8E',
  accent1: '#D7CDEC',
  accent2: '#B7D3D8',
  accent3: '#E3EADD',
};

export default function VoicePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const searchParams = useSearchParams();

  // Read URL parameters
  const urlSessionType = searchParams.get('sessionType') as SessionType | null;
  const urlTimeBudget = searchParams.get('time') ? parseInt(searchParams.get('time')!) : undefined;

  // Default to check-in mode (casual 5-15 min conversation)
  const sessionType: SessionType = urlSessionType || 'check-in';
  const timeBudgetMinutes = urlTimeBudget || 15;

  // Set title/subtitle based on session type
  const title = sessionType === 'coaching' ? 'Voice Coaching' : 'Voice Check-in';
  const subtitle = sessionType === 'coaching'
    ? 'Speak naturally with your coach'
    : 'How are you doing today?';

  // Show maintenance message if in maintenance mode
  if (VOICE_MAINTENANCE_MODE) {
    return (
      <MobileDeviceMockup>
        <div className="w-full h-full bg-white flex flex-col"
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               overflow: 'hidden'
             }}>

          <NavigationDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />

          {/* Header - Fixed at top */}
          <AppHeader
            onMenuClick={() => setIsDrawerOpen(true)}
            title="Voice Agent"
            subtitle="Currently unavailable"
          />

          {/* Maintenance Message */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            marginTop: SPACING.contentTopMargin,
            backgroundColor: colors.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              {/* Icon */}
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.4), rgba(183, 211, 216, 0.4))',
                boxShadow: '0 8px 32px rgba(215, 205, 236, 0.3)'
              }}>
                <Settings size={56} color={colors.primary} strokeWidth={1.5} />
              </div>

              {/* Message */}
              <h2 style={{
                color: colors.primary,
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '16px',
                letterSpacing: '-0.01em'
              }}>
                Voice Agent Being Upgraded
              </h2>

              <p style={{
                color: colors.secondary,
                fontSize: '1.125rem',
                lineHeight: 1.8,
                marginBottom: '32px'
              }}>
                We're making improvements to the voice experience. Back online soon!
              </p>

              {/* Chat Alternative Button */}
              <Link href="/chat">
                <button style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
                  color: colors.primary,
                  boxShadow: '0 8px 24px rgba(183, 211, 216, 0.3)',
                  transition: 'transform 0.2s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Use Text Chat Instead
                </button>
              </Link>

              <p style={{
                color: colors.secondary,
                fontSize: '0.875rem',
                marginTop: '24px',
                opacity: 0.7
              }}>
                Text chat is fully available with all coaching features
              </p>
            </div>
          </div>
        </div>
      </MobileDeviceMockup>
    );
  }

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col"
           style={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             overflow: 'hidden'
           }}>

        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        {/* Header - Fixed at top */}
        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        {/* Voice content - with margin for fixed header */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          marginTop: SPACING.contentTopMargin
        }}>
          <ElevenLabsVoiceAssistant
            sessionType={sessionType}
            timeBudgetMinutes={timeBudgetMinutes}
          />
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
