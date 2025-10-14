'use client';

import { useState } from 'react';
import { ElevenLabsVoiceAssistant } from '@/components/ElevenLabsVoiceAssistant';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { SessionTypeCard } from '@/components/SessionTypeCard';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import type { SessionType } from '@/lib/config/session-types';

export default function VoicePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [timeBudgetMinutes, setTimeBudgetMinutes] = useState<number>(50);

  const handleTypeSelected = (type: SessionType, suggestedTime: number) => {
    setSessionType(type);
    setTimeBudgetMinutes(suggestedTime);
  };

  // Show session type selection screen if type not set
  if (sessionType === null) {
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
              <SessionTypeCard onTypeSelected={handleTypeSelected} discoveryCompleted={false} />
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
          <ElevenLabsVoiceAssistant sessionType={sessionType} timeBudgetMinutes={timeBudgetMinutes} />
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
