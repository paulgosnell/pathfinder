-- Migration: Add Time Tracking to Agent Sessions
-- Description: Adds time budget and elapsed time tracking to enable time-adaptive coaching
-- Created: 2025-10-13

-- Add time tracking columns to agent_sessions table
ALTER TABLE agent_sessions
ADD COLUMN time_budget_minutes INTEGER DEFAULT 50,
ADD COLUMN time_elapsed_minutes INTEGER DEFAULT 0,
ADD COLUMN can_extend_time BOOLEAN DEFAULT true,
ADD COLUMN time_extension_offered BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN agent_sessions.time_budget_minutes IS 'Parent''s available time for this session (5, 15, 30, or 50 minutes)';
COMMENT ON COLUMN agent_sessions.time_elapsed_minutes IS 'Estimated time elapsed in session (updated periodically during conversation)';
COMMENT ON COLUMN agent_sessions.can_extend_time IS 'Whether parent can extend session time if needed';
COMMENT ON COLUMN agent_sessions.time_extension_offered IS 'Whether agent has already offered time extension (prevent repeated asks)';

-- Create index for querying sessions by time budget (analytics purposes)
CREATE INDEX idx_agent_sessions_time_budget ON agent_sessions(time_budget_minutes);

-- Update existing sessions to have default 50-minute budget (legacy sessions assumed full time)
UPDATE agent_sessions
SET time_budget_minutes = 50,
    time_elapsed_minutes = LEAST(50, EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at)) / 60)::INTEGER
WHERE time_budget_minutes IS NULL;
