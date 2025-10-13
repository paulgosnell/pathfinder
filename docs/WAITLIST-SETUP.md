# Waitlist Setup Guide

This guide explains how to set up the waitlist signup system for the ADHD Support landing page.

## Overview

The landing page (`/`) now includes an email signup form where visitors can:
1. Sign up to be notified at launch
2. Opt-in to be early testers

All signups are stored in Supabase with tracking for early tester status.

## Database Setup

### 1. Run the Migration

Copy and paste the contents of `migrations/add-waitlist-signups.sql` into your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `migrations/add-waitlist-signups.sql`
5. Paste and click **Run**

This creates:
- `waitlist_signups` table
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp triggers

### 2. Verify the Table

Run this query to verify:
```sql
SELECT * FROM waitlist_signups LIMIT 5;
```

You should see an empty table with these columns:
- `id` (UUID)
- `email` (TEXT)
- `early_tester` (BOOLEAN)
- `signup_date` (TIMESTAMPTZ)
- `contacted` (BOOLEAN)
- `source` (TEXT)
- `user_agent` (TEXT)
- `ip_address` (TEXT)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## How It Works

### Frontend (Landing Page)

**File:** `app/page.tsx`

The landing page includes:
- Email input field
- Early tester checkbox
- Form submission to `/api/waitlist`
- Success state with confirmation message
- Error handling for duplicates and network issues

### Backend (API Endpoint)

**File:** `app/api/waitlist/route.ts`

The API endpoint:
- Accepts POST requests with `{ email, earlyTester }`
- Validates email format
- Checks for duplicates (returns friendly error)
- Stores signup in Supabase
- Returns success/error response
- Includes GET endpoint for total waitlist count (optional)

### Database (Supabase)

**Table:** `waitlist_signups`

**Row Level Security:**
- Anyone can INSERT (sign up)
- Only authenticated users can SELECT (view signups)
- Only authenticated users can UPDATE (mark as contacted)

## Testing the Waitlist

### Test Signup Flow

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Enter an email address

4. Optionally check "Yes, I want to be an early tester!"

5. Click submit

6. You should see a success message

### Verify in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select `waitlist_signups` table
4. You should see your test signup

### Test Duplicate Prevention

1. Try submitting the same email again
2. You should see: "This email is already on the waitlist"

## Viewing Signups

### In Supabase Dashboard

1. Go to **Table Editor**
2. Select `waitlist_signups`
3. Filter by `early_tester = true` to see early testers

### Via API (Optional)

Get total signup count:
```bash
curl http://localhost:3000/api/waitlist
```

Response:
```json
{
  "total": 42
}
```

## Exporting Signups

### Export as CSV

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select `waitlist_signups` table
4. Click **Download CSV**

### Export via SQL

```sql
SELECT
  email,
  early_tester,
  signup_date,
  contacted
FROM waitlist_signups
ORDER BY signup_date DESC;
```

## Integrating with Email Service

To send emails to signups, you can integrate with:

### Option 1: Mailchimp

```typescript
// In app/api/waitlist/route.ts, after successful signup:
await fetch('https://YOUR_DATACENTER.api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email_address: email,
    status: 'subscribed',
    tags: earlyTester ? ['early-tester'] : ['launch-notification']
  })
});
```

### Option 2: ConvertKit

```typescript
await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: process.env.CONVERTKIT_API_KEY,
    email: email,
    tags: earlyTester ? [12345] : [67890] // Tag IDs
  })
});
```

### Option 3: Resend (Recommended for Developers)

```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'ADHD Support <hello@yourdomain.com>',
  to: email,
  subject: earlyTester
    ? 'Welcome to Early Testing!'
    : 'You\'re on the list!',
  html: '<p>Thank you for signing up...</p>'
});
```

## Marking Signups as Contacted

After you contact early testers or launch the product:

```sql
UPDATE waitlist_signups
SET contacted = true, contacted_date = now()
WHERE email = 'user@example.com';
```

Or mark all early testers:

```sql
UPDATE waitlist_signups
SET contacted = true, contacted_date = now()
WHERE early_tester = true AND contacted = false;
```

## Analytics

### Total Signups

```sql
SELECT COUNT(*) as total_signups FROM waitlist_signups;
```

### Early Testers vs Launch Notifications

```sql
SELECT
  early_tester,
  COUNT(*) as count
FROM waitlist_signups
GROUP BY early_tester;
```

### Signups Over Time

```sql
SELECT
  DATE(signup_date) as date,
  COUNT(*) as signups
FROM waitlist_signups
GROUP BY DATE(signup_date)
ORDER BY date DESC;
```

### Conversion Rate (Early Tester %)

```sql
SELECT
  ROUND(
    (COUNT(*) FILTER (WHERE early_tester = true)::numeric / COUNT(*)) * 100,
    2
  ) as early_tester_percentage
FROM waitlist_signups;
```

## Security Notes

- Email addresses are stored in lowercase for consistency
- RLS policies prevent unauthorized access
- IP addresses are hashed for privacy (optional: update migration to hash IPs)
- User agent strings stored for analytics only
- No password or sensitive data stored

## GDPR Compliance

Users can request deletion of their data:

```sql
DELETE FROM waitlist_signups WHERE email = 'user@example.com';
```

Consider adding a privacy policy link and unsubscribe mechanism to all emails.

## Troubleshooting

### "Failed to save signup"

- Check Supabase connection (environment variables)
- Verify migration has been run
- Check Supabase logs for errors

### "This email is already on the waitlist"

- This is expected behavior for duplicates
- User can't sign up twice with the same email

### RLS Policy Issues

- Make sure you're using the `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side requests
- Verify RLS policies are enabled

## Next Steps

1. ✅ Run the migration
2. ✅ Test the signup flow
3. ⬜ Integrate with email service
4. ⬜ Set up analytics tracking
5. ⬜ Create email templates for early testers
6. ⬜ Plan launch notification campaign
