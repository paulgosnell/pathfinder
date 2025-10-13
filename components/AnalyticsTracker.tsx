'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  collectAnalyticsEvent,
  sendAnalyticsEvent,
  EngagementTracker,
} from '@/lib/analytics/tracker';

/**
 * Analytics Tracker Component
 * Automatically tracks page visits and engagement metrics
 * Add this to your root layout to enable analytics
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const engagementTrackerRef = useRef<EngagementTracker | null>(null);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    // Skip tracking on admin routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Skip if already tracking this page
    if (isTrackingRef.current) {
      return;
    }

    isTrackingRef.current = true;

    // Wait for page to fully load
    const trackPageView = async () => {
      try {
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Collect analytics event
        const event = collectAnalyticsEvent();

        // Send initial page view (without engagement data)
        await sendAnalyticsEvent(event);

        // Setup engagement tracking
        if (engagementTrackerRef.current) {
          engagementTrackerRef.current.cleanup();
        }

        engagementTrackerRef.current = new EngagementTracker();

        // Send engagement data when user leaves the page
        const handleBeforeUnload = async () => {
          if (engagementTrackerRef.current) {
            const engagement = engagementTrackerRef.current.getEngagementData();

            // Send with keepalive to ensure it arrives even when navigating away
            await sendAnalyticsEvent(event, engagement);
          }
        };

        // Send engagement data on visibility change (user switches tabs)
        const handleVisibilityChange = async () => {
          if (document.visibilityState === 'hidden' && engagementTrackerRef.current) {
            const engagement = engagementTrackerRef.current.getEngagementData();
            await sendAnalyticsEvent(event, engagement);
          }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          document.removeEventListener('visibilitychange', handleVisibilityChange);

          if (engagementTrackerRef.current) {
            engagementTrackerRef.current.cleanup();
            engagementTrackerRef.current = null;
          }
        };
      } catch (error) {
        console.debug('Analytics tracking error:', error);
      }
    };

    trackPageView();

    // Reset tracking flag when pathname changes
    return () => {
      isTrackingRef.current = false;
    };
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}
