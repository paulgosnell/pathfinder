'use client';

import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { DiscoveryBanner } from '@/components/DiscoveryBanner';

export default function FamilyPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative"
           style={{ overflow: 'hidden' }}>

        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="Family Context"
          subtitle="Tell us about your child"
        />

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>

            {/* Discovery Banner */}
            <DiscoveryBanner
              contextMessage="Complete a Discovery session to share details about your child, their challenges, and what you've already tried."
            />

            {/* Coming Soon Card */}
            <Card title="Coming Soon" padding="large">
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '24px',
                  filter: 'grayscale(100%)',
                  opacity: 0.6
                }}>
                  🚧
                </div>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#2C3E50',
                  marginBottom: '16px',
                  lineHeight: 1.3
                }}>
                  Family Profile
                </h2>

                <p style={{
                  fontSize: '16px',
                  color: '#586C8E',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  maxWidth: '400px',
                  margin: '0 auto 24px'
                }}>
                  We're building a dedicated space where you can share details about your child—their age,
                  strengths, challenges, and what you've already tried.
                </p>

                <p style={{
                  fontSize: '14px',
                  color: '#7F8FA6',
                  lineHeight: 1.5,
                  fontStyle: 'italic'
                }}>
                  This will help personalize your coaching experience and ensure every conversation
                  builds on what we already know about your family.
                </p>
              </div>
            </Card>

            {/* What's Coming Card */}
            <Card title="What to Expect" padding="large">
              <div style={{ padding: '0 8px' }}>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    { icon: '👶', text: 'Child age and developmental stage' },
                    { icon: '⚡', text: 'Key challenges and triggers' },
                    { icon: '🌟', text: 'Strengths and interests' },
                    { icon: '🏠', text: 'Home environment and routines' },
                    { icon: '📝', text: 'Strategies you\'ve already tried' }
                  ].map((item, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: idx === 4 ? '0' : '20px',
                      gap: '16px'
                    }}>
                      <span style={{
                        fontSize: '24px',
                        flexShrink: 0,
                        filter: 'grayscale(100%)',
                        opacity: 0.6
                      }}>
                        {item.icon}
                      </span>
                      <span style={{
                        fontSize: '15px',
                        color: '#586C8E',
                        lineHeight: 1.6,
                        paddingTop: '2px'
                      }}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Privacy Note */}
            <p style={{
              fontSize: '12px',
              color: '#7F8FA6',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
              padding: '0 20px'
            }}>
              All information you share will be stored securely and used only to provide
              personalized coaching support.
            </p>

          </ContentContainer>
        </div>

      </div>
    </MobileDeviceMockup>
  );
}
