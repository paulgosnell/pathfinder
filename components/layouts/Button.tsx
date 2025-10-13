import { ButtonHTMLAttributes, CSSProperties } from 'react';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

/**
 * Standard button component with consistent styling
 */
export function Button({
  children,
  variant = 'primary',
  fullWidth = true,
  disabled,
  ...buttonProps
}: ButtonProps) {
  const getBackground = () => {
    if (disabled) return 'rgba(215, 205, 236, 0.5)';
    return variant === 'primary'
      ? 'linear-gradient(to right, #D7CDEC, #B7D3D8)'
      : 'white';
  };

  return (
    <button
      {...buttonProps}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: SPACING.buttonPadding,
        borderRadius: BORDER_RADIUS.medium,
        border: variant === 'secondary' ? '2px solid rgba(215, 205, 236, 0.3)' : 'none',
        background: getBackground(),
        color: '#2A3F5A',
        fontSize: '16px',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 0.2s',
        boxShadow: SHADOWS.button,
        ...(buttonProps.style || {}),
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.02)';
        }
        buttonProps.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        buttonProps.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
