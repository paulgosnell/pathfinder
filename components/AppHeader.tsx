'use client';

import { useState } from 'react';
import { Mic, MessageCircle, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/session/session-context';

interface AppHeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

export default function AppHeader({ onMenuClick, title, subtitle }: AppHeaderProps) {
  const pathname = usePathname();
  const { currentSessionId, currentSessionMode } = useSession();

  const isVoicePage = pathname === '/voice';
  const isChatPage = pathname === '/chat';
  const isOnSessionPage = isChatPage || isVoicePage;

  // When on chat/voice pages, only show the mode toggle (handled separately)
  // When on other pages (like /sessions, /profile), show only Chat button to get back
  // Chat is the primary mode - users can switch to voice from within chat if needed
  const shouldShowChatButton = !isOnSessionPage && currentSessionId;

  // Build URL with session ID if available
  const chatUrl = currentSessionId
    ? `/chat?sessionId=${currentSessionId}`
    : '/chat?new=true';
  const voiceUrl = currentSessionId
    ? `/voice?sessionId=${currentSessionId}`
    : '/voice?new=true';

  return (
    <div
      className="relative overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
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
        {/* Title */}
        <div style={{ flex: 1 }}>
          <h1
            className="font-display font-semibold m-0"
            style={{
              color: '#2A3F5A',
              fontSize: '20px',
              lineHeight: 1.05,
              letterSpacing: '0'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-sm"
              style={{
                color: '#586C8E',
                fontSize: '13px',
                margin: '2px 0 0 0'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Show Chat button on non-session pages to return to active session */}
          {shouldShowChatButton && (
            <a
              href={chatUrl}
              className="text-xs rounded-full border transition-all hover:scale-105"
              style={{
                color: '#586C8E',
                borderColor: 'rgba(215, 205, 236, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                padding: '10px 16px'
              }}
              title="Return to your chat session"
            >
              <MessageCircle size={16} />
              <span>Chat</span>
            </a>
          )}

          {/* Show mode toggle when on chat or voice page */}
          {(isChatPage || isVoicePage) && currentSessionId && (
            <a
              href={isVoicePage ? chatUrl : voiceUrl}
              className="text-xs rounded-full border transition-all hover:scale-105"
              style={{
                color: '#586C8E',
                borderColor: 'rgba(215, 205, 236, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                padding: '10px 16px'
              }}
              title={isVoicePage ? 'Switch to chat mode for this session' : 'Switch to voice mode for this session'}
            >
              {isVoicePage ? (
                <>
                  <MessageCircle size={16} />
                  <span>Chat</span>
                </>
              ) : (
                <>
                  <Mic size={16} />
                  <span>Voice</span>
                </>
              )}
            </a>
          )}

          {/* Burger Menu Button */}
          <button
            onClick={onMenuClick}
            className="text-xs rounded-full border transition-all hover:scale-105 flex items-center justify-center"
            style={{
              color: '#586C8E',
              borderColor: 'rgba(215, 205, 236, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
              cursor: 'pointer',
              padding: '10px 16px'
            }}
            title="Menu"
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
