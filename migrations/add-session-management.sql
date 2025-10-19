-- Migration: Add session management fields (favorite, archive, soft delete)
-- Created: 2025-10-19
-- Purpose: Enable users to favorite, archive, and soft-delete sessions

-- Add session management columns to agent_sessions table
ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN agent_sessions.is_favorite IS 'Whether user has marked this session as a favorite for quick access';
COMMENT ON COLUMN agent_sessions.is_archived IS 'Whether user has archived this session (hidden from main view but not deleted)';
COMMENT ON COLUMN agent_sessions.deleted_at IS 'Soft delete timestamp - when user deleted this session (NULL = not deleted)';

-- Create index for filtering favorited sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_favorite
ON agent_sessions(user_id, is_favorite)
WHERE is_favorite = true AND deleted_at IS NULL;

-- Create index for filtering archived sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_archived
ON agent_sessions(user_id, is_archived)
WHERE is_archived = true AND deleted_at IS NULL;

-- Create index for filtering active (non-archived, non-deleted) sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_active
ON agent_sessions(user_id, started_at DESC)
WHERE is_archived = false AND deleted_at IS NULL;

-- Update existing sessions to have default values
UPDATE agent_sessions
SET
  is_favorite = COALESCE(is_favorite, false),
  is_archived = COALESCE(is_archived, false)
WHERE is_favorite IS NULL OR is_archived IS NULL;

-- Verification query
-- SELECT COUNT(*) as total_sessions,
--        SUM(CASE WHEN is_favorite THEN 1 ELSE 0 END) as favorited,
--        SUM(CASE WHEN is_archived THEN 1 ELSE 0 END) as archived,
--        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) as deleted
-- FROM agent_sessions;
