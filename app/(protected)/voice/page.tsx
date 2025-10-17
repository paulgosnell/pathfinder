'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ElevenLabsVoiceAssistant } from '@/components/ElevenLabsVoiceAssistant';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { SPACING } from '@/lib/styles/spacing';
import type { SessionType } from '@/lib/config/session-types';

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
