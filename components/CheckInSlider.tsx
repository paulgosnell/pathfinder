'use client';

import React from 'react';

/**
 * CheckInSlider Component
 *
 * A reusable slider component for daily check-ins that allows parents to rate
 * dimensions of their child's day on a 1-10 scale.
 *
 * Features:
 * - Icon + label on left, live value (X/10) on right
 * - Range slider (1-10) with gradient background (red → yellow → green)
 * - Color-coded value display based on score
 * - "Poor" and "Great" labels below slider
 * - Fully accessible with ARIA labels
 *
 * @example
 * <CheckInSlider
 *   label="Sleep Quality"
 *   icon="😴"
 *   value={7}
 *   onChange={(newValue) => setSleepQuality(newValue)}
 *   dimension="sleep_quality"
 * />
 */

interface CheckInSliderProps {
  /** The display label for this dimension (e.g., "Sleep Quality") */
  label: string;

  /** Emoji icon to display before the label */
  icon: string;

  /** Current value (1-10, or null if not set) */
  value: number | null;

  /** Callback fired when slider value changes */
  onChange: (value: number) => void;

  /** Internal dimension name for accessibility (e.g., "sleep_quality") */
  dimension: string;

  /** Whether the slider is disabled (view-only mode) */
  disabled?: boolean;
}

/**
 * Get color for value display based on score
 * - 1-3: Red/coral (crisis)
 * - 4-7: Yellow (warning)
 * - 8-10: Green (success)
 */
const getColorForValue = (value: number | null): string => {
  if (!value) return '#D1D8E0'; // Gray for unset
  if (value <= 3) return '#E6A897'; // Red (crisis/coral)
  if (value <= 7) return '#FFD93D'; // Yellow (warning)
  return '#6BCF7F'; // Green (success)
};

export default function CheckInSlider({
  label,
  icon,
  value,
  onChange,
  dimension,
  disabled = false,
}: CheckInSliderProps) {
  // Use value or default to middle (5) for initial slider position
  const displayValue = value ?? 5;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Header: Icon + Label + Value Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <label
          htmlFor={`slider-${dimension}`}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#2A3F5A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Quicksand, sans-serif',
          }}
        >
          <span
            style={{ fontSize: '20px' }}
            role="img"
            aria-label={label}
          >
            {icon}
          </span>
          {label}
        </label>

        {/* Live Value Display */}
        <span
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: getColorForValue(value),
            minWidth: '50px',
            textAlign: 'right',
            fontFamily: 'Quicksand, sans-serif',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {value ? `${value}/10` : '—/10'}
        </span>
      </div>

      {/* Range Slider with Gradient Background */}
      <input
        id={`slider-${dimension}`}
        type="range"
        min="1"
        max="10"
        value={displayValue}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        aria-label={`${label} rating from 1 to 10`}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={displayValue}
        aria-valuetext={value ? `${value} out of 10` : 'Not set'}
        style={{
          width: '100%',
          height: '8px',
          borderRadius: '4px',
          appearance: 'none',
          WebkitAppearance: 'none',
          background: disabled
            ? 'linear-gradient(to right, rgba(230, 168, 151, 0.5) 0%, rgba(255, 217, 61, 0.5) 50%, rgba(107, 207, 127, 0.5) 100%)'
            : 'linear-gradient(to right, #E6A897 0%, #FFD93D 50%, #6BCF7F 100%)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          outline: 'none',
        }}
      />

      {/* Poor/Great Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '11px',
          color: '#7F8FA6',
          fontFamily: 'Quicksand, sans-serif',
        }}
      >
        <span>Poor</span>
        <span>Great</span>
      </div>

      {/* Custom slider styling for webkit browsers */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #2A3F5A;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }

        input[type='range']::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }

        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #2A3F5A;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }

        input[type='range']::-moz-range-thumb:active {
          transform: scale(1.15);
        }

        input[type='range']:focus {
          outline: 2px solid #2A3F5A;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
