'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
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
  const { user } = useAuth(); // Use auth context instead of creating new client
  const [discoveryCompleted, setDiscoveryCompleted] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkDiscoveryStatus = async () => {
      console.log('[DiscoveryBanner] Starting discovery status check...');
      console.log('[DiscoveryBanner] Got user from context:', user ? 'YES' : 'NO', user?.id);

      if (!user) {
        console.log('[DiscoveryBanner] No user in context, exiting early');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('discovery_completed')
          .eq('user_id', user.id)
          .single();

        console.log('[DiscoveryBanner] Query result:', { profile, error });

        // If no profile exists yet, or discovery_completed is null/false, show the banner
        if (error || !profile || !profile.discovery_completed) {
          console.log('[DiscoveryBanner] Should show banner:', { error: !!error, profile, discovery_completed: profile?.discovery_completed });
          setDiscoveryCompleted(false);
        } else {
          console.log('[DiscoveryBanner] Should hide banner - discovery completed');
          setDiscoveryCompleted(true);
        }
      } catch (error) {
        console.error('Failed to check discovery status:', error);
        // On error, assume they need discovery (show banner)
        setDiscoveryCompleted(false);
      }
    };

    checkDiscoveryStatus();
  }, [user]); // Re-run when user becomes available

  // Don't show if discovery is completed or still loading
  if (discoveryCompleted === null || discoveryCompleted === true || dismissed) {
    console.log('[DiscoveryBanner] Hiding banner:', { discoveryCompleted, dismissed });
    return null;
  }

  console.log('[DiscoveryBanner] Rendering banner!');

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
