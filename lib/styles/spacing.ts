/**
 * Global Spacing System
 * Used consistently across all mobile screens
 */

export const SPACING = {
  // Fixed header
  headerHeight: '72px',             // Fixed AppHeader height
  headerPaddingTop: '96px',         // Header height + top spacing (72px + 24px)
  contentTopMargin: '88px',         // Margin-top for content below fixed header (72px + 16px breathing room)

  // Content padding (inside mobile device)
  contentPadding: '16px',           // Standard screen padding
  contentPaddingLarge: '24px',      // Larger screen padding

  // Card spacing
  cardPadding: '20px',              // Inside cards
  cardPaddingLarge: '24px',         // Inside larger cards
  cardGap: '20px',                  // Between cards/sections

  // Form elements
  formFieldGap: '20px',             // Between form fields
  labelMargin: '8px',               // Below labels

  // Buttons
  buttonPadding: '16px',            // Button padding
  buttonMargin: '20px',             // Above/below buttons
} as const;

export const BORDER_RADIUS = {
  small: '12px',
  medium: '16px',
  large: '20px',
  xlarge: '24px',
} as const;

export const SHADOWS = {
  card: '0 2px 10px rgba(42, 63, 90, 0.08)',
  button: '0 2px 8px rgba(42, 63, 90, 0.1)',
} as const;
