'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Check if we have access_token and refresh_token in URL hash
    const hash = window.location.hash;
    if (!hash) {
      setError('Invalid recovery link. Please request a new password reset.');
    }
  }, []);

  const handleUpdatePassword = async () => {
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      const supabase = createBrowserClient();

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message || 'Failed to update password. Please try again.');
        return;
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login?reset=success');
      }, 2000);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (success) {
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
          maxWidth: '28rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: '28px',
          boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
          border: '1px solid rgba(215, 205, 236, 0.25)',
          padding: '3rem 2.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(183, 211, 216, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            ✓
          </div>
          <h1 style={{
            fontFamily: "'Quicksand', ui-sans-serif, system-ui, sans-serif",
            fontSize: '1.5rem',
            color: '#2A3F5A',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            Password Updated
          </h1>
          <p style={{
            color: '#586C8E',
            fontSize: '0.875rem'
          }}>
            Redirecting you to sign in...
          </p>
        </div>
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
        maxWidth: '28rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '28px',
        boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
        border: '1px solid rgba(215, 205, 236, 0.25)',
        overflow: 'hidden'
      }}>
        <header style={{
          position: 'relative',
          background: 'linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7))',
          padding: '2.25rem 2.5rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: "'Quicksand', ui-sans-serif, system-ui, sans-serif",
            fontSize: '1.625rem',
            color: '#2A3F5A',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            Set New Password
          </h1>
          <p style={{
            color: '#586C8E',
            fontSize: '0.875rem'
          }}>
            Choose a strong password for your account
          </p>
        </header>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdatePassword();
        }} style={{ padding: '2rem 2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                minLength={8}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1.25rem',
                  fontSize: '1rem',
                  borderRadius: '1rem',
                  border: '2px solid #E3EADD',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
                }}
                onFocus={(e) => e.target.style.borderColor = '#D7CDEC'}
                onBlur={(e) => e.target.style.borderColor = '#E3EADD'}
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
                minLength={8}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1.25rem',
                  fontSize: '1rem',
                  borderRadius: '1rem',
                  border: '2px solid #E3EADD',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
                }}
                onFocus={(e) => e.target.style.borderColor = '#D7CDEC'}
                onBlur={(e) => e.target.style.borderColor = '#E3EADD'}
              />
            </div>

            {error && (
              <div style={{
                padding: '1rem',
                borderRadius: '1rem',
                backgroundColor: 'rgba(230, 168, 151, 0.1)',
                border: '1px solid rgba(230, 168, 151, 0.4)',
                color: '#E6A897',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '1rem',
                border: 'none',
                background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                color: '#2A3F5A',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.6 : 1,
                fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
              }}
            >
              {busy ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
