-- Migration: Add feedback tracking columns to user_feedback table
-- Purpose: Track which feedback has been reviewed, triaged, and fixed
-- Date: 2025-11-07

-- Add tracking columns
ALTER TABLE user_feedback
ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS triage_tier TEXT CHECK (triage_tier IN ('tier-1-action-now', 'tier-2-backlog', 'tier-3-future', 'tier-4-wont-fix', 'not-applicable')),
ADD COLUMN IF NOT EXISTS triage_notes TEXT,
ADD COLUMN IF NOT EXISTS triaged_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fixed_in_commit TEXT,
ADD COLUMN IF NOT EXISTS fixed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS issue_type TEXT CHECK (issue_type IN ('bug', 'ux', 'feature-request', 'content', 'positive-feedback', 'unclear'));

-- Add comment
COMMENT ON COLUMN user_feedback.reviewed IS 'Whether this feedback has been reviewed by the team';
COMMENT ON COLUMN user_feedback.reviewed_at IS 'When this feedback was reviewed';
COMMENT ON COLUMN user_feedback.reviewed_by IS 'Admin user who reviewed this feedback';
COMMENT ON COLUMN user_feedback.triage_tier IS 'Triage tier: tier-1-action-now (critical), tier-2-backlog (planned), tier-3-future (nice to have), tier-4-wont-fix (declined), not-applicable (positive feedback or unclear)';
COMMENT ON COLUMN user_feedback.triage_notes IS 'Internal notes about triage decision and action plan';
COMMENT ON COLUMN user_feedback.triaged_at IS 'When this feedback was triaged';
COMMENT ON COLUMN user_feedback.fixed_in_commit IS 'Git commit hash that fixed this issue (if applicable)';
COMMENT ON COLUMN user_feedback.fixed_at IS 'When the fix was deployed';
COMMENT ON COLUMN user_feedback.issue_type IS 'Type of feedback: bug, ux, feature-request, content, positive-feedback, unclear';

-- Create index for filtering unreviewed feedback
CREATE INDEX IF NOT EXISTS idx_user_feedback_reviewed ON user_feedback(reviewed) WHERE reviewed = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_feedback_triage_tier ON user_feedback(triage_tier);
CREATE INDEX IF NOT EXISTS idx_user_feedback_issue_type ON user_feedback(issue_type);
