-- Add mode column to agent_sessions table to track chat vs voice conversations
-- Run this in Supabase SQL Editor

ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'chat'
CHECK (mode IN ('chat', 'voice'));

-- Add index for filtering by mode
CREATE INDEX IF NOT EXISTS idx_agent_sessions_mode ON agent_sessions(mode);

-- Add comment for documentation
COMMENT ON COLUMN agent_sessions.mode IS 'Conversation mode: chat (text) or voice (audio transcripts)';
