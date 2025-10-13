import { CSSProperties, InputHTMLAttributes } from 'react';
import { SPACING, BORDER_RADIUS } from '@/lib/styles/spacing';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Standard form field with consistent styling
 */
export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <div style={{ marginBottom: SPACING.formFieldGap }}>
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
        {label}
      </label>
      <input
        {...inputProps}
        style={{
          width: '100%',
          padding: '14px 18px',
          fontSize: '16px',
          borderRadius: BORDER_RADIUS.medium,
          border: error ? '2px solid #E6A897' : '2px solid #E3EADD',
          outline: 'none',
          transition: 'border-color 0.2s',
          color: '#2A3F5A',
          boxSizing: 'border-box',
          ...(inputProps.style || {}),
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#D7CDEC';
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#E6A897' : '#E3EADD';
          inputProps.onBlur?.(e);
        }}
      />
      {error && (
        <p
          style={{
            fontSize: '12px',
            color: '#E6A897',
            marginTop: '6px',
            marginBottom: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
