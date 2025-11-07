-- UAT Feedback Queries
-- Use these queries with the /uat slash command to avoid pulling duplicate feedback

-- Query 1: Pull ONLY unreviewed feedback (default for /uat)
SELECT
  id,
  rating,
  feedback_text,
  context,
  page_url,
  submitted_at,
  user_id,
  session_id
FROM user_feedback
WHERE reviewed = FALSE OR reviewed IS NULL
ORDER BY submitted_at DESC;

-- Query 2: Pull feedback by triage tier (see what's in each tier)
SELECT
  triage_tier,
  issue_type,
  rating,
  feedback_text,
  triage_notes,
  fixed_in_commit,
  submitted_at
FROM user_feedback
WHERE triage_tier IS NOT NULL
ORDER BY
  CASE triage_tier
    WHEN 'tier-1-action-now' THEN 1
    WHEN 'tier-2-backlog' THEN 2
    WHEN 'tier-3-future' THEN 3
    WHEN 'tier-4-wont-fix' THEN 4
    ELSE 5
  END,
  submitted_at DESC;

-- Query 3: Pull only UNFIXED Tier 1 and Tier 2 issues (urgent + planned work)
SELECT
  triage_tier,
  issue_type,
  rating,
  feedback_text,
  triage_notes,
  submitted_at,
  id
FROM user_feedback
WHERE triage_tier IN ('tier-1-action-now', 'tier-2-backlog')
  AND (fixed_in_commit IS NULL OR fixed_at IS NULL)
ORDER BY
  CASE triage_tier
    WHEN 'tier-1-action-now' THEN 1
    WHEN 'tier-2-backlog' THEN 2
  END,
  submitted_at DESC;

-- Query 4: Pull fixed feedback (to verify fixes)
SELECT
  issue_type,
  feedback_text,
  triage_notes,
  fixed_in_commit,
  fixed_at,
  submitted_at
FROM user_feedback
WHERE fixed_in_commit IS NOT NULL
ORDER BY fixed_at DESC;

-- Query 5: Summary stats
SELECT
  triage_tier,
  issue_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN fixed_in_commit IS NOT NULL THEN 1 END) as fixed_count,
  COUNT(CASE WHEN fixed_in_commit IS NULL AND triage_tier IN ('tier-1-action-now', 'tier-2-backlog') THEN 1 END) as needs_fixing
FROM user_feedback
WHERE reviewed = TRUE
GROUP BY triage_tier, issue_type
ORDER BY
  CASE triage_tier
    WHEN 'tier-1-action-now' THEN 1
    WHEN 'tier-2-backlog' THEN 2
    WHEN 'tier-3-future' THEN 3
    WHEN 'tier-4-wont-fix' THEN 4
    ELSE 5
  END,
  issue_type;

-- Query 6: Recent activity (last 7 days of NEW feedback)
SELECT
  rating,
  feedback_text,
  context,
  submitted_at,
  reviewed
FROM user_feedback
WHERE submitted_at > NOW() - INTERVAL '7 days'
ORDER BY submitted_at DESC;
