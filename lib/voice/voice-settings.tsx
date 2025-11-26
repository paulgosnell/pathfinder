'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Available OpenAI Realtime voices
// See: https://platform.openai.com/docs/guides/realtime
export const VOICE_OPTIONS = [
  { id: 'sage', name: 'Sage', description: 'Warm and empathetic' },
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
  { id: 'echo', name: 'Echo', description: 'Soft and gentle' },
  { id: 'shimmer', name: 'Shimmer', description: 'Bright and clear' },
  { id: 'ash', name: 'Ash', description: 'Calm and steady' },
  { id: 'ballad', name: 'Ballad', description: 'Expressive and dynamic' },
  { id: 'coral', name: 'Coral', description: 'Friendly and approachable' },
  { id: 'verse', name: 'Verse', description: 'Natural and conversational' },
] as const;

export type VoiceId = typeof VOICE_OPTIONS[number]['id'];

interface VoiceSettingsContextType {
  selectedVoice: VoiceId;
  setSelectedVoice: (voice: VoiceId) => void;
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'pathfinder-voice-preference';

export function VoiceSettingsProvider({ children }: { children: ReactNode }) {
  const [selectedVoice, setSelectedVoiceState] = useState<VoiceId>('sage');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VOICE_OPTIONS.some(v => v.id === stored)) {
      setSelectedVoiceState(stored as VoiceId);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when changed
  const setSelectedVoice = (voice: VoiceId) => {
    setSelectedVoiceState(voice);
    localStorage.setItem(STORAGE_KEY, voice);
  };

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <VoiceSettingsContext.Provider value={{ selectedVoice, setSelectedVoice }}>
      {children}
    </VoiceSettingsContext.Provider>
  );
}

export function useVoiceSettings() {
  const context = useContext(VoiceSettingsContext);
  if (context === undefined) {
    // Return default values if used outside provider
    return {
      selectedVoice: 'sage' as VoiceId,
      setSelectedVoice: () => {},
    };
  }
  return context;
}
