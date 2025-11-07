'use client';

import { useState } from 'react';

export default function AdminRecoveryPage() {
  const [email, setEmail] = useState('');
  const [recoveryLink, setRecoveryLink] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setError('');
    setRecoveryLink('');
    setCopied(false);
    setBusy(true);

    try {
      const response = await fetch('/api/admin/generate-recovery-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        // Display detailed error information for debugging
        const errorMessage = data?.message || 'Failed to generate recovery link';
        const errorDetails = data?.error ? `\n\nDetails: ${data.error}` : '';
        const errorSuggestion = data?.suggestion ? `\n\n${data.suggestion}` : '';
        const errorCode = data?.code ? `\n\nError code: ${data.code}` : '';
        setError(errorMessage + errorDetails + errorSuggestion + errorCode);
        return;
      }

      setRecoveryLink(data.recoveryLink);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recoveryLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy. Please copy manually.');
    }
  };

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
        maxWidth: '36rem',
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
          Admin: Generate Recovery Link
        </h1>
        <p style={{
          color: '#586C8E',
          fontSize: '0.875rem',
          marginBottom: '2rem'
        }}>
          Use this tool when email delivery fails. Generate a recovery link and share it directly with the user.
        </p>

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
              USER EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
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

          <button
            onClick={generateLink}
            disabled={busy || !email}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '1rem',
              border: 'none',
              background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
              color: '#2A3F5A',
              cursor: busy || !email ? 'not-allowed' : 'pointer',
              opacity: busy || !email ? 0.6 : 1,
              fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
            }}
          >
            {busy ? 'Generating...' : 'Generate Recovery Link'}
          </button>

          {error && (
            <div style={{
              padding: '1rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(230, 168, 151, 0.1)',
              border: '1px solid rgba(230, 168, 151, 0.4)',
              color: '#E6A897',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              fontFamily: "'Courier New', monospace"
            }}>
              {error}
            </div>
          )}

          {recoveryLink && (
            <div style={{
              padding: '1.5rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(183, 211, 216, 0.1)',
              border: '1px solid rgba(183, 211, 216, 0.4)'
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#2A3F5A',
                marginBottom: '1rem',
                letterSpacing: '0.05em'
              }}>
                RECOVERY LINK GENERATED
              </h3>
              <div style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                wordBreak: 'break-all',
                fontSize: '0.75rem',
                color: '#586C8E',
                marginBottom: '1rem',
                maxHeight: '8rem',
                overflowY: 'auto'
              }}>
                {recoveryLink}
              </div>
              <button
                onClick={copyToClipboard}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: '0.75rem',
                  border: '2px solid #B7D3D8',
                  backgroundColor: copied ? '#B7D3D8' : 'white',
                  color: '#2A3F5A',
                  cursor: 'pointer',
                  fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
                }}
              >
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <p style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#586C8E',
                lineHeight: '1.5'
              }}>
                Share this link with the user via SMS, WhatsApp, or other secure channel. The link will allow them to set a new password.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
