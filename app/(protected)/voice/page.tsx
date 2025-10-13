'use client';

import { useState } from 'react';
import { ElevenLabsVoiceAssistant } from '@/components/ElevenLabsVoiceAssistant';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';

export default function VoicePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
          <ElevenLabsVoiceAssistant />
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
