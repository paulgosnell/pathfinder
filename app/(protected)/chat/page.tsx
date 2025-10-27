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
import ContinuationPrompt from '@/components/ContinuationPrompt';
import { FeedbackModal } from '@/components/FeedbackModal';
import { SPACING } from '@/lib/styles/spacing';
import { calculateProfileCompleteness } from '@/lib/profile/completeness';
import { MessageSquare } from 'lucide-react';

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
  // Default to 'check-in' for casual conversations
  const initialSessionType: SessionType = urlSessionType || (coachingMode ? 'coaching' : 'check-in');
  const initialInteractionMode = coachingMode ? 'coaching' : 'check-in';
  const initialTimeBudget = urlTimeBudget || (coachingMode ? 30 : 15);

  // Helper function to get first message based on session type
  const getFirstMessage = async (type: SessionType): Promise<string> => {
    // For discovery sessions, check if this is partial (resume) or full (new)
    if (type === 'discovery' && user) {
      try {
        const completeness = await calculateProfileCompleteness(user.id);

        // If partial discovery (user has some data), create personalized greeting
        if (completeness.completionPercentage > 0 && completeness.completionPercentage < 100) {
          // Build acknowledgment of what we know
          const knownInfo: string[] = [];
          if (completeness.hasChildren) {
            knownInfo.push("your child's name");
          }
          if (completeness.hasParentInfo) {
            knownInfo.push("your family setup");
          }
          if (completeness.hasChildDetails) {
            knownInfo.push("some challenges and strengths");
          }

          const acknowledgment = knownInfo.length > 0
            ? `I see you already told me about ${knownInfo.join(', ')}. `
            : '';

          // List what we still need (max 3 items for brevity)
          const missing = completeness.missingFields.slice(0, 3).join(', ');
          const moreMissing = completeness.missingFields.length > 3 ? ', and a couple more things' : '';

          return `${acknowledgment}Let me get the remaining information to complete your profile. We still need: ${missing}${moreMissing}. Let's start with the first one - ready?`;
        }
      } catch (error) {
        console.error('Failed to check profile completeness:', error);
        // Fall through to default discovery message
      }
    }

    // Default messages for each type
    switch (type) {
      case 'discovery':
        return "Welcome! Let me get some basic information so I can personalize your experience. How many children do you have?";
      case 'coaching':
        return "I'm glad you've set aside time for this. What would make this coaching session useful for you today?";
      case 'check-in':
        return "Hey there! How are you doing today?";
      default:
        return "How are you doing today?";
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionId, setSessionId] = useState<string>();
  const [sessionType, setSessionType] = useState<SessionType>(initialSessionType);
  const [interactionMode, setInteractionMode] = useState<'check-in' | 'coaching'>(initialInteractionMode);
  const [timeBudgetMinutes, setTimeBudgetMinutes] = useState<number>(initialTimeBudget);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'complete' | 'scheduled'>('active');
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContinuationPrompt, setShowContinuationPrompt] = useState(false);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const continuationPromptRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      if (!user) return;

      try {
        // If user clicked "New Chat", start fresh with initial message
        if (isNewSession) {
          const firstMessage = await getFirstMessage(sessionType);
          setMessages([
            {
              role: 'assistant',
              content: firstMessage
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
              setSessionStatus(data.session.status || 'active');

              // Check if session is completed (coaching or discovery)
              const isCompleted = data.session.status === 'complete' &&
                (data.session.session_type === 'coaching' || data.session.session_type === 'discovery');
              setIsSessionCompleted(isCompleted);

              setLoadingSession(false);
              return;
            }
          }
        }

        // Try to load most recent active session (excluding completed coaching/discovery)
        const response = await fetch('/api/conversation', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ excludeCompletedCoaching: true })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session && data.messages && data.messages.length > 0) {
            // Check if session is completed
            const isCompleted = data.session.status === 'complete' &&
              (data.session.sessionType === 'coaching' || data.session.sessionType === 'discovery');
            setIsSessionCompleted(isCompleted);
            setSessionStatus(data.session.status || 'active');

            // Check if this is a returning user (has messages from earlier)
            const lastMsgTime = data.session.lastMessageAt;
            if (lastMsgTime) {
              const timeSinceLastMessage = Date.now() - new Date(lastMsgTime).getTime();
              const fiveMinutesMs = 5 * 60 * 1000;

              // Show continuation prompt if user left for more than 5 minutes
              if (timeSinceLastMessage > fiveMinutesMs) {
                // Show messages immediately, add prompt at the end
                setSessionId(data.session.id);
                setSessionType(data.session.sessionType || 'check-in');
                setMessages(data.messages); // Show conversation history
                setLastMessageAt(lastMsgTime);
                setShowContinuationPrompt(true); // Show prompt as last message
                setLoadingSession(false);
                return;
              }
            }

            // Resume existing session without prompt (recent activity)
            setSessionId(data.session.id);
            setCurrentSession(data.session.id, 'chat');
            setMessages(data.messages);
            setSessionType(data.session.sessionType || 'check-in');
            setLoadingSession(false);
            return;
          }
        }

        // No existing session - start fresh with message based on session type
        const firstMessage = await getFirstMessage(sessionType);
        setMessages([
          {
            role: 'assistant',
            content: firstMessage
          }
        ]);
      } catch (error) {
        console.error('Failed to load session:', error);
        // On error, still start with message based on session type
        const firstMessage = await getFirstMessage(sessionType);
        setMessages([
          {
            role: 'assistant',
            content: firstMessage
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
    // If continuation prompt is showing, scroll to it instead of the absolute bottom
    if (showContinuationPrompt && continuationPromptRef.current && chatAreaRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        if (!continuationPromptRef.current || !chatAreaRef.current) return;

        // Get the prompt's position relative to the chat area
        const promptRect = continuationPromptRef.current.getBoundingClientRect();
        const chatAreaRect = chatAreaRef.current.getBoundingClientRect();

        // Calculate scroll position to show the prompt with some padding above it
        const scrollTarget = continuationPromptRef.current.offsetTop - 100; // 100px padding from top

        // Smooth scroll to the calculated position
        chatAreaRef.current.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showContinuationPrompt]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Continuation prompt handlers
  const handleContinue = () => {
    // Messages already showing, just activate session and hide prompt
    setCurrentSession(sessionId!, 'chat');
    setShowContinuationPrompt(false);
  };

  const handleStartNew = async () => {
    // Start fresh check-in (default session type)
    const firstMessage = await getFirstMessage('check-in');
    setMessages([
      {
        role: 'assistant',
        content: firstMessage
      }
    ]);
    setSessionId(undefined);
    setSessionType('check-in');
    setInteractionMode('check-in');
    setTimeBudgetMinutes(15);
    setShowContinuationPrompt(false);
  };

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
            timeBudgetMinutes: timeBudgetMinutes, // Use state variable (from URL params)
            forceNew: isNewSession // NEW: Tell backend to start fresh session (auto-close old ones)
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
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        />

        {/* Header - Fixed at top */}
        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="ADHD Support"
          subtitle="Your AI parenting coach"
        />

        {/* Discovery Banner - Fixed at top below header */}
        <div
          style={{
            position: 'fixed',
            top: SPACING.contentTopMargin,
            left: 0,
            right: 0,
            backgroundColor: '#F9F7F3',
            zIndex: 40,
            padding: '12px 16px 0 16px',
            boxShadow: '0 2px 8px rgba(42, 63, 90, 0.05)'
          }}
        >
          <DiscoveryBanner
            contextMessage="Start with a Discovery session so I can understand you and your child. I'll remember everything and give you better support."
            currentSessionType={sessionType}
          />
        </div>

        {/* Chat Area - scrollable between header/banner and input */}
        <div
          ref={chatAreaRef}
          className="flex-grow relative overflow-y-auto"
          style={{
            backgroundColor: '#F9F7F3',
            marginTop: SPACING.contentTopMargin,
            paddingTop: '120px', // Space for fixed discovery banner (adjust based on banner height)
            paddingBottom: '88px', // Height of fixed input area
            WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
            touchAction: 'pan-y', // Allow vertical scrolling, prevent other gestures
            overscrollBehavior: 'contain' // Prevent scroll chaining to parent
          }}
        >
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='a' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath filter='url(%23a)' opacity='.05' d='M0 0h200v200H0z'/%3E%3C/svg%3E\")"
            }}
          ></div>

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

            {/* Continuation Prompt - as a natural message at the end */}
            {showContinuationPrompt && lastMessageAt && (
              <div ref={continuationPromptRef}>
                <ContinuationPrompt
                  lastMessageAt={lastMessageAt}
                  onContinue={handleContinue}
                  onStartNew={handleStartNew}
                />
              </div>
            )}

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

        {/* Input Area - Fixed at bottom (or completion banner for completed sessions) */}
        {!isSessionCompleted ? (
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
        ) : (
          // Completed Session Banner
          <div className="border-t" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderColor: 'rgba(215, 205, 236, 0.3)',
            backgroundColor: '#E3EADD',
            boxShadow: '0 -2px 10px rgba(42, 63, 90, 0.1)'
          }}>
            <div className="px-[20px] py-[20px] text-center">
              <p style={{
                fontSize: '15px',
                color: '#2A3F5A',
                margin: '0 0 16px 0',
                fontWeight: 600
              }}>
                This {sessionType} session is complete.
              </p>
              <button
                onClick={() => window.location.href = '/chat?new=true&sessionType=check-in'}
                style={{
                  background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                  color: '#2A3F5A',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(42, 63, 90, 0.15)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Start New Check-in
              </button>
            </div>
          </div>
        )}

        {/* Floating Feedback Button */}
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          aria-label="Give feedback"
          style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(42, 63, 90, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            transition: 'all 0.2s',
            color: '#2A3F5A'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(42, 63, 90, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 63, 90, 0.2)';
          }}
        >
          <MessageSquare size={24} />
        </button>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          sessionId={sessionId}
        />
      </div>
    </MobileDeviceMockup>
  );
}
