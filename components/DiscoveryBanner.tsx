'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { BORDER_RADIUS } from '@/lib/styles/spacing';
import { calculateProfileCompleteness, getProgressMessage, type ProfileCompleteness } from '@/lib/profile/completeness';

interface DiscoveryBannerProps {
  /**
   * Context message explaining why discovery is helpful on this page
   * e.g. "Complete discovery to populate your profile automatically"
   */
  contextMessage?: string;

  /**
   * Current session type - hides banner if already in discovery session
   */
  currentSessionType?: string;
}

/**
 * Reusable Discovery Banner Component
 *
 * Shows a banner prompting users to complete discovery session if they haven't yet.
 * Now tracks partial completion and shows progress percentage.
 *
 * Used on:
 * - Chat page (dismissible, hidden during discovery sessions)
 * - Profile settings page (always shown if not completed)
 * - Family page (always shown if not completed)
 */
export function DiscoveryBanner({ contextMessage, currentSessionType }: DiscoveryBannerProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check URL params for session type (more reliable than prop during initial render)
  const urlSessionType = searchParams.get('sessionType');

  useEffect(() => {
    const checkDiscoveryStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profileCompleteness = await calculateProfileCompleteness(user.id);
        setCompleteness(profileCompleteness);
      } catch (error) {
        console.error('Failed to check discovery status:', error);
        // On error, assume they need discovery (show banner)
        setCompleteness({
          hasChildren: false,
          hasParentInfo: false,
          hasChildDetails: false,
          hasSchoolInfo: false,
          hasTreatmentInfo: false,
          completionPercentage: 0,
          missingFields: ['All information'],
          completedFields: []
        });
      } finally {
        setLoading(false);
      }
    };

    checkDiscoveryStatus();
  }, [user]);

  // Don't show if:
  // - Still loading
  // - No completeness data
  // - Discovery is completed (100%)
  // - User dismissed it
  // - Currently in a discovery session (check both URL param and prop)
  const isInDiscoverySession = urlSessionType === 'discovery' || currentSessionType === 'discovery';

  if (
    loading ||
    !completeness ||
    completeness.completionPercentage === 100 ||
    dismissed ||
    isInDiscoverySession
  ) {
    return null;
  }

  const isStarted = completeness.completionPercentage > 0;
  const progressMessage = contextMessage || getProgressMessage(completeness);

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: BORDER_RADIUS.large,
        background: isStarted ? 'rgba(227, 234, 221, 0.15)' : 'rgba(240, 217, 218, 0.15)',
        border: isStarted
          ? '2px solid rgba(227, 234, 221, 0.4)'
          : '2px solid rgba(240, 217, 218, 0.4)',
        position: 'relative',
        marginBottom: '12px'
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

      {/* Header with progress */}
      <p
        style={{
          margin: '0 0 8px 0',
          fontSize: '15px',
          fontWeight: 600,
          color: '#2A3F5A',
          paddingRight: '24px',
          lineHeight: '1.4'
        }}
      >
        {isStarted ? `🔍 Discovery ${completeness.completionPercentage}% Complete` : '💡 First time here?'}
      </p>

      {/* Progress bar (only show if started) */}
      {isStarted && (
        <div
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(42, 63, 90, 0.1)',
            marginBottom: '12px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${completeness.completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      )}

      {/* Message */}
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#5A6B7D',
          lineHeight: '1.5'
        }}
      >
        {progressMessage}
      </p>

      {/* Missing fields (only show if started) */}
      {isStarted && completeness.missingFields.length > 0 && (
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#7F8FA6',
            lineHeight: '1.4',
            fontStyle: 'italic'
          }}
        >
          Still needed: {completeness.missingFields.slice(0, 3).join(', ')}
          {completeness.missingFields.length > 3 && ', and more'}
        </p>
      )}

      {/* Action button */}
      <a
        href={isStarted
          ? "/chat?sessionType=discovery"  // RESUME existing discovery - no new=true
          : "/chat?new=true&sessionType=discovery"  // START fresh discovery
        }
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          borderRadius: '12px',
          background: isStarted
            ? 'linear-gradient(to right, #E3EADD, #C8DDB5)'
            : 'linear-gradient(to right, #F0D9DA, #E3BFBF)',
          color: '#2A3F5A',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 2px 5px rgba(42, 63, 90, 0.1)'
        }}
      >
        {isStarted ? 'Continue Discovery' : 'Start Discovery Session'}
      </a>
    </div>
  );
}
