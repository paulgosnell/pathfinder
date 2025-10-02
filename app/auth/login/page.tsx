'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard, AuthField, AuthInput, AuthFooterLink } from '@/app/auth/components/AuthCard';
import styles from '@/app/styles.module.css';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params?.get('registered')) {
      setError('Account created successfully. Please sign in.');
    }
  }, [params]);

  const handleLogin = async () => {
    setError(null);
    setBusy(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Invalid email or password.');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('We had trouble signing you in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '28rem' }}>
      <div style={{
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
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{
              fontFamily: "'Quicksand', var(--font-quicksand), ui-sans-serif, system-ui, sans-serif",
              fontSize: '1.625rem',
              lineHeight: '1.2',
              color: '#2A3F5A',
              fontWeight: 600,
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Welcome Back
            </h1>
            <p style={{
              fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
              color: '#586C8E',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              Continue your ADHD support journey
            </p>
          </div>
          <div
            aria-hidden="true"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              bottom: '-4rem',
              right: '-3rem',
              height: '10rem',
              width: '10rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(215, 205, 236, 0.3)',
              filter: 'blur(48px)'
            }}
          />
        </header>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }} style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className={styles.authFormGroup}>
          <label className={styles.authFormLabel}>EMAIL</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.authFormInput}
          />
        </div>

        <div className={styles.authFormGroup}>
          <label className={styles.authFormLabel}>PASSWORD</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className={styles.authFormInput}
          />
        </div>
        
        {error && (
          <div style={{
            borderRadius: '1rem',
            border: '1px solid rgba(230, 168, 151, 0.4)',
            backgroundColor: 'rgba(230, 168, 151, 0.1)',
            padding: '1rem 1.25rem',
            fontSize: '0.875rem',
            color: '#E6A897'
          }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className={styles.authSubmitButton}
          disabled={busy}
        >
          {busy ? 'Please wait...' : 'Sign In'}
        </button>
      </div>
        </form>

        <footer style={{
          padding: '0 2.5rem 2.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#586C8E',
          fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              margin: 0
            }}>
              <span>Need an account?</span>
              <a href="/auth/register" style={{
                color: '#D7CDEC',
                fontWeight: 600,
                fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                Create one
              </a>
            </p>
            <p style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              margin: 0
            }}>
              <span>Forgot your password?</span>
              <a href="/auth/reset" style={{
                color: '#D7CDEC',
                fontWeight: 600,
                fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                Reset it
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

