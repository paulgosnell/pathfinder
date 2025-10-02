'use client';

import { useState } from 'react';
import { AuthCard, AuthField, AuthInput, AuthFooterLink } from '@/app/auth/components/AuthCard';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setError(null);
    setBusy(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Unable to send reset email right now.');
        return;
      }

      setSent(true);
    } catch (err) {
      setError('We had trouble sending the reset email. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="We'll send you a link to create a new password"
      submitLabel={sent ? 'Email Sent' : 'Send Reset Link'}
      onSubmit={handleReset}
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
          <span>Remembered it?</span>
          <AuthFooterLink href="/auth/login" label="Back to sign in" />
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
          disabled={sent}
        />
      </AuthField>

      {sent && (
        <div style={{
          borderRadius: '1rem',
          border: '1px solid rgba(183, 211, 216, 0.4)',
          backgroundColor: 'rgba(183, 211, 216, 0.1)',
          padding: '1rem 1.25rem',
          fontSize: '0.875rem',
          color: '#2A3F5A',
          fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
        }}>
          If an account exists for {email}, you'll receive an email with reset instructions.
        </div>
      )}
    </AuthCard>
  );
}

