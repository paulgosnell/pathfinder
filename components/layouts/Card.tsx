import { CSSProperties, ReactNode } from 'react';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';

interface CardProps {
  children: ReactNode;
  padding?: 'standard' | 'large';
  title?: string;
}

/**
 * Standard card component with consistent styling
 */
export function Card({ children, padding = 'standard', title }: CardProps) {
  const paddingValue = padding === 'large' ? SPACING.cardPaddingLarge : SPACING.cardPadding;

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: BORDER_RADIUS.large,
        padding: paddingValue,
        boxShadow: SHADOWS.card,
        border: '1px solid rgba(215, 205, 236, 0.2)',
      }}
    >
      {title && (
        <h2
          style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#2A3F5A',
            marginBottom: SPACING.formFieldGap,
            marginTop: 0,
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
