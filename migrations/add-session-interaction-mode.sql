-- Migration: Add session interaction mode (check-in vs coaching)
-- Date: 2025-01-16
-- Purpose: Distinguish between casual check-in conversations and structured coaching sessions

-- Add interaction_mode column to track whether this is a casual check-in or structured coaching
ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS interaction_mode TEXT DEFAULT 'check-in'
CHECK (interaction_mode IN ('check-in', 'coaching'));

COMMENT ON COLUMN agent_sessions.interaction_mode IS
  'Session interaction type: check-in (casual conversation, no GROW structure) or coaching (full GROW model with goal-setting)';

-- Add status column to track session lifecycle
ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'complete', 'scheduled'));

COMMENT ON COLUMN agent_sessions.status IS
  'Session status: active (ongoing), complete (finished), scheduled (booked for later)';

-- Add scheduled_for column for bookable coaching sessions
ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ NULL;

COMMENT ON COLUMN agent_sessions.scheduled_for IS
  'For scheduled coaching sessions - when the session is booked to start';

-- Create index for faster queries on active sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status_user
ON agent_sessions(user_id, status, started_at DESC);

-- Migration Notes:
--
-- DEFAULT BEHAVIOR:
-- - All new sessions default to 'check-in' mode (casual, supportive conversations)
-- - Users can explicitly book 'coaching' sessions via UI
--
-- INTERACTION MODES:
-- - check-in: Casual conversation, no goal required, supportive/validating, 5-15 mins typical
-- - coaching: Structured GROW model, goal-driven, deep exploration, 30-50 mins typical
--
-- SESSION STATUS:
-- - active: User can continue chatting in this session
-- - complete: Session finished, archived (read-only in history)
-- - scheduled: Coaching session booked for future date/time
--
-- MIGRATION STRATEGY:
-- - Existing sessions keep default 'check-in' mode
-- - Small user base (~5-7 users) - explain change in app
-- - No data loss, backward compatible
