'use client';

import { useState } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';

export default function ProgressPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative" style={{ overflow: 'hidden' }}>
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="Progress & Insights"
          subtitle="Understand patterns and trends"
        />

        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>

            <Card padding="large">
              <div className="text-center py-12">
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.3), rgba(183, 211, 216, 0.3))'
                  }}
                >
                  <TrendingUp size={40} style={{ color: '#B7D3D8' }} />
                </div>

                <h2 style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#2A3F5A',
                  marginBottom: '16px'
                }}>
                  Coming Soon
                </h2>

                <p style={{
                  color: '#586C8E',
                  marginBottom: '24px',
                  lineHeight: 1.6,
                  fontSize: '15px'
                }}>
                  Visualize your child's progress with charts showing sleep, attention, emotions, and behaviour trends.
                  Get AI-generated insights that help you understand what's working.
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(227, 234, 221, 0.3)',
                  color: '#586C8E',
                  fontSize: '13px',
                  fontWeight: 500
                }}>
                  <Sparkles size={16} />
                  <span>In Development</span>
                </div>
              </div>
            </Card>

            {/* Feature Preview */}
            <Card title="What to Expect" padding="large">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FeatureItem
                  title="4-line trend charts"
                  description="See sleep, attention, emotions, and behaviour patterns over 30 days"
                />
                <FeatureItem
                  title="Weekday vs Weekend comparison"
                  description="Compare patterns to identify environmental factors"
                />
                <FeatureItem
                  title="AI-generated insights"
                  description="Get personalized observations like 'Emma's attention improves 30% on weekends'"
                />
                <FeatureItem
                  title="Stats summary"
                  description="View average scores, best days, and areas of concern"
                />
              </div>
            </Card>

          </ContentContainer>
        </div>
      </div>
    </MobileDeviceMockup>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 style={{
        fontFamily: 'Quicksand, sans-serif',
        fontSize: '15px',
        fontWeight: 600,
        color: '#2A3F5A',
        marginBottom: '4px'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#586C8E',
        margin: 0,
        lineHeight: 1.5
      }}>
        {description}
      </p>
    </div>
  );
}
