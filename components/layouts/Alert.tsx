import { ReactNode } from 'react';
import { SPACING, BORDER_RADIUS } from '@/lib/styles/spacing';

interface AlertProps {
  children: ReactNode;
  type: 'success' | 'error' | 'info';
}

/**
 * Standard alert/message component
 */
export function Alert({ children, type }: AlertProps) {
  const styles = {
    success: {
      borderColor: 'rgba(183, 211, 216, 0.4)',
      backgroundColor: 'rgba(183, 211, 216, 0.1)',
      color: '#2A3F5A',
    },
    error: {
      borderColor: 'rgba(230, 168, 151, 0.4)',
      backgroundColor: 'rgba(230, 168, 151, 0.1)',
      color: '#E6A897',
    },
    info: {
      borderColor: 'rgba(215, 205, 236, 0.4)',
      backgroundColor: 'rgba(215, 205, 236, 0.1)',
      color: '#2A3F5A',
    },
  };

  const style = styles[type];

  return (
    <div
      style={{
        borderRadius: BORDER_RADIUS.medium,
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        padding: SPACING.cardPadding,
        fontSize: '14px',
        color: style.color,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}
