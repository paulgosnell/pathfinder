'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { FormField } from '@/components/layouts/FormField';
import { Button } from '@/components/layouts/Button';
import { Alert } from '@/components/layouts/Alert';
import { DiscoveryBanner } from '@/components/DiscoveryBanner';
import { SPACING } from '@/lib/styles/spacing';

interface UserProfile {
  parent_name: string | null;
  relationship_to_child: string | null;
  parent_age_range: string | null;
  support_system_strength: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    parent_name: '',
    relationship_to_child: '',
    parent_age_range: '',
    support_system_strength: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile({
        parent_name: data.parent_name || '',
        relationship_to_child: data.relationship_to_child || '',
        parent_age_range: data.parent_age_range || '',
        support_system_strength: data.support_system_strength || '',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Unable to load your profile right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message || 'Unable to save your profile right now.');
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('We had trouble saving your details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

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
          title="Your Profile"
          subtitle="Tell us about your family"
        />

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-4xl mb-4">⏳</div>
                <p style={{ color: '#586C8E' }}>Loading your profile...</p>
              </div>
            ) : (
              <>
                {/* Discovery Banner */}
                <DiscoveryBanner
                  contextMessage="Start with a Discovery session to automatically populate your profile with information about you and your family."
                />

                {/* Success Message */}
                {success && (
                  <Alert type="success">
                    ✓ Your details are safe with us—we'll use them to personalize your support.
                  </Alert>
                )}

                {/* Error Message */}
                {error && (
                  <Alert type="error">
                    {error}
                  </Alert>
                )}

                {/* Form Card */}
                <Card title="Family Information" padding="large">
                  <FormField
                    label="Your name (optional)"
                    type="text"
                    value={profile.parent_name || ''}
                    placeholder="e.g. Sarah"
                    onChange={(e) => handleChange('parent_name', e.target.value)}
                  />

                  <FormField
                    label="Relationship to child"
                    type="text"
                    value={profile.relationship_to_child || ''}
                    placeholder="e.g. Mother, Father, Guardian"
                    onChange={(e) => handleChange('relationship_to_child', e.target.value)}
                  />

                  <FormField
                    label="Your age range"
                    type="text"
                    value={profile.parent_age_range || ''}
                    placeholder="e.g. 30-39"
                    onChange={(e) => handleChange('parent_age_range', e.target.value)}
                  />

                  <FormField
                    label="Support system strength"
                    type="text"
                    value={profile.support_system_strength || ''}
                    placeholder="e.g. Strong, Moderate, Limited"
                    onChange={(e) => handleChange('support_system_strength', e.target.value)}
                  />
                </Card>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                {/* Privacy Note */}
                <p style={{
                  fontSize: '12px',
                  color: '#586C8E',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Your information is stored securely and used only to personalize your coaching experience.
                </p>
              </>
            )}

          </ContentContainer>
        </div>

      </div>
    </MobileDeviceMockup>
  );
}
