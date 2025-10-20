'use client';

import { useState, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, MessageCircle, Ear, Volume2, Info, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/auth/auth-context';
import { useSession } from '@/lib/session/session-context';

// Design system colors
const colors = {
  background: '#F9F7F3',
  primary: '#2A3F5A',
  secondary: '#586C8E',
  accent1: '#D7CDEC',
  accent2: '#B7D3D8',
  accent3: '#E3EADD',
  accent4: '#E6A897',
  accent5: '#F0D9DA',
};

import type { SessionType } from '@/lib/config/session-types';
import { getVoiceSystemPrompt, getVoiceFirstMessage, type VoiceUserContext } from '@/lib/agents/voice-prompts';

interface ElevenLabsVoiceAssistantProps {
  sessionType?: SessionType | null;
  timeBudgetMinutes?: number;
}

export function ElevenLabsVoiceAssistant({ sessionType, timeBudgetMinutes }: ElevenLabsVoiceAssistantProps) {
  const { user } = useAuth();
  const { setCurrentSession } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [userContext, setUserContext] = useState<VoiceUserContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);

  // Generate stable session ID (browser-compatible UUID)
  const sessionIdRef = useRef<string>('');

  if (!sessionIdRef.current) {
    // Use crypto.randomUUID if available, otherwise fallback to manual UUID generation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionIdRef.current = crypto.randomUUID();
    } else {
      // Fallback UUID v4 generator for browsers without crypto.randomUUID
      sessionIdRef.current = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Update the session context when we generate a new session ID
    setCurrentSession(sessionIdRef.current, 'voice');
  }

  // Load user context on mount
  useEffect(() => {
    async function loadUserContext() {
      if (!user) {
        setIsLoadingContext(false);
        return;
      }

      try {
        const response = await fetch('/api/voice-context');
        if (response.ok) {
          const data = await response.json();
          setUserContext(data);
          console.log('✅ Loaded user context for voice agent:', {
            hasProfile: !!data.userProfile,
            childCount: data.childProfiles?.length || 0,
            conversationCount: data.recentConversations?.length || 0,
          });
        } else {
          console.error('Failed to load user context:', response.statusText);
        }
      } catch (err) {
        console.error('Error loading user context:', err);
      } finally {
        setIsLoadingContext(false);
      }
    }

    loadUserContext();
  }, [user]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setIsConnected(true);
      setError(undefined);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setIsConnected(false);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Connection error occurred');
      setIsConnected(false);
    },
    onMessage: async (message) => {
      // Save transcript to database
      try {
        await fetch('/api/voice-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            userId: user?.id,
            role: message.source === 'user' ? 'user' : 'assistant',
            content: message.message,
          }),
        });
      } catch (err) {
        console.error('Failed to save voice transcript:', err);
        // Don't show error to user - transcript saving shouldn't disrupt conversation
      }
    },
  });

  const startSession = async () => {
    setError(undefined);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get session type (default to coaching if not set)
      const sessionTypeValue = sessionType || 'coaching';
      const timeBudget = timeBudgetMinutes || 50;

      // Map SessionType to voice prompt type
      // Voice has only 3 modes: discovery, check-in, coaching
      const mode: 'discovery' | 'check-in' | 'coaching' =
        sessionTypeValue === 'discovery' ? 'discovery' :
        sessionTypeValue === 'coaching' ? 'coaching' :
        'check-in'; // All others (quick-tip, update, strategy, crisis) use check-in

      // Get voice-optimized prompts for this session type with user context
      const systemPrompt = getVoiceSystemPrompt(mode, timeBudget, userContext || undefined);
      const firstMessage = getVoiceFirstMessage(mode);

      console.log('🎤 Starting voice session with context:', {
        mode,
        hasUserContext: !!userContext,
        childCount: userContext?.childProfiles?.length || 0,
      });

      // Start conversation with ElevenLabs agent
      // Using overrides to control prompts from code (not dashboard)
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        connectionType: 'webrtc',

        // Override system prompt and first message based on session type
        overrides: {
          agent: {
            prompt: {
              prompt: systemPrompt,
            },
            firstMessage: firstMessage,
            language: 'en',
          },
        },

        // Also pass dynamic variables for backwards compatibility
        dynamicVariables: {
          time_budget_minutes: timeBudget,
          session_type: mode,
        },
      });
    } catch (err) {
      console.error('Failed to start voice session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    }
  };

  const endSession = async () => {
    await conversation.endSession();
    setIsConnected(false);
  };

  // Show error if connection fails
  if (error && !error.includes('sign in')) {
    return (
      <div className="flex items-center justify-center h-full p-8" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(230, 168, 151, 0.2)' }}
          >
            <AlertCircle size={32} color={colors.accent4} />
          </div>
          <h2
            className="font-display font-semibold text-xl mb-2"
            style={{ color: colors.primary }}
          >
            Connection Error
          </h2>
          <p style={{ color: colors.secondary, marginBottom: '1.5rem' }}>
            {error}
          </p>

          <button
            onClick={() => {
              setError(undefined);
              startSession();
            }}
            className="py-3 px-6 rounded-full font-semibold transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
              color: colors.primary,
              boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching user context
  if (isLoadingContext) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(215, 205, 236, 0.2)' }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(215, 205, 236, 0.3)',
                borderTopColor: colors.accent1,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            ></div>
          </div>
          <p style={{ color: colors.secondary }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    // Initial state - show "Start Session" button
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 40px',
        backgroundColor: colors.background
      }}>
        {/* Icon Circle with glow effect */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
            <Mic size={56} color={colors.primary} strokeWidth={1.5} />
          </div>

          <p style={{
            color: colors.primary,
            lineHeight: 1.8,
            letterSpacing: '-0.01em',
            fontSize: '1.125rem',
            fontWeight: 500,
            padding: '0 16px'
          }}>
            Ready to talk? I'm here to listen and help.
          </p>
        </div>

        {/* Start Button with enhanced styling */}
        <button
          onClick={startSession}
          disabled={conversation.status === 'connecting'}
          style={{
            width: '100%',
            padding: '20px 24px',
            borderRadius: '9999px',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '-0.01em',
            border: 'none',
            cursor: conversation.status === 'connecting' ? 'not-allowed' : 'pointer',
            background: conversation.status === 'connecting'
              ? 'rgba(215, 205, 236, 0.5)'
              : 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
            color: colors.primary,
            boxShadow: '0 8px 24px rgba(183, 211, 216, 0.3)',
            opacity: conversation.status === 'connecting' ? 0.5 : 1,
            marginBottom: '16px'
          }}
        >
          {conversation.status === 'connecting' ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              Connecting...
            </span>
          ) : (
            'Start Voice Session'
          )}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: colors.secondary,
          opacity: 0.6
        }}>
          <Info size={14} />
          <span>Make sure your microphone is enabled</span>
        </div>
      </div>
    );
  }

  // Active session
  return (
    <VoiceAssistantUI
      conversation={conversation}
      onEndSession={endSession}
    />
  );
}

