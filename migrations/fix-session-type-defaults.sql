-- Migration: Fix session_type defaults to align with interaction_mode
-- Date: 2025-10-28
-- Purpose: Make session_type default more logical - 'quick-tip' for check-ins, 'coaching' for coaching
--
-- ISSUE:
-- Currently, session_type defaults to 'coaching' but interaction_mode defaults to 'check-in'
-- This creates confusion in the admin UI where check-in sessions appear labeled as "coaching"
-- 94% of sessions are check-ins, but they all say session_type='coaching' in the database
--
-- FIX:
-- Change default to 'quick-tip' (better represents casual check-in conversations)
-- Update existing check-in sessions to have session_type='quick-tip' for consistency

-- Step 1: Change the default value for future sessions
ALTER TABLE agent_sessions
ALTER COLUMN session_type SET DEFAULT 'quick-tip';

-- Step 2: Update existing check-in sessions to have correct session_type
-- (Only update sessions where interaction_mode='check-in' but session_type='coaching')
UPDATE agent_sessions
SET session_type = 'quick-tip'
WHERE interaction_mode = 'check-in'
  AND session_type = 'coaching';

-- Step 3: Add a helpful comment explaining the alignment
COMMENT ON COLUMN agent_sessions.session_type IS
  'Type of session: discovery (onboarding), quick-tip (fast advice/check-in), update (progress check), strategy (deep dive), crisis (emergency), coaching (full GROW). For most check-in sessions, use quick-tip.';

-- Migration Notes:
--
-- RATIONALE:
-- - Check-ins are casual, supportive conversations (5-15 mins) → best represented as 'quick-tip'
-- - Coaching sessions are structured GROW model (30-50 mins) → remain 'coaching'
-- - This alignment makes the admin UI clearer and database queries more intuitive
--
-- AFFECTED SESSIONS:
-- - Approximately 33 sessions will be updated from session_type='coaching' to 'quick-tip'
-- - These are sessions where interaction_mode='check-in' (the correct field)
-- - No data loss, purely a consistency fix
--
-- BACKWARD COMPATIBILITY:
-- - All code uses interaction_mode to determine behavior (not session_type)
-- - session_type is mostly metadata for admin UI and analytics
-- - This change only affects display labels, not agent behavior
