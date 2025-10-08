'use client';

import { useState, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, MessageCircle, Ear, Volume2, Info, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ElevenLabsVoiceAssistant() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Generate stable session ID, get real user ID from auth
  const sessionIdRef = useRef<string>('');
  const userIdRef = useRef<string>('');

  if (!sessionIdRef.current) {
    sessionIdRef.current = crypto.randomUUID();
  }

  // Get authenticated user ID
  useEffect(() => {
    async function getAuthUser() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setError('Please sign in to use voice mode');
          setIsLoadingAuth(false);
          return;
        }

        userIdRef.current = user.id;
        setIsLoadingAuth(false);
      } catch (err) {
        console.error('Failed to get authenticated user:', err);
        setError('Authentication error. Please try signing in again.');
        setIsLoadingAuth(false);
      }
    }

    getAuthUser();
  }, []);

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
            userId: userIdRef.current,
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

      // Start conversation with ElevenLabs agent
      // Note: Not using custom workletPaths to avoid CSP issues with blob: URLs
      // The CSP now allows worker-src 'self' blob: to support this
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        connectionType: 'webrtc',
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

  // Show loading state while checking auth
  if (isLoadingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden border flex flex-col p-8"
          style={{
            boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
            borderColor: 'rgba(215, 205, 236, 0.2)'
          }}
        >
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(215, 205, 236, 0.2)' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid',
                  borderColor: colors.accent1,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              ></div>
            </div>
            <p style={{ color: colors.secondary }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden border flex flex-col p-8"
          style={{
            boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
            borderColor: 'rgba(215, 205, 236, 0.2)'
          }}
        >
          <div className="text-center mb-6">
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
              {error.includes('sign in') ? 'Authentication Required' : 'Connection Error'}
            </h2>
            <p style={{ color: colors.secondary, marginBottom: '1.5rem' }}>
              {error}
            </p>
          </div>

          {error.includes('sign in') ? (
            <a
              href="/chat"
              className="w-full py-3 px-6 rounded-full font-semibold transition-transform hover:scale-105 text-center block"
              style={{
                background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                color: colors.primary,
                boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
                textDecoration: 'none'
              }}
            >
              Go to Sign In
            </a>
          ) : (
            <button
              onClick={() => {
                setError(undefined);
                startSession();
              }}
              className="w-full py-3 px-6 rounded-full font-semibold transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                color: colors.primary,
                boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    // Initial state - show "Start Session" button
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5 sm:p-10"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="w-full max-w-[400px] h-[700px] mx-auto bg-white rounded-3xl overflow-hidden border flex flex-col"
          style={{
            boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
            borderColor: 'rgba(215, 205, 236, 0.2)'
          }}
        >
          {/* Header - matching chat page */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7))',
              padding: '16px 24px',
              minHeight: '72px',
              boxShadow: '0 2px 8px rgba(42, 63, 90, 0.06)'
            }}
          >
            <div className="relative z-10" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div>
                <h1
                  className="font-display font-semibold m-0"
                  style={{
                    color: colors.primary,
                    fontSize: '20px',
                    lineHeight: 1.05,
                    letterSpacing: '0'
                  }}
                >
                  Voice Coaching
                </h1>
                <p
                  className="text-sm"
                  style={{
                    color: colors.secondary,
                    fontSize: '13px',
                    margin: '2px 0 0 0'
                  }}
                >
                  Speak naturally with your coach
                </p>
              </div>

              {/* Chat Button */}
              <a
                href="/chat"
                className="inline-flex items-center gap-2 text-xs rounded-full border transition-all hover:scale-105"
                style={{
                  color: colors.secondary,
                  borderColor: 'rgba(215, 205, 236, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  textDecoration: 'none',
                  padding: '10px 16px'
                }}
              >
                <MessageCircle size={16} />
                <span>Chat</span>
              </a>
            </div>
          </div>

          {/* Content Area */}
          <div style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 40px',
            overflow: 'auto'
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
        </div>
      </div>
    );
  }

  // Active session
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden border flex flex-col"
        style={{
          boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
          borderColor: 'rgba(215, 205, 236, 0.2)',
          height: '700px'
        }}
      >
        <VoiceAssistantUI
          conversation={conversation}
          onEndSession={endSession}
        />
      </div>
    </div>
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
      {/* Header */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7))',
        boxShadow: '0 2px 8px rgba(42, 63, 90, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{
              fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
              fontWeight: 600,
              fontSize: '20px',
              color: colors.primary,
              margin: 0,
              marginBottom: '4px'
            }}>
              Voice Session Active
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '14px', color: colors.secondary, margin: 0 }}>
                {stateInfo.text}
              </p>
            </div>
          </div>

          <a
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(215, 205, 236, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              color: colors.secondary,
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageCircle size={16} />
            <span>Chat</span>
          </a>
        </div>
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
