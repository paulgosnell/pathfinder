'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenData, setTokenData] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No recovery token provided');
      setValidating(false);
      return;
    }

    // Decode JWT token (without verification on client side)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');

      const payload = JSON.parse(atob(parts[1]));

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        setError('This recovery link has expired. Please request a new one.');
        setValidating(false);
        return;
      }

      setTokenData(payload);
      setValidating(false);
    } catch (err) {
      setError('Invalid recovery link');
      setValidating(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = searchParams.get('token');
      const response = await fetch('/api/auth/reset-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password');
        return;
      }

      // Success! Redirect to login
      router.push('/auth/login?message=Password+reset+successful');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #E3EADD, #B7D3D8, #D7CDEC)'
      }}>
        <div style={{ color: '#2A3F5A' }}>Validating recovery link...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(to bottom right, #E3EADD, #B7D3D8, #D7CDEC)',
      fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '24rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '28px',
        boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
        border: '1px solid rgba(215, 205, 236, 0.25)',
        padding: '2.5rem'
      }}>
        <h1 style={{
          fontFamily: "'Quicksand', ui-sans-serif, system-ui, sans-serif",
          fontSize: '1.75rem',
          color: '#2A3F5A',
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>
          Reset Password
        </h1>

        {tokenData?.email && (
          <p style={{
            color: '#586C8E',
            fontSize: '0.875rem',
            marginBottom: '2rem'
          }}>
            Resetting password for: {tokenData.email}
          </p>
        )}

        {error ? (
          <div style={{
            padding: '1rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(230, 168, 151, 0.1)',
            border: '1px solid rgba(230, 168, 151, 0.4)',
            color: '#E6A897',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#586C8E',
              marginBottom: '0.5rem',
              letterSpacing: '0.05em'
            }}>
              NEW PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                fontSize: '1rem',
                borderRadius: '1rem',
                border: '2px solid #E3EADD',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#586C8E',
              marginBottom: '0.5rem',
              letterSpacing: '0.05em'
            }}>
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                fontSize: '1rem',
                borderRadius: '1rem',
                border: '2px solid #E3EADD',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '1rem',
              border: 'none',
              background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
              color: '#2A3F5A',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !password || !confirmPassword ? 0.6 : 1,
              marginTop: '1rem'
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetTokenPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #E3EADD, #B7D3D8, #D7CDEC)'
      }}>
        <div style={{ color: '#2A3F5A' }}>Loading...</div>
      </div>
    }>
      <ResetTokenContent />
    </Suspense>
  );
}