'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard, AuthField, AuthInput, AuthFooterLink, AuthCheckbox } from '@/app/auth/components/AuthCard';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setBusy(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, consentGiven: consent })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Something went wrong.');
        return;
      }

      router.push('/auth/login?registered=1');
    } catch (err) {
      setError('We had trouble creating your account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Start your personalized ADHD support journey"
      submitLabel="Create Account"
      onSubmit={handleRegister}
      busy={busy}
      error={error}
      footer={
        <p style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          margin: 0
        }}>
          <span>Already have an account?</span>
          <AuthFooterLink href="/auth/login" label="Sign in" />
        </p>
      }
    >
      <AuthField label="Email">
        <AuthInput
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </AuthField>

      <AuthField label="Password" description="At least 8 characters">
        <AuthInput
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </AuthField>

      <AuthCheckbox
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
      >
        I agree to the data retention policy and consent to receive personalized ADHD support.
      </AuthCheckbox>
    </AuthCard>
  );
}

