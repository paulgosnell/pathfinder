'use client';

import { useState } from 'react';
import AccessibilityPanel from '../components/AccessibilityPanel';

export default function ADHDSupportChat() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'assistant', content: "Hey there! I'm your ADHD support agent. Whether you're overwhelmed, curious, or just need to talk it out, I can help." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            userId: crypto.randomUUID(),
            sessionId: crypto.randomUUID()
          }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-cream bg-noise flex items-center justify-center p-4 relative overflow-hidden">
      {/* Accessibility Panel */}
      <AccessibilityPanel />
      
      {/* Abstract decorative elements */}
      <div className="absolute top-[-20%] right-[-10%] w-1/3 h-1/3 opacity-50 rotate-12">
        <img src="/textures/blob1.svg" alt="" aria-hidden="true" className="w-full h-full" />
      </div>
      <div className="absolute bottom-[-20%] left-[-10%] w-1/2 h-1/2 opacity-50 -rotate-12">
        <img src="/textures/blob2.svg" alt="" aria-hidden="true" className="w-full h-full" />
      </div>
      
      {/* Mobile-style container */}
      <div className="w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden shadow-soft border border-slate-100 relative z-10 bg-opacity-80 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage to-sage-light p-6 text-center relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-lavender animate-pulse-slow"></div>
          <h1 className="text-gray-800 text-xl font-semibold">ADHD Support</h1>
          <p className="text-gray-700 text-sm mt-1">Your AI coaching support</p>
        </div>

        {/* Chat messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-cream bg-opacity-30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-xs px-4 py-3 rounded-2xl shadow-soft ${
                  msg.role === 'user' 
                    ? 'bg-lavender text-gray-800 rounded-br-none animate-slide-left' 
                    : 'bg-white text-gray-800 rounded-bl-none animate-slide-right'
                }`}
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-black px-4 py-3 rounded-2xl rounded-bl-none shadow-soft">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-lavender rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-lavender rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-lavender rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs text-gray-700">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center space-x-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Share what's on your mind..."
              className="flex-1 bg-cream bg-opacity-50 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-lavender/50 focus:border-lavender transition-colors"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-sage text-white p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sage-dark transition-all duration-200 shadow-soft focus:ring-2 focus:ring-lavender focus:outline-none"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}