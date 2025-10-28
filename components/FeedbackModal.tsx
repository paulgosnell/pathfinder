'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from './layouts/Button';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

export function FeedbackModal({ isOpen, onClose, sessionId }: FeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!feedbackText.trim()) {
      setError('Please tell us why you gave this rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('You must be logged in to submit feedback');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          rating,
          feedback_text: feedbackText,
          session_id: sessionId,
          context: {
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitSuccess(true);

      // Reset form and close after a delay
      setTimeout(() => {
        setRating(null);
        setFeedbackText('');
        setSubmitSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: SPACING.contentPadding,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: BORDER_RADIUS.large,
          padding: SPACING.cardPaddingLarge,
          maxWidth: '500px',
          width: '100%',
          boxShadow: SHADOWS.card,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: SPACING.contentPadding,
            right: SPACING.contentPadding,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#586C8E',
          }}
        >
          <X size={24} />
        </button>

        {submitSuccess ? (
          <div style={{ textAlign: 'center', padding: SPACING.cardPaddingLarge }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#2A3F5A',
                marginBottom: SPACING.contentPadding,
              }}
            >
              Thank you!
            </h2>
            <p style={{ color: '#586C8E', fontSize: '16px' }}>
              Your feedback helps us make Pathfinder better for everyone.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#2A3F5A',
                marginBottom: SPACING.labelMargin,
              }}
            >
              Share Your Feedback
            </h2>

            <p
              style={{
                color: '#586C8E',
                fontSize: '14px',
                marginBottom: SPACING.cardPaddingLarge,
                lineHeight: 1.5,
              }}
            >
              We're looking for honest feedback so that we can make the app as good as possible.
            </p>

            {/* Rating */}
            <div style={{ marginBottom: SPACING.cardPaddingLarge }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#586C8E',
                  marginBottom: SPACING.labelMargin,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                How would you rate your experience just now?
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'nowrap',
                  justifyContent: 'space-between',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    style={{
                      flex: '1',
                      minWidth: '40px',
                      maxWidth: '46px',
                      height: '44px',
                      borderRadius: BORDER_RADIUS.medium,
                      border: rating === num ? '2px solid #D7CDEC' : '2px solid #E3EADD',
                      background: rating === num ? 'linear-gradient(to right, #D7CDEC, #B7D3D8)' : 'white',
                      color: '#2A3F5A',
                      fontSize: '16px',
                      fontWeight: rating === num ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (rating !== num) {
                        e.currentTarget.style.borderColor = '#D7CDEC';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (rating !== num) {
                        e.currentTarget.style.borderColor = '#E3EADD';
                      }
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback text */}
            <div style={{ marginBottom: SPACING.cardPaddingLarge }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#586C8E',
                  marginBottom: SPACING.labelMargin,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Please tell us why
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What made you give this rating? What could we improve?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '16px',
                  borderRadius: BORDER_RADIUS.medium,
                  border: error && !feedbackText.trim() ? '2px solid #E6A897' : '2px solid #E3EADD',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  color: '#2A3F5A',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D7CDEC';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error && !feedbackText.trim() ? '#E6A897' : '#E3EADD';
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: SPACING.labelMargin,
                  backgroundColor: 'rgba(230, 168, 151, 0.1)',
                  borderRadius: BORDER_RADIUS.small,
                  marginBottom: SPACING.contentPadding,
                }}
              >
                <p style={{ color: '#E6A897', fontSize: '14px', margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              fullWidth
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
