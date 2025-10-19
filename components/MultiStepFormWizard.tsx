'use client';

import { useState, ReactNode } from 'react';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import { SPACING, BORDER_RADIUS } from '@/lib/styles/spacing';

interface Step {
  title: string;
  component: ReactNode;
  validate?: () => boolean | string; // Return true if valid, or error message
}

interface MultiStepFormWizardProps {
  steps: Step[];
  onComplete: () => void;
  onCancel: () => void;
  title: string;
  saving?: boolean;
  completionButtonText?: string;
}

export function MultiStepFormWizard({
  steps,
  onComplete,
  onCancel,
  title,
  saving = false,
  completionButtonText = 'Save'
}: MultiStepFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    // Validate current step if validation function provided
    if (steps[currentStep].validate) {
      const result = steps[currentStep].validate!();
      if (result !== true) {
        setValidationError(typeof result === 'string' ? result : 'Please complete this step');
        return;
      }
    }

    setValidationError(null);

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setCurrentStep(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkip = () => {
    setValidationError(null);
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#F9F7F3',
      zIndex: 100,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Progress */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(215, 205, 236, 0.2)',
        padding: '16px 20px',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#2A3F5A',
            margin: 0
          }}>
            {title}
          </h2>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7F8FA6',
              fontSize: '24px',
              cursor: saving ? 'not-allowed' : 'pointer',
              padding: '0',
              lineHeight: 1,
              opacity: saving ? 0.5 : 1
            }}
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            height: '4px',
            backgroundColor: 'rgba(215, 205, 236, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#D7CDEC',
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{
          fontSize: '13px',
          color: '#7F8FA6',
          fontWeight: 500
        }}>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px'
      }}>
        {/* Validation Error */}
        {validationError && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(230, 168, 151, 0.1)',
            border: '1px solid rgba(230, 168, 151, 0.3)',
            borderRadius: BORDER_RADIUS.medium,
            marginBottom: '16px',
            color: '#E6A897',
            fontSize: '14px'
          }}>
            {validationError}
          </div>
        )}

        {/* Current Step Content */}
        <div>
          {steps[currentStep].component}
        </div>
      </div>

      {/* Fixed Footer with Navigation */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid rgba(215, 205, 236, 0.2)',
        padding: '16px 20px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {/* Primary Action */}
          <Button
            onClick={handleNext}
            disabled={saving}
            variant="primary"
            style={{ width: '100%' }}
          >
            {saving ? 'Saving...' : isLastStep ? completionButtonText : 'Next'}
          </Button>

          {/* Secondary Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isFirstStep && (
              <Button
                onClick={handleBack}
                disabled={saving}
                variant="secondary"
                style={{ flex: 1 }}
              >
                Back
              </Button>
            )}

            {!isLastStep && (
              <Button
                onClick={handleSkip}
                disabled={saving}
                variant="secondary"
                style={{ flex: 1 }}
              >
                Skip
              </Button>
            )}

            {isFirstStep && (
              <Button
                onClick={onCancel}
                disabled={saving}
                variant="secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
