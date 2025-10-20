/**
 * Migration: Discovery Progress Tracking
 *
 * Adds fields to track partial discovery completion:
 * - discovery_progress: 0-100 percentage of profile completion
 * - discovery_session_id: Links to the active/most recent discovery session
 *
 * This allows users to pause discovery and resume later, showing them
 * what information is still needed.
 *
 * Run this migration in Supabase SQL Editor.
 */

-- Add discovery progress tracking to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS discovery_progress INTEGER DEFAULT 0 CHECK (discovery_progress >= 0 AND discovery_progress <= 100),
ADD COLUMN IF NOT EXISTS discovery_session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.discovery_progress IS 'Percentage (0-100) of discovery profile completion. 100 = discovery_completed = true';
COMMENT ON COLUMN user_profiles.discovery_session_id IS 'Links to the most recent discovery session for resumption';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_discovery_session
ON user_profiles(discovery_session_id);

-- Update existing records: If discovery_completed = true, set progress to 100
UPDATE user_profiles
SET discovery_progress = 100
WHERE discovery_completed = true AND discovery_progress = 0;

-- Migration verification query (run after migration)
-- SELECT
--   user_id,
--   discovery_completed,
--   discovery_progress,
--   discovery_session_id,
--   discovery_completed_at
-- FROM user_profiles;
