-- Fix session_type constraint to include 'check-in'
-- Created: October 30, 2025
-- Purpose: Add 'check-in' to allowed session types (it was missing from original constraint)

-- Drop the old constraint
ALTER TABLE agent_sessions
DROP CONSTRAINT IF EXISTS agent_sessions_session_type_check;

-- Add new constraint with 'check-in' included
ALTER TABLE agent_sessions
ADD CONSTRAINT agent_sessions_session_type_check
CHECK (session_type IN ('check-in', 'discovery', 'quick-tip', 'update', 'strategy', 'crisis', 'coaching'));

-- Update comment to include check-in
COMMENT ON COLUMN agent_sessions.session_type IS 'Type of session: check-in (casual chat), discovery (onboarding), quick-tip (fast advice), update (progress check), strategy (deep dive), crisis (emergency), coaching (full GROW)';
