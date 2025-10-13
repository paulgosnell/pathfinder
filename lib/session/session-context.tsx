'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SessionContextType {
  currentSessionId: string | null;
  currentSessionMode: 'chat' | 'voice' | null;
  setCurrentSession: (sessionId: string | null, mode: 'chat' | 'voice' | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSessionMode, setCurrentSessionMode] = useState<'chat' | 'voice' | null>(null);

  // Load active session from API on mount
  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        const response = await fetch('/api/conversation', {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session && data.session.id) {
            setCurrentSessionId(data.session.id);
            setCurrentSessionMode(data.session.mode || 'chat');
          }
        }
      } catch (error) {
        console.error('Failed to load active session:', error);
      }
    };

    loadActiveSession();
  }, []);

  const setCurrentSession = (sessionId: string | null, mode: 'chat' | 'voice' | null) => {
    setCurrentSessionId(sessionId);
    setCurrentSessionMode(mode);
  };

  return (
    <SessionContext.Provider value={{ currentSessionId, currentSessionMode, setCurrentSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
