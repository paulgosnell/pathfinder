'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth/auth-context';

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
  ul: ({ node, ...props }) => (
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

function ADHDSupportChat() {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm here to help you with ADHD parenting challenges. What's on your mind today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            userId: user?.id,
            sessionId: sessionId
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unexpected response from chat API');
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-10" style={{ backgroundColor: '#F9F7F3' }}>
      
      {/* Main UI Container - mobile sized */}
      <div className="w-full max-w-[400px] h-[700px] mx-auto bg-white rounded-3xl overflow-hidden border flex flex-col" 
           style={{ 
             boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
             borderColor: 'rgba(215, 205, 236, 0.2)'
           }}>
        
        {/* Header - matching design system with minimize on scroll */}
        <div 
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7))',
            padding: '16px 24px',
            textAlign: 'left',
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
                  color: '#2A3F5A',
                  fontSize: '20px',
                  lineHeight: 1.05,
                  letterSpacing: '0'
                }}
              >
                ADHD Support
              </h1>
              <p 
                className="text-sm" 
                style={{ 
                  color: '#586C8E',
                  fontSize: '13px',
                  margin: '2px 0 0 0'
                }}
              >
                Your AI therapeutic companion
              </p>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={signOut}
              className="text-xs px-3 py-1 rounded-full border transition-all hover:scale-105"
              style={{
                color: '#586C8E',
                borderColor: 'rgba(215, 205, 236, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Chat Area - flex grow to fill available space */}
        <div ref={chatAreaRef} className="flex-grow relative overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          {/* Noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='a' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath filter='url(%23a)' opacity='.05' d='M0 0h200v200H0z'/%3E%3C/svg%3E\")"
            }}
          ></div>
          
          {/* Messages - with proper padding and margin */}
          <div className="relative z-10 flex flex-col px-4 py-6" style={{ gap: '20px' }}>
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

            {/* Typing indicator */}
              {loading && (
              <div className="flex justify-start">
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
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full opacity-70 animate-[pulseDot_1.5s_ease-in-out_infinite]" style={{ backgroundColor: '#D7CDEC' }}></div>
                      <div className="w-2 h-2 rounded-full opacity-70 animate-[pulseDot_1.5s_ease-in-out_infinite]" style={{ backgroundColor: '#D7CDEC', animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 rounded-full opacity-70 animate-[pulseDot_1.5s_ease-in-out_infinite]" style={{ backgroundColor: '#D7CDEC', animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-sm" style={{ color: '#586C8E' }}>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area - lighter background color from design system */}
        <div className="border-t" style={{ 
          borderColor: 'rgba(215, 205, 236, 0.1)',
          backgroundColor: 'rgba(249, 247, 243, 0.5)'
        }}>
          {/* Input Row */}
          <div className="px-[15px] py-[15px]">
            <div className="flex items-center" style={{ gap: '10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-white rounded-full border focus:outline-none focus:ring-2 transition-all font-body"
                style={{
                  color: '#2A3F5A',
                  borderColor: 'rgba(215, 205, 236, 0.2)',
                  boxShadow: 'inset 0 2px 4px rgba(42, 63, 90, 0.03)',
                  fontSize: '16px',
                  padding: '12px 20px'
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
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <ADHDSupportChat />
    </ProtectedRoute>
  );
}