function VoiceAssistantUI({
  conversation,
  onEndSession
}: {
  conversation: ReturnType<typeof useConversation>;
  onEndSession: () => void;
}) {
  const getStateInfo = () => {
    if (conversation.isSpeaking) {
      return {
        text: 'Speaking...',
        icon: <Volume2 size={64} color={colors.primary} strokeWidth={1.5} />,
        color: 'rgba(227, 234, 221, 0.4)',
      };
    }

    // When agent is not speaking, assume we're listening or ready
    return {
      text: "I'm listening...",
      icon: <Ear size={64} color={colors.primary} strokeWidth={1.5} />,
      color: 'rgba(183, 211, 216, 0.4)',
    };
  };

  const stateInfo = getStateInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Status Info at Top */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(215, 205, 236, 0.1)',
        backgroundColor: 'rgba(227, 234, 221, 0.2)'
      }}>
        <p style={{ fontSize: '14px', color: colors.secondary, margin: 0, textAlign: 'center' }}>
          {stateInfo.text}
        </p>
      </div>

      {/* Visualizer Area */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        backgroundColor: colors.background
      }}>
        {/* Pulsing Circle Indicator */}
        <div style={{ position: 'relative', marginBottom: '48px' }}>
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: `linear-gradient(135deg, ${stateInfo.color}, ${stateInfo.color})`,
            boxShadow: `0 8px 32px ${stateInfo.color}`
          }}>
            {stateInfo.icon}

            {/* Pulsing ring animation when listening */}
            {!conversation.isSpeaking && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: stateInfo.color,
                  opacity: 0.3,
                }}
              ></div>
            )}
          </div>
        </div>

        {/* Coaching Tip */}
        <div style={{
          padding: '20px 24px',
          borderRadius: '16px',
          maxWidth: '360px',
          textAlign: 'center',
          backgroundColor: 'rgba(227, 234, 221, 0.4)',
          border: '1px solid rgba(227, 234, 221, 0.6)',
          boxShadow: '0 2px 8px rgba(227, 234, 221, 0.2)'
        }}>
          <p style={{
            fontSize: '15px',
            color: colors.primary,
            lineHeight: 1.6,
            margin: 0
          }}>
            {conversation.isSpeaking
              ? "You can interrupt me anytime."
              : "Take your time. I'm here to listen."}
          </p>
        </div>

        {/* Status Info */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{
            fontSize: '12px',
            color: colors.secondary,
            opacity: 0.6,
            margin: 0
          }}>
            Status: {conversation.status}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: '24px',
        borderTop: '1px solid rgba(215, 205, 236, 0.1)'
      }}>
        {/* End Session Button */}
        <button
          onClick={onEndSession}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: '9999px',
            fontWeight: 600,
            fontSize: '16px',
            backgroundColor: 'rgba(215, 205, 236, 0.3)',
            color: colors.primary,
            border: '1px solid rgba(215, 205, 236, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          End Session
        </button>
      </div>
    </div>
  );
}
