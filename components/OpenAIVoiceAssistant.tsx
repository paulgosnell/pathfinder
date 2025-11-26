'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Ear, Volume2, Info, AlertCircle, PhoneOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSession } from '@/lib/session/session-context';
import type { SessionType } from '@/lib/config/session-types';
import { getVoiceSystemPrompt, getVoiceFirstMessage, type VoiceUserContext } from '@/lib/agents/voice-prompts';

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

interface OpenAIVoiceAssistantProps {
  sessionType?: SessionType | null;
  timeBudgetMinutes?: number;
}

// OpenAI Realtime API event types
interface RealtimeEvent {
  type: string;
  session?: {
    id?: string;
  };
  error?: {
    message?: string;
    code?: string;
  };
  response?: {
    id?: string;
  };
  item?: {
    id?: string;
    role?: string;
  };
  transcript?: string;
  delta?: string;
}

export function OpenAIVoiceAssistant({ sessionType, timeBudgetMinutes }: OpenAIVoiceAssistantProps) {
  const { user } = useAuth();
  const { setCurrentSession } = useSession();

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User context state
  const [userContext, setUserContext] = useState<VoiceUserContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);

  // Refs for WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);

  // Session tracking
  const sessionIdRef = useRef<string>('');
  const isFetchingContextRef = useRef(false);
  const hasLoadedContextRef = useRef(false);

  // Generate stable session ID
  if (!sessionIdRef.current) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionIdRef.current = crypto.randomUUID();
    } else {
      sessionIdRef.current = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    setCurrentSession(sessionIdRef.current, 'voice');
  }

  // Setup audio element on mount
  useEffect(() => {
    isMountedRef.current = true;
    if (!remoteAudioRef.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      remoteAudioRef.current = audio;
    }
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, []);

  // Load user context on mount
  useEffect(() => {
    async function loadUserContext() {
      if (!user) {
        setIsLoadingContext(false);
        return;
      }

      if (hasLoadedContextRef.current) {
        console.log('⏩ Context already loaded, skipping fetch');
        setIsLoadingContext(false);
        return;
      }

      if (isFetchingContextRef.current) {
        console.log('⏩ Skipping duplicate context fetch (already in progress)');
        return;
      }

      isFetchingContextRef.current = true;

      try {
        const response = await fetch('/api/voice-context');
        if (response.ok) {
          const data = await response.json();
          setUserContext(data);
          hasLoadedContextRef.current = true;
          console.log('✅ Loaded user context for OpenAI voice agent:', {
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
        isFetchingContextRef.current = false;
      }
    }

    loadUserContext();
  }, [user?.id]);

  // Handle data channel messages from OpenAI
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const data: RealtimeEvent = JSON.parse(event.data);

      switch (data.type) {
        case 'session.created':
          console.log('🎙️ OpenAI session created');

          // Get session type and prompts
          const sessionTypeValue = sessionType || 'check-in';
          const timeBudget = timeBudgetMinutes || 15;

          const mode: 'discovery' | 'check-in' | 'coaching' =
            sessionTypeValue === 'discovery' ? 'discovery' :
            sessionTypeValue === 'coaching' ? 'coaching' :
            'check-in';

          const systemPrompt = getVoiceSystemPrompt(mode, timeBudget, userContext || undefined);
          const firstMessage = getVoiceFirstMessage(mode);

          // Send session configuration with system prompt
          dataChannelRef.current?.send(JSON.stringify({
            type: 'session.update',
            session: {
              instructions: systemPrompt,
              voice: 'sage', // Warm, empathetic voice
              input_audio_transcription: { model: 'whisper-1' },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 700 // Slightly longer for natural pauses
              }
            }
          }));

          // Trigger first message after brief delay
          setTimeout(() => {
            dataChannelRef.current?.send(JSON.stringify({
              type: 'response.create',
              response: {
                modalities: ['text', 'audio'],
                instructions: `Say exactly: "${firstMessage}"`
              }
            }));
          }, 500);
          break;

        case 'session.updated':
          console.log('✅ OpenAI session configured');
          if (isMountedRef.current) {
            setIsConnected(true);
            setIsInitializing(false);
          }
          break;

        case 'input_audio_buffer.speech_started':
          console.log('🎤 User started speaking');
          if (isMountedRef.current) {
            setIsMicrophoneActive(true);
            setIsAgentSpeaking(false);
          }
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('🎤 User stopped speaking');
          if (isMountedRef.current) {
            setIsMicrophoneActive(false);
          }
          break;

        case 'response.audio.delta':
        case 'response.audio_transcript.delta':
          // Audio/transcript streaming - agent is speaking
          if (isMountedRef.current && !isAgentSpeaking) {
            setIsAgentSpeaking(true);
            setIsMicrophoneActive(false);
          }
          break;

        case 'response.done':
          console.log('🔊 Agent finished speaking');
          if (isMountedRef.current) {
            setIsAgentSpeaking(false);
          }

          // Save transcript to database if we have user ID
          if (user?.id && data.response?.id) {
            saveTranscriptToDatabase(data);
          }
          break;

        case 'conversation.item.input_audio_transcription.completed':
          // User's speech was transcribed
          console.log('📝 User transcript:', data.transcript);
          if (user?.id && data.transcript) {
            saveUserTranscript(data.transcript);
          }
          break;

        case 'error':
          console.error('OpenAI Realtime error:', data.error);
          if (isMountedRef.current) {
            setError(data.error?.message || 'An error occurred');
          }
          break;

        default:
          // Log other events for debugging
          if (data.type.startsWith('response.') || data.type.startsWith('input_')) {
            console.log('OpenAI event:', data.type);
          }
      }
    } catch (err) {
      console.error('Error parsing data channel message:', err);
    }
  }, [sessionType, timeBudgetMinutes, userContext, user?.id, isAgentSpeaking]);

  // Save user transcript to database
  const saveUserTranscript = async (transcript: string) => {
    try {
      await fetch('/api/voice-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId: user?.id,
          role: 'user',
          content: transcript,
        }),
      });
    } catch (err) {
      console.error('Failed to save user transcript:', err);
    }
  };

  // Save assistant transcript to database
  const saveTranscriptToDatabase = async (data: RealtimeEvent) => {
    // This would need to collect the full transcript from response events
    // For now, we log that we would save it
    console.log('Would save assistant response:', data.response?.id);
  };

  // Connect to OpenAI Realtime
  const connect = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      console.log('🔌 Connecting to OpenAI Realtime...');

      // 1. Get ephemeral key from our API
      const keyResponse = await fetch('/api/openai-realtime-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!keyResponse.ok) {
        const errorData = await keyResponse.json();
        throw new Error(errorData.error || 'Failed to get session token');
      }

      const { client_secret } = await keyResponse.json();
      console.log('🔑 Got ephemeral token');

      // 2. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      console.log('🎤 Microphone access granted');

      // 3. Create WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      // 4. Handle incoming audio from OpenAI
      pc.ontrack = (event) => {
        console.log('🔊 Received audio track from OpenAI');
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // 5. Add microphone track
      pc.addTrack(stream.getAudioTracks()[0], stream);

      // 6. Create data channel for events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log('📡 Data channel opened');
      };

      dc.onmessage = handleDataChannelMessage;

      dc.onerror = (err) => {
        console.error('Data channel error:', err);
      };

      // 7. Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 8. Exchange SDP with OpenAI
      const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client_secret.value}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime');
      }

      // 9. Set remote description
      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      });

      console.log('✅ WebRTC connection established');

      // 10. Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          if (isMountedRef.current) {
            setError('Connection lost');
            disconnect();
          }
        }
      };

    } catch (err) {
      console.error('Failed to connect:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
        setIsInitializing(false);
      }
      disconnect();
    }
  };

  // Disconnect and cleanup
  const disconnect = () => {
    console.log('🔌 Disconnecting...');

    dataChannelRef.current?.close();
    dataChannelRef.current = null;

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    audioStreamRef.current?.getTracks().forEach(t => t.stop());
    audioStreamRef.current = null;

    if (isMountedRef.current) {
      setIsConnected(false);
      setIsInitializing(false);
      setIsAgentSpeaking(false);
      setIsMicrophoneActive(false);
    }
  };

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

  // Show error state
  if (error && !isConnected) {
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
              setError(null);
              connect();
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

  // Initial state - show "Start Session" button
  if (!isConnected) {
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

          <p style={{
            color: colors.secondary,
            fontSize: '0.875rem',
            marginTop: '8px',
            opacity: 0.8
          }}>
            Powered by OpenAI Realtime
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={connect}
          disabled={isInitializing}
          style={{
            width: '100%',
            padding: '20px 24px',
            borderRadius: '9999px',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '-0.01em',
            border: 'none',
            cursor: isInitializing ? 'not-allowed' : 'pointer',
            background: isInitializing
              ? 'rgba(215, 205, 236, 0.5)'
              : 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
            color: colors.primary,
            boxShadow: '0 8px 24px rgba(183, 211, 216, 0.3)',
            opacity: isInitializing ? 0.5 : 1,
            marginBottom: '16px'
          }}
        >
          {isInitializing ? (
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
    <OpenAIVoiceAssistantUI
      isAgentSpeaking={isAgentSpeaking}
      isMicrophoneActive={isMicrophoneActive}
      onEndSession={disconnect}
    />
  );
}

// Active session UI component
function OpenAIVoiceAssistantUI({
  isAgentSpeaking,
  isMicrophoneActive,
  onEndSession
}: {
  isAgentSpeaking: boolean;
  isMicrophoneActive: boolean;
  onEndSession: () => void;
}) {
  const getStateInfo = () => {
    if (isAgentSpeaking) {
      return {
        text: 'Speaking...',
        icon: <Volume2 size={64} color={colors.primary} strokeWidth={1.5} />,
        color: 'rgba(227, 234, 221, 0.4)',
      };
    }

    if (isMicrophoneActive) {
      return {
        text: 'You\'re speaking...',
        icon: <Mic size={64} color={colors.primary} strokeWidth={1.5} />,
        color: 'rgba(215, 205, 236, 0.4)',
      };
    }

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

            {/* Pulsing ring animation when listening or user speaking */}
            {!isAgentSpeaking && (
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
            {isAgentSpeaking
              ? "You can interrupt me anytime."
              : "Take your time. I'm here to listen."}
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
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <PhoneOff size={20} />
          End Session
        </button>
      </div>
    </div>
  );
}
