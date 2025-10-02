'use client';

import {
  useState,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';
import Link from 'next/link';
import styles from '@/app/styles.module.css';

type TextContent = string | number | null | undefined;

interface AuthCardProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: () => Promise<void>;
  footer?: React.ReactNode;
  children: React.ReactNode;
  busy?: boolean;
  error?: string | null;
}

export function AuthCard({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  footer,
  children,
  busy,
  error
}: AuthCardProps) {
  const [localBusy, setLocalBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || localBusy) return;
    setLocalBusy(true);
    try {
      await onSubmit();
    } finally {
      setLocalBusy(false);
    }
  };

  const isBusy = busy || localBusy;

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
              {title}
            </h1>
            <p style={{
              fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
              color: '#586C8E',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              {subtitle}
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

        <form onSubmit={handleSubmit} style={{ padding: '2rem 2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {children}

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
              disabled={isBusy}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                color: '#2A3F5A',
                fontFamily: "'Quicksand', var(--font-quicksand), ui-sans-serif, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: '16px',
                padding: '0.875rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                boxShadow: '0 2px 5px rgba(42, 63, 90, 0.05)',
                transition: 'all 0.2s ease',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                opacity: isBusy ? 0.5 : 1
              }}
            >
              {isBusy ? 'Please wait...' : submitLabel}
            </button>
          </div>
        </form>

        {footer && (
          <footer style={{
            padding: '0 2.5rem 2.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#586C8E',
            fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
          }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export function AuthField({
  label,
  description,
  hint,
  children
}: {
  label: string;
  description?: TextContent;
  hint?: TextContent;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <span style={{
        fontFamily: "'Quicksand', var(--font-quicksand), ui-sans-serif, system-ui, sans-serif",
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'rgba(42, 63, 90, 0.8)'
      }}>
        {label}
      </span>
      {description && (
        <span style={{
          display: 'block',
          fontSize: '0.75rem',
          color: 'rgba(88, 108, 142, 0.75)',
          fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
        }}>
          {description}
        </span>
      )}
      {children}
      {hint && (
        <span style={{
          display: 'block',
          fontSize: '0.75rem',
          color: 'rgba(88, 108, 142, 0.7)',
          marginTop: '0.25rem',
          fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
        }}>
          {hint}
        </span>
      )}
    </label>
  );
}

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

export function AuthInput({
  wrapperClassName = '',
  className = '',
  ...props
}: AuthInputProps) {
  return (
    <input
      {...props}
      className={`${styles.authFormInput} ${className}`.trim()}
    />
  );
}

export function AuthFooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      style={{
        color: '#D7CDEC',
        fontWeight: 600,
        fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
        textDecoration: 'none',
        transition: 'color 0.2s'
      }}
    >
      {label}
    </Link>
  );
}

export function AuthTextarea({
  wrapperClassName = '',
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { wrapperClassName?: string }) {
  return (
    <textarea
      {...props}
      className={`${styles.authFormInput} ${className}`.trim()}
      style={{ minHeight: '130px', resize: 'none' }}
    />
  );
}

export function AuthSelect({
  wrapperClassName = '',
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }) {
  return (
    <select
      {...props}
      className={`${styles.authFormInput} ${className}`.trim()}
      style={{
        appearance: 'none',
        paddingRight: '3rem',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M6 9l6 6 6-6\' stroke=\'%23586C8E\' stroke-width=\'1.8\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1.25rem center'
      }}
    >
      {children}
    </select>
  );
}

type AuthCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children: React.ReactNode;
  containerClassName?: string;
};

export function AuthCheckbox({
  children,
  containerClassName = '',
  className = '',
  ...props
}: AuthCheckboxProps) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      borderRadius: '26px',
      border: '1px solid rgba(215, 205, 236, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '1rem 1.25rem',
      fontSize: '0.875rem',
      lineHeight: '1.625',
      color: '#586C8E',
      boxShadow: 'inset 0 2px 4px rgba(42, 63, 90, 0.03)',
      transition: 'all 0.2s ease',
      fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
      cursor: 'pointer'
    }}>
      <span style={{
        position: 'relative',
        marginTop: '0.125rem',
        display: 'flex',
        height: '1.25rem',
        width: '1.25rem',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <input
          {...props}
          type="checkbox"
          style={{
            height: '1.25rem',
            width: '1.25rem',
            appearance: 'none',
            borderRadius: '0.75rem',
            border: '1px solid rgba(215, 205, 236, 0.5)',
            backgroundColor: 'rgba(249, 247, 243, 0.7)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        />
        <svg
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            height: '0.875rem',
            width: '0.875rem',
            color: '#2A3F5A',
            opacity: props.checked ? 1 : 0,
            transition: 'opacity 0.15s'
          }}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 10.5l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span style={{ lineHeight: '1.625' }}>{children}</span>
    </label>
  );
}

