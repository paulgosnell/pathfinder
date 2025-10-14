'use client';

import { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [earlyTester, setEarlyTester] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          earlyTester,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error
        alert(data.message || data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Success!
      setSubmitted(true);
    } catch (error) {
      console.error('Signup error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F9F7F3' }}>
        <div className="max-w-lg w-full bg-white rounded-3xl p-10 text-center" style={{
          boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
          border: '1px solid rgba(215, 205, 236, 0.2)'
        }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)'
          }}>
            <svg className="w-10 h-10" style={{ color: '#2A3F5A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '2rem',
            fontWeight: 600,
            color: '#2A3F5A',
            marginBottom: '1rem'
          }}>
            {earlyTester ? "Welcome to Early Testing!" : "You're on the list!"}
          </h1>

          <p style={{
            fontSize: '1rem',
            color: '#586C8E',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            {earlyTester
              ? "Thank you for joining our early testing program. We'll be in touch within 48 hours with access details."
              : "We'll notify you as soon as we launch. Get ready to transform your ADHD parenting journey."
            }
          </p>

          <p style={{ fontSize: '0.875rem', color: '#586C8E', marginBottom: '2rem' }}>
            Check your email at <strong style={{ color: '#2A3F5A' }}>{email}</strong>
          </p>

          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
              setEarlyTester(false);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 600,
              color: '#2A3F5A',
              background: 'rgba(227, 234, 221, 0.5)',
              border: '1px solid rgba(215, 205, 236, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F7F3' }}>

      {/* Navigation Header */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(249, 247, 243, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(215, 205, 236, 0.2)',
        boxShadow: '0 2px 8px rgba(42, 63, 90, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#2A3F5A'
          }}>
            ADHD Support
          </div>

          {/* Auth Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            <a
              href="/auth/login"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#586C8E',
                backgroundColor: 'transparent',
                border: 'none',
                textDecoration: 'none',
                transition: 'color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#2A3F5A'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#586C8E'}
            >
              Log In
            </a>
            <a
              href="/auth/register"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#2A3F5A',
                backgroundColor: 'white',
                border: '1px solid rgba(215, 205, 236, 0.3)',
                boxShadow: '0 2px 5px rgba(42, 63, 90, 0.05)',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(227, 234, 221, 0.6) 0%, rgba(215, 205, 236, 0.6) 50%, rgba(183, 211, 216, 0.5) 100%)',
          opacity: 0.9
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 1.5rem 5rem',
          textAlign: 'center'
        }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            marginBottom: '2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(215, 205, 236, 0.3)',
            boxShadow: '0 2px 8px rgba(42, 63, 90, 0.05)'
          }}>
            <div style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#E6A897',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <span style={{
              fontSize: '0.875rem',
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 600,
              color: '#2A3F5A'
            }}>
              Now Accepting Early Testers
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            fontWeight: 700,
            color: '#2A3F5A',
            marginBottom: '1.5rem',
            lineHeight: 1.2
          }}>
            You're not alone<br />in this journey
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
            color: '#586C8E',
            marginBottom: '3rem',
            lineHeight: 1.6,
            maxWidth: '48rem',
            margin: '0 auto 3rem'
          }}>
            AI-powered coach for parents of ADHD children that is here to listen and help.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <a
              href="/auth/register"
              style={{
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600,
                fontSize: '1.125rem',
                color: '#2A3F5A',
                background: 'linear-gradient(to right, #E6A897, #F0D9DA)',
                boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Sign Up
            </a>

            <a
              href="/auth/login"
              style={{
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600,
                fontSize: '1.125rem',
                color: '#2A3F5A',
                backgroundColor: 'white',
                border: '1px solid rgba(215, 205, 236, 0.3)',
                boxShadow: '0 2px 5px rgba(42, 63, 90, 0.05)',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Log In
            </a>
          </div>

          {/* Trust indicator */}
          <p style={{
            fontSize: '0.875rem',
            color: '#586C8E'
          }}>
            Evidence-based • Crisis-safe • GDPR compliant
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: 600,
              color: '#2A3F5A',
              marginBottom: '1rem'
            }}>
              Coaching, not consulting
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#586C8E',
              maxWidth: '42rem',
              margin: '0 auto'
            }}>
              We don't give you answers. We help you discover them. Because you're the expert on your child.
            </p>
          </div>

          {/* GROW Model Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>

            {[
              { emoji: '🎯', title: 'Goal', color: '#E3EADD', desc: 'What do you want to achieve? We help you clarify your objectives and what success looks like.' },
              { emoji: '🔍', title: 'Reality', color: '#D7CDEC', desc: 'Deep exploration of your situation. We spend 60% of our time here, understanding what\'s really happening.' },
              { emoji: '💡', title: 'Options', color: '#B7D3D8', desc: 'What could you try? We explore possibilities together, drawing on your strengths and our evidence base.' },
              { emoji: '✨', title: 'Will', color: '#F0D9DA', desc: 'Your action plan. You leave with concrete steps you\'ve chosen, not prescriptions we\'ve given.' }
            ].map((item, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(215, 205, 236, 0.2)',
                boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
                transition: 'box-shadow 0.3s'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '9999px',
                  backgroundColor: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  fontSize: '1.5rem'
                }}>
                  {item.emoji}
                </div>
                <h3 style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#2A3F5A',
                  marginBottom: '0.5rem'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#586C8E',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Early Access Form */}
      <section id="early-access" style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(to bottom, rgba(215, 205, 236, 0.15), rgba(183, 211, 216, 0.15))'
      }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: 600,
              color: '#2A3F5A',
              marginBottom: '1rem'
            }}>
              Be part of something meaningful
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#586C8E'
            }}>
              Join our early testing program or get notified when we launch.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            border: '1px solid rgba(215, 205, 236, 0.2)',
            boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)'
          }}>

            <form onSubmit={handleSubmit}>

              {/* Email Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontFamily: 'Quicksand, sans-serif',
                  fontWeight: 600,
                  color: '#2A3F5A',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(215, 205, 236, 0.3)',
                    backgroundColor: 'rgba(249, 247, 243, 0.5)',
                    boxShadow: 'inset 0 2px 4px rgba(42, 63, 90, 0.03)',
                    fontSize: '1rem',
                    color: '#2A3F5A',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Early Tester Checkbox */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(215, 205, 236, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: 'inset 0 2px 4px rgba(42, 63, 90, 0.03)',
                marginBottom: '1.5rem'
              }}>
                <input
                  type="checkbox"
                  id="earlyTester"
                  checked={earlyTester}
                  onChange={(e) => setEarlyTester(e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    marginTop: '0.125rem',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="earlyTester" style={{
                  fontSize: '0.875rem',
                  color: '#586C8E',
                  lineHeight: 1.6,
                  cursor: 'pointer'
                }}>
                  <strong style={{ color: '#2A3F5A' }}>Yes, I want to be an early tester!</strong> I understand I'll get early access and can provide feedback to help shape the product.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  borderRadius: '9999px',
                  fontFamily: 'Quicksand, sans-serif',
                  fontWeight: 600,
                  color: '#2A3F5A',
                  background: earlyTester
                    ? 'linear-gradient(to right, #E6A897, #F0D9DA)'
                    : 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                  border: 'none',
                  boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
                  cursor: loading || !email ? 'not-allowed' : 'pointer',
                  opacity: loading || !email ? 0.5 : 1,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && email) e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {loading ? 'Submitting...' : earlyTester ? 'Join Early Testing →' : 'Notify Me at Launch'}
              </button>

              <p style={{
                fontSize: '0.75rem',
                color: '#586C8E',
                textAlign: 'center',
                marginTop: '1rem',
                marginBottom: 0
              }}>
                We respect your privacy. Unsubscribe anytime.
              </p>

            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 1.5rem',
        borderTop: '1px solid rgba(215, 205, 236, 0.2)',
        backgroundColor: 'rgba(249, 247, 243, 0.5)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <h3 style={{
                fontFamily: 'Quicksand, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#2A3F5A',
                marginBottom: '0.25rem'
              }}>
                ADHD Support
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#586C8E',
                margin: 0
              }}>
                Your AI therapeutic companion
              </p>
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: '#586C8E',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(215, 205, 236, 0.2)',
              width: '100%'
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                © 2025 ADHD Support. This is not a replacement for professional medical or therapeutic care.
              </p>
              <p style={{ margin: 0 }}>
                If you're in crisis, call 999 (UK) or Samaritans 116 123
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
