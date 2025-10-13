import { CSSProperties, ReactNode } from 'react';
import { SPACING } from '@/lib/styles/spacing';

interface ContentContainerProps {
  children: ReactNode;
  padding?: 'standard' | 'large';
}

/**
 * Standard content container for all mobile screens
 * Provides consistent padding and spacing
 */
export function ContentContainer({ children, padding = 'standard' }: ContentContainerProps) {
  const paddingValue = padding === 'large' ? SPACING.contentPaddingLarge : SPACING.contentPadding;

  return (
    <div
      style={{
        padding: paddingValue,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.cardGap,
      }}
    >
      {children}
    </div>
  );
}
