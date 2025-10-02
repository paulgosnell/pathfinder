'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard, AuthField, AuthInput } from '@/app/auth/components/AuthCard';

interface UserProfile {
  parent_name: string | null;
  relationship_to_child: string | null;
  parent_age_range: string | null;
  support_system_strength: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', { method: 'GET' });
      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Unable to load your profile right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message || 'Unable to save your profile right now.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('We had trouble saving your details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  return (
    <AuthCard
      title="Your Family Profile"
      subtitle="Tell us about your family so we can tailor support"
      submitLabel="Save changes"
      onSubmit={handleSave}
      busy={saving}
      error={error}
      footer={
        <p className="text-sm text-slate">
          Need to sign out?
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/auth/login');
            }}
            className="ml-2 text-lavender font-semibold hover:text-teal transition"
          >
            Log out
          </button>
        </p>
      }
    >
      {loading ? (
        <p className="text-center text-slate">Loading your profile...</p>
      ) : (
        <div className="space-y-6">
          {success && (
            <div className="rounded-2xl border border-teal/40 bg-teal/10 p-4 text-sm text-teal">
              Your details are safe with us—we’ll use them to personalize your support.
            </div>
          )}

          <AuthField
            label="Your name (optional)"
          >
            <AuthInput
              value={profile?.parent_name ?? ''}
              placeholder="e.g. Sarah"
              onChange={(e) => handleChange('parent_name', e.target.value)}
            />
          </AuthField>

          <AuthField label="Your relationship to the child">
            <AuthInput
              value={profile?.relationship_to_child ?? ''}
              placeholder="e.g. Mother, Father, Guardian"
              onChange={(e) => handleChange('relationship_to_child', e.target.value)}
            />
          </AuthField>

          <AuthField label="Your age range">
            <AuthInput
              value={profile?.parent_age_range ?? ''}
              placeholder="e.g. 30-39"
              onChange={(e) => handleChange('parent_age_range', e.target.value)}
            />
          </AuthField>

          <AuthField label="Support system strength">
            <AuthInput
              value={profile?.support_system_strength ?? ''}
              placeholder="e.g. Strong, Moderate, Limited"
              onChange={(e) => handleChange('support_system_strength', e.target.value)}
            />
          </AuthField>
        </div>
      )}
    </AuthCard>
  );
}

