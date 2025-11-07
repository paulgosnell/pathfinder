# UAT Feedback Tracking System

## Problem Solved

Previously, `/uat` would pull ALL feedback from the database every time, including issues that were already:
- Reviewed and triaged
- Fixed in recent commits
- Marked as positive feedback (no action needed)

This caused confusion and duplicate work.

## Solution

Added tracking columns to the `user_feedback` table to mark feedback as reviewed, triaged, and fixed.

## Database Schema Changes

**New Columns in `user_feedback` table:**

| Column | Type | Purpose |
|--------|------|---------|
| `reviewed` | BOOLEAN | Has this feedback been reviewed by the team? |
| `reviewed_at` | TIMESTAMPTZ | When was it reviewed? |
| `reviewed_by` | UUID | Which admin reviewed it? |
| `triage_tier` | TEXT | Which tier: tier-1-action-now, tier-2-backlog, tier-3-future, tier-4-wont-fix, not-applicable |
| `triage_notes` | TEXT | Internal notes about triage decision and action plan |
| `triaged_at` | TIMESTAMPTZ | When was it triaged? |
| `fixed_in_commit` | TEXT | Git commit hash that fixed this issue (if applicable) |
| `fixed_at` | TIMESTAMPTZ | When was the fix deployed? |
| `issue_type` | TEXT | Type: bug, ux, feature-request, content, positive-feedback, unclear |

## Migration Required

**Step 1: Apply Schema Migration**
```sql
-- Run in Supabase SQL Editor
-- File: migrations/add-feedback-tracking.sql
```

**Step 2: Mark Existing Feedback**
```sql
-- Run in Supabase SQL Editor
-- File: docs/feedback/mark-feedback-fixed.sql
```

This will mark all existing feedback (Oct 27 - Nov 7) as reviewed and link fixes to commits.

## New `/uat` Behavior

### Default: Pull Only Unreviewed Feedback
```bash
/uat pull latest feedback
```

Now uses this query:
```sql
SELECT * FROM user_feedback
WHERE reviewed = FALSE OR reviewed IS NULL
ORDER BY submitted_at DESC;
```

**Result:** You'll only see NEW feedback that hasn't been reviewed yet.

### Alternative Queries

See `docs/feedback/uat-queries.sql` for specialized queries:

1. **Pull unreviewed only** (default)
2. **View by triage tier** (see what's in each tier)
3. **View unfixed Tier 1/2 issues** (urgent + planned work only)
4. **View fixed feedback** (verify fixes worked)
5. **Summary stats** (counts by tier and issue type)
6. **Recent activity** (last 7 days of new feedback)

## Workflow

### 1. Pull New Feedback
```bash
/uat pull latest feedback
```

### 2. Triage Feedback
When user is ready to triage:
```sql
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = NOW(),
  triage_tier = 'tier-1-action-now',
  issue_type = 'bug',
  triage_notes = 'Description of issue and action plan'
WHERE id = 'feedback-uuid-here';
```

### 3. Mark as Fixed
After deploying a fix:
```sql
UPDATE user_feedback
SET
  fixed_in_commit = 'abc123def456',
  fixed_at = NOW()
WHERE id = 'feedback-uuid-here';
```

### 4. Mark as Not Applicable
For positive feedback or unclear feedback:
```sql
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = NOW(),
  triage_tier = 'not-applicable',
  issue_type = 'positive-feedback', -- or 'unclear'
  triage_notes = 'Positive feedback - no action needed'
WHERE id = 'feedback-uuid-here';
```

## Benefits

✅ **No duplicate work** - Already-reviewed feedback doesn't show up again
✅ **Track fixes** - Link feedback to specific commits
✅ **Audit trail** - Know when feedback was reviewed and by whom
✅ **Prioritization** - Filter by triage tier to focus on urgent issues
✅ **Metrics** - Track how many issues are fixed vs. pending

## Current Status (Nov 7, 2025)

**Feedback Summary:**
- 4 issues fixed in commit 011a06e (Oct 31)
- 3 issues in Tier 2 backlog (session persistence, USA content, age-appropriateness)
- 3 positive feedback entries marked as not-applicable
- 2 unclear feedback entries marked as not-applicable

**Next Time You Run `/uat`:**
You'll only see feedback submitted AFTER Nov 7, 2025 that hasn't been reviewed yet.

## Future Enhancements

Consider adding:
- Admin UI for managing feedback (instead of SQL queries)
- Slack/email notifications for new feedback
- Automated linking of commits to feedback based on keywords
- User follow-up system ("We fixed your issue - can you verify?")
