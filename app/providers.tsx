'use client';

import { AuthProvider } from '@/lib/auth/auth-context';
import { VoiceSettingsProvider } from '@/lib/voice/voice-settings';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <VoiceSettingsProvider>
        {children}
      </VoiceSettingsProvider>
    </AuthProvider>
  );
}
