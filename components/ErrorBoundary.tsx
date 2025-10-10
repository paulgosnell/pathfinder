'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches React errors in child components and displays a fallback UI.
 * Prevents the entire app from crashing due to component errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, log to error tracking service
    // Future enhancement: Integrate Sentry or LogRocket
    if (process.env.NODE_ENV === 'production') {
      // Production error logging placeholder
      console.error('[Production Error]:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#F9F7F3',
          }}
        >
          <div
            style={{
              maxWidth: '32rem',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}
            >
              😔
            </div>
            
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2A3F5A',
                marginBottom: '1rem',
              }}
            >
              Something went wrong
            </h1>
            
            <p
              style={{
                color: '#586C8E',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              We're sorry, but something unexpected happened. 
              Don't worry - your data is safe. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  backgroundColor: '#F9F7F3',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#586C8E',
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: '#E6A897',
                    fontSize: '0.75rem',
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#B7D3D8',
                  color: '#2A3F5A',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#9FC5CB';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#B7D3D8';
                }}
              >
                Refresh Page
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#586C8E',
                  border: '2px solid #E3EADD',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#B7D3D8';
                  e.currentTarget.style.color = '#2A3F5A';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E3EADD';
                  e.currentTarget.style.color = '#586C8E';
                }}
              >
                Try Again
              </button>
            </div>

            <div
              style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #E3EADD',
                color: '#586C8E',
                fontSize: '0.875rem',
              }}
            >
              <p>
                Need help?{' '}
                <a
                  href="/"
                  style={{
                    color: '#2A3F5A',
                    textDecoration: 'underline',
                  }}
                >
                  Go to homepage
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

