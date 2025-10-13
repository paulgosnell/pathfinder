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
        <div className="w-full h-full bg-white flex flex-col relative" style={{ overflow: 'hidden' }}>
          <NavigationDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />

          <AppHeader
            onMenuClick={() => setIsDrawerOpen(true)}
            title="Voice Coaching"
            subtitle="Speak naturally with your coach"
          />

          <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
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
      <div className="w-full h-full bg-white flex flex-col relative"
           style={{
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

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ElevenLabsVoiceAssistant timeBudgetMinutes={timeBudgetMinutes} />
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
