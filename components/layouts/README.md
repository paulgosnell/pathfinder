# Layout System

Global layout components and spacing system for consistent UI across all mobile screens.

## Components

### ContentContainer
Main container for all screen content. Provides standard padding and spacing.

```tsx
import { ContentContainer } from '@/components/layouts/ContentContainer';

<ContentContainer padding="standard"> // or "large"
  {/* Your content */}
</ContentContainer>
```

### Card
Standard card with consistent styling, shadows, and optional title.

```tsx
import { Card } from '@/components/layouts/Card';

<Card title="Card Title" padding="standard"> // or "large"
  {/* Card content */}
</Card>
```

### FormField
Form input with label, consistent styling, and error states.

```tsx
import { FormField } from '@/components/layouts/FormField';

<FormField
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="your@email.com"
  error={errors.email} // optional
/>
```

### Button
Standard button with primary/secondary variants.

```tsx
import { Button } from '@/components/layouts/Button';

<Button
  onClick={handleSubmit}
  disabled={loading}
  variant="primary" // or "secondary"
  fullWidth={true}
>
  Save Changes
</Button>
```

### Alert
Message/notification component with success/error/info types.

```tsx
import { Alert } from '@/components/layouts/Alert';

<Alert type="success">
  ✓ Changes saved successfully!
</Alert>

<Alert type="error">
  Something went wrong. Please try again.
</Alert>
```

## Spacing System

Import from `@/lib/styles/spacing`:

```tsx
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';
```

### SPACING Constants
- `contentPadding` - 16px (standard screen padding)
- `contentPaddingLarge` - 24px (larger screen padding)
- `cardPadding` - 20px (inside cards)
- `cardPaddingLarge` - 24px (inside larger cards)
- `cardGap` - 20px (between cards/sections)
- `formFieldGap` - 20px (between form fields)
- `labelMargin` - 8px (below labels)
- `buttonPadding` - 16px (button padding)
- `buttonMargin` - 20px (above/below buttons)

### BORDER_RADIUS Constants
- `small` - 12px
- `medium` - 16px
- `large` - 20px
- `xlarge` - 24px

### SHADOWS Constants
- `card` - Standard card shadow
- `button` - Standard button shadow

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { FormField } from '@/components/layouts/FormField';
import { Button } from '@/components/layouts/Button';
import { Alert } from '@/components/layouts/Alert';

export default function MyPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative">
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="My Page"
          subtitle="Page description"
        />

        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>

            {success && (
              <Alert type="success">
                ✓ Saved successfully!
              </Alert>
            )}

            <Card title="My Form" padding="large">
              <FormField
                label="Your Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </Card>

            <Button onClick={() => setSuccess(true)}>
              Save
            </Button>

          </ContentContainer>
        </div>
      </div>
    </MobileDeviceMockup>
  );
}
```

## Migration Guide

When updating existing screens:

1. **Import layout components** at the top
2. **Wrap content** in `<ContentContainer>`
3. **Replace inline cards** with `<Card>` component
4. **Replace input fields** with `<FormField>` component
5. **Replace buttons** with `<Button>` component
6. **Replace alert divs** with `<Alert>` component

This ensures consistent spacing, styling, and behavior across all screens.
