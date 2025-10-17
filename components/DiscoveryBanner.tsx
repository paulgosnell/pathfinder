'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { BORDER_RADIUS } from '@/lib/styles/spacing';

interface DiscoveryBannerProps {
  /**
   * Context message explaining why discovery is helpful on this page
   * e.g. "Complete discovery to populate your profile automatically"
   */
  contextMessage: string;
}

/**
 * Reusable Discovery Banner Component
 *
 * Shows a banner prompting users to complete discovery session if they haven't yet.
 * Used on:
 * - Chat page (dismissible)
 * - Profile settings page (always shown if not completed)
 * - Family page (always shown if not completed)
 */
export function DiscoveryBanner({ contextMessage }: DiscoveryBannerProps) {
  const [discoveryCompleted, setDiscoveryCompleted] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkDiscoveryStatus = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('discovery_completed')
          .eq('user_id', user.id)
          .single();

        setDiscoveryCompleted(profile?.discovery_completed || false);
      } catch (error) {
        console.error('Failed to check discovery status:', error);
      }
    };

    checkDiscoveryStatus();
  }, []);

  // Don't show if discovery is completed or still loading
  if (discoveryCompleted === null || discoveryCompleted === true || dismissed) {
    return null;
  }

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: BORDER_RADIUS.large,
        background: 'rgba(240, 217, 218, 0.15)',
        border: '2px solid rgba(240, 217, 218, 0.4)',
        position: 'relative',
        marginBottom: '24px'
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(42, 63, 90, 0.1)',
          color: '#2A3F5A',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          lineHeight: '1'
        }}
      >
        ✕
      </button>

      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '15px',
          fontWeight: 600,
          color: '#2A3F5A',
          paddingRight: '24px',
          lineHeight: '1.4'
        }}
      >
        💡 First time here?
      </p>
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#5A6B7D',
          lineHeight: '1.5'
        }}
      >
        {contextMessage}
      </p>
      <a
        href="/chat?new=true&sessionType=discovery"
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(to right, #F0D9DA, #E3BFBF)',
          color: '#2A3F5A',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 2px 5px rgba(42, 63, 90, 0.1)'
        }}
      >
        Start Discovery Session
      </a>
    </div>
  );
}
