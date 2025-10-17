'use client';

import { useState } from 'react';
import { ElevenLabsVoiceAssistant } from '@/components/ElevenLabsVoiceAssistant';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { SPACING } from '@/lib/styles/spacing';

export default function VoicePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
          title="Voice Coaching"
          subtitle="Speak naturally with your coach"
        />

        {/* Voice content - with margin for fixed header */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          marginTop: SPACING.contentTopMargin
        }}>
          <ElevenLabsVoiceAssistant sessionType="coaching" timeBudgetMinutes={50} />
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
