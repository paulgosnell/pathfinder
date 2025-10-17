'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/lib/auth/auth-context';
import { useSession } from '@/lib/session/session-context';
import { useSearchParams } from 'next/navigation';
import { type SessionType } from '@/lib/config/session-types';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { DiscoveryBanner } from '@/components/DiscoveryBanner';
import { SPACING } from '@/lib/styles/spacing';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  strategies?: any[];
  audioUrl?: string;
}

const markdownComponents: Components = {
  p: ({ node, ...props }) => (
    <p
      className="m-0 text-base leading-relaxed"
      style={{ color: '#2A3F5A' }}
      {...props}
    />
  ),
  strong: ({ node, ...props }) => (
    <strong style={{ color: '#2A3F5A' }} {...props} />
  ),
  em: ({ node, ...props }) => (
    <em style={{ color: '#2A3F5A' }} {...props} />
  ),
  ul: ({ node, ...props}) => (
    <ul className="pl-5 mb-0 space-y-2" style={{ color: '#2A3F5A' }} {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="pl-5 mb-0 space-y-2" style={{ color: '#2A3F5A' }} {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-base leading-relaxed" style={{ color: '#2A3F5A' }} {...props} />
  ),
  a: ({ node, ...props }) => (
    <a style={{ color: '#2A3F5A', textDecoration: 'underline' }} {...props} />
  ),
  br: () => <br />
};

export default function ChatPage() {
  const { user } = useAuth();
  const { setCurrentSession } = useSession();
  const searchParams = useSearchParams();
  const isNewSession = searchParams.get('new') === 'true';
  const specificSessionId = searchParams.get('sessionId');
  const urlSessionType = searchParams.get('sessionType') as SessionType | null;
  const coachingMode = searchParams.get('mode') === 'coaching'; // Backwards compat
  const urlTimeBudget = searchParams.get('time') ? parseInt(searchParams.get('time')!) : undefined;

  // Determine session configuration from URL params
  const initialSessionType: SessionType = urlSessionType || (coachingMode ? 'coaching' : 'check-in');
  const initialInteractionMode = coachingMode ? 'coaching' : 'check-in';
  const initialTimeBudget = urlTimeBudget || (coachingMode ? 30 : 15);

  // Helper function to get first message based on session type
  const getFirstMessage = (type: SessionType): string => {
    switch (type) {
      case 'discovery':
        return "Let's take a few minutes to understand your situation. This will help me give you better support going forward. What brings you here today?";
      case 'coaching':
        return "I'm glad you've set aside time for this. What would make this coaching session useful for you today?";
      default:
        return "How are you doing today?";
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionId, setSessionId] = useState<string>();
  const [sessionType, setSessionType] = useState<SessionType>(initialSessionType);
  const [interactionMode, setInteractionMode] = useState<'check-in' | 'coaching'>(initialInteractionMode);
  const [timeBudgetMinutes, setTimeBudgetMinutes] = useState<number>(initialTimeBudget);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      if (!user) return;

      try {
        // If user clicked "New Chat", start fresh with initial message
        if (isNewSession) {
          setMessages([
            {
              role: 'assistant',
              content: getFirstMessage(sessionType)
            }
          ]);
          setLoadingSession(false);
          return;
        }

        // Load specific session if sessionId provided
        if (specificSessionId) {
          const response = await fetch(`/api/conversation?sessionId=${specificSessionId}`, {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.session && data.messages && data.messages.length > 0) {
              setSessionId(data.session.id);
              setCurrentSession(data.session.id, 'chat');
              setMessages(data.messages);
              setSessionType(data.session.session_type);
              setLoadingSession(false);
              return;
            }
          }
        }

        // Try to load most recent active session
        const response = await fetch('/api/conversation', {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session && data.messages && data.messages.length > 0) {
            // Resume existing session
            setSessionId(data.session.id);
            setCurrentSession(data.session.id, 'chat');
            setMessages(data.messages);
            setSessionType(data.session.session_type);
            setLoadingSession(false);
            return;
          }
        }

        // No existing session - start fresh with message based on session type
        setMessages([
          {
            role: 'assistant',
            content: getFirstMessage(sessionType)
          }
        ]);
      } catch (error) {
        console.error('Failed to load session:', error);
        // On error, still start with message based on session type
        setMessages([
          {
            role: 'assistant',
            content: getFirstMessage(sessionType)
          }
        ]);
      } finally {
        setLoadingSession(false);
      }
    };

    if (user) {
      loadSession();
    }
  }, [user, isNewSession, specificSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            userId: user?.id,
            sessionId: sessionId,
            sessionType: sessionType,
            interactionMode: interactionMode, // Use state variable (from URL params)
            timeBudgetMinutes: timeBudgetMinutes // Use state variable (from URL params)
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unexpected response from chat API');
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        setCurrentSession(data.sessionId, 'chat');
      }

      const strategyResult = data.toolResults?.find(
        (r: any) => r.toolName === 'retrieveStrategy'
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        strategies: strategyResult?.result?.availableStrategies,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.usage?.cost) {
        console.log(`💰 Cost: $${data.usage.cost.toFixed(6)} | Tokens: ${data.usage.totalTokens}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show loading while checking for existing session
  if (loadingSession) {
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
            title="ADHD Support"
            subtitle="Your AI parenting coach"
          />

          <div className="flex-grow overflow-y-auto flex items-center justify-center"
               style={{
                 backgroundColor: '#F9F7F3',
                 marginTop: SPACING.contentTopMargin
               }}>
            <div className="text-center">
              <div className="animate-pulse" style={{ color: '#D7CDEC', fontSize: '48px', marginBottom: '16px' }}>
                💬
              </div>
              <p style={{ color: '#586C8E' }}>Loading your conversation...</p>
            </div>
          </div>
        </div>
      </MobileDeviceMockup>
    );
  }

  // Show chat interface
  return (
    <MobileDeviceMockup>
      {/* Main UI Container - mobile sized */}
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
          title="ADHD Support"
          subtitle="Your AI parenting coach"
        />

        {/* Chat Area - scrollable between header and input */}
        <div
          ref={chatAreaRef}
          className="flex-grow relative overflow-y-auto"
          style={{
            backgroundColor: '#F9F7F3',
            marginTop: SPACING.contentTopMargin,
            paddingBottom: '88px' // Height of fixed input area
          }}
        >
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='a' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath filter='url(%23a)' opacity='.05' d='M0 0h200v200H0z'/%3E%3C/svg%3E\")"
            }}
          ></div>

          {/* Discovery Banner */}
          <div className="relative z-10 px-4 pt-4">
            <DiscoveryBanner
              contextMessage="Start with a Discovery session so I can understand you and your child. I'll remember everything and give you better support."
            />
          </div>

          {/* Messages - with proper padding and margin */}
          <div className="relative z-10 flex flex-col px-4" style={{ gap: '20px', paddingTop: '24px', paddingBottom: '24px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                <div className="max-w-[80%]">
                  {/* Message bubble - with more padding */}
                  <div
                    style={{
                      backgroundColor: msg.role === 'user' ? '#B7D3D8' : '#E3EADD',
                      color: '#2A3F5A',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 2px 5px rgba(42, 63, 90, 0.05)',
                      padding: '15px 20px',
                      margin: '4px 0'
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="m-0 text-base leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {/* Strategy cards */}
                  {msg.strategies && msg.strategies.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {msg.strategies.map((strategy: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="bg-white rounded-2xl overflow-hidden border"
                          style={{
                            boxShadow: '0 2px 10px rgba(42, 63, 90, 0.08)',
                            borderColor: 'rgba(215, 205, 236, 0.2)'
                          }}
                        >
                          <div className="p-5 border-b" style={{ borderColor: 'rgba(215, 205, 236, 0.1)' }}>
                            <h3 className="font-display text-base font-semibold m-0" style={{ color: '#2A3F5A' }}>
                              {strategy.title}
                            </h3>
                            <p className="text-sm mt-2 mb-0" style={{ color: '#586C8E' }}>
                              For ages {strategy.ageRange.join(', ')}
                            </p>
                          </div>

                          <div className="p-5">
                            <p className="text-sm mb-3" style={{ color: '#2A3F5A' }}>
                              {strategy.description}
                            </p>
                            <h4 className="font-display text-base font-semibold mt-[15px] mb-[10px]" style={{ color: '#2A3F5A' }}>
                              Implementation Steps:
                            </h4>
                            <ul className="pl-5 mb-[15px] space-y-1">
                              {strategy.implementation.slice(0, 4).map((step: string, stepIdx: number) => (
                                <li key={stepIdx} className="text-sm" style={{ color: '#2A3F5A' }}>{step}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="px-5 py-[15px]" style={{ backgroundColor: '#E3EADD' }}>
                            <p className="text-sm m-0" style={{ color: '#2A3F5A' }}>
                              Timeframe: {strategy.timeframe}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator - wavy dots only */}
              {loading && (
              <div className="flex justify-start" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                <div
                  style={{
                    backgroundColor: '#E3EADD',
                    color: '#2A3F5A',
                    borderRadius: '18px 18px 18px 4px',
                    boxShadow: '0 2px 5px rgba(42, 63, 90, 0.05)',
                    padding: '15px 20px',
                    margin: '4px 0'
                  }}
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full opacity-70 animate-[wave_1.4s_ease-in-out_infinite]" style={{ backgroundColor: '#D7CDEC' }}></div>
                    <div className="w-2 h-2 rounded-full opacity-70 animate-[wave_1.4s_ease-in-out_infinite]" style={{ backgroundColor: '#D7CDEC', animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full opacity-70 animate-[wave_1.4s_ease-in-out_infinite]" style={{ backgroundColor: '#D7CDEC', animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderColor: 'rgba(215, 205, 236, 0.1)',
          backgroundColor: 'rgba(249, 247, 243, 0.95)',
          backdropFilter: 'blur(8px)'
        }}>
          {/* Input Row */}
          <div className="px-[15px] py-[15px]">
            <div className="flex items-end" style={{ gap: '10px' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-white border focus:outline-none focus:ring-2 transition-all font-body resize-none"
                style={{
                  color: '#2A3F5A',
                  borderColor: 'rgba(215, 205, 236, 0.2)',
                  boxShadow: 'inset 0 2px 4px rgba(42, 63, 90, 0.03)',
                  fontSize: '16px',
                  padding: '12px 20px',
                  minHeight: '48px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  borderRadius: '24px',
                  lineHeight: '1.5'
                }}
              />

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex-shrink-0 flex items-center justify-center rounded-full disabled:opacity-80 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  width: '48px',
                  height: '48px',
                  background: loading || !input.trim()
                    ? 'rgba(215, 205, 236, 0.55)'
                    : 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                  color: '#2A3F5A',
                  boxShadow: '0 2px 5px rgba(42, 63, 90, 0.1)'
                }}
              >
                <span aria-hidden="true" className="text-xl" style={{ marginLeft: '2px', transform: 'translateY(-1px)' }}>
                  ➤
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
