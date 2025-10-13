'use client';

import { useState } from 'react';
import { ElevenLabsVoiceAssistant } from '@/components/ElevenLabsVoiceAssistant';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { TimeSelectionCard } from '@/components/TimeSelectionCard';
import { ContentContainer } from '@/components/layouts/ContentContainer';

export default function VoicePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timeBudgetMinutes, setTimeBudgetMinutes] = useState<number | null>(null);

  const handleTimeSelected = (minutes: number) => {
    setTimeBudgetMinutes(minutes);
  };

  // Show time selection screen if time budget not set
  if (timeBudgetMinutes === null) {
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

          <AppHeader
            onMenuClick={() => setIsDrawerOpen(true)}
            title="Voice Coaching"
            subtitle="Speak naturally with your coach"
          />

          <div className="flex-grow overflow-y-auto"
               style={{
                 backgroundColor: '#F9F7F3',
                 paddingTop: '72px'
               }}>
            <ContentContainer>
              <TimeSelectionCard onTimeSelected={handleTimeSelected} />
            </ContentContainer>
          </div>
        </div>
      </MobileDeviceMockup>
    );
  }

  // Show voice interface once time is selected
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

        {/* Voice content - with padding for fixed header */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          paddingTop: '72px' // Height of fixed header
        }}>
          <ElevenLabsVoiceAssistant timeBudgetMinutes={timeBudgetMinutes} />
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
