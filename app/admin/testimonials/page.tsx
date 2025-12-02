'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Star, Heart, MessageCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Testimonial {
  id: string;
  rating: number;
  feedback_text: string;
  page_url: string;
  submitted_at: string;
  context?: {
    page?: string;
  };
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const getSourceLabel = (testimonial: Testimonial) => {
    const page = testimonial.context?.page || testimonial.page_url;
    if (page?.includes('voice')) return 'Voice';
    if (page?.includes('chat')) return 'Chat';
    return 'App';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < rating ? '#E6A897' : 'transparent'}
            stroke={i < rating ? '#E6A897' : '#D7CDEC'}
            strokeWidth={1.5}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminProtectedRoute>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
        * { font-family: 'Atkinson Hyperlegible', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Quicksand', sans-serif; font-weight: 600; }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#F9F7F3' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(215, 205, 236, 0.2)' }}>
          <div style={{ paddingLeft: '48px', paddingRight: '48px', paddingTop: '16px', paddingBottom: '16px' }}>
            {/* Back Link */}
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#586C8E',
                fontSize: '14px',
                textDecoration: 'none',
                marginBottom: '12px'
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            {/* Title Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{
                  color: '#2A3F5A',
                  fontSize: '28px',
                  margin: 0,
                  fontWeight: '700',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Heart size={28} style={{ color: '#E6A897' }} />
                  Wall of Love
                </h1>
                <p style={{ color: '#586C8E', fontSize: '14px', margin: '4px 0 0 0' }}>
                  Positive feedback from parents using Pathfinder (rating 8+)
                </p>
              </div>

              <button
                onClick={fetchTestimonials}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <p style={{ color: '#586C8E', fontSize: '13px', marginTop: '8px' }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '40px 48px' }}>
          {loading && testimonials.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid transparent',
                  borderTopColor: '#B7D3D8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: '#586C8E' }}>Loading testimonials...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            </div>
          ) : testimonials.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 32px',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid rgba(215, 205, 236, 0.2)'
            }}>
              <MessageCircle size={48} style={{ color: '#D7CDEC', marginBottom: '16px' }} />
              <p style={{ color: '#586C8E', fontSize: '16px', fontWeight: '600' }}>No testimonials yet</p>
              <p style={{ color: '#586C8E', fontSize: '14px', marginTop: '8px' }}>
                Positive feedback (rating 8+) will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div style={{
                display: 'flex',
                gap: '24px',
                marginBottom: '32px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px 28px',
                  border: '1px solid rgba(215, 205, 236, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(230, 168, 151, 0.15), rgba(240, 217, 218, 0.15))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Heart size={24} style={{ color: '#E6A897' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#2A3F5A' }}>
                      {testimonials.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#586C8E' }}>
                      Happy Parents
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px 28px',
                  border: '1px solid rgba(215, 205, 236, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(183, 211, 216, 0.15), rgba(227, 234, 221, 0.15))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Star size={24} style={{ color: '#B7D3D8' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#2A3F5A' }}>
                      {testimonials.filter(t => t.rating === 10).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#586C8E' }}>
                      Perfect 10s
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px 28px',
                  border: '1px solid rgba(215, 205, 236, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.15), rgba(183, 211, 216, 0.15))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Star size={24} style={{ color: '#D7CDEC' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#2A3F5A' }}>
                      {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#586C8E' }}>
                      Average Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Cards - Masonry-style grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(215, 205, 236, 0.2)',
                      boxShadow: '0 2px 8px rgba(42, 63, 90, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(42, 63, 90, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(42, 63, 90, 0.04)';
                    }}
                  >
                    {/* Rating */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {renderStars(testimonial.rating)}
                      <span style={{
                        backgroundColor: testimonial.rating === 10
                          ? 'rgba(230, 168, 151, 0.15)'
                          : 'rgba(183, 211, 216, 0.15)',
                        color: testimonial.rating === 10 ? '#D98A74' : '#586C8E',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {testimonial.rating}/10
                      </span>
                    </div>

                    {/* Quote */}
                    <blockquote style={{
                      margin: 0,
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#2A3F5A',
                      fontStyle: 'italic',
                      position: 'relative',
                      paddingLeft: '16px',
                      borderLeft: '3px solid #D7CDEC'
                    }}>
                      &ldquo;{testimonial.feedback_text}&rdquo;
                    </blockquote>

                    {/* Meta */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(215, 205, 236, 0.15)'
                    }}>
                      <span style={{
                        backgroundColor: 'rgba(227, 234, 221, 0.3)',
                        color: '#586C8E',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {getSourceLabel(testimonial)}
                      </span>
                      <span style={{ color: '#586C8E', fontSize: '13px' }}>
                        {formatDate(testimonial.submitted_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </AdminProtectedRoute>
  );
}
