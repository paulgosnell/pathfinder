-- Transform from discovery-first to coaching-first approach
-- This migration replaces transactional discovery tracking with GROW model coaching state

-- Add coaching-focused columns to agent_sessions table
ALTER TABLE agent_sessions
  DROP COLUMN IF EXISTS discovery_phase_complete,
  DROP COLUMN IF EXISTS questions_asked,
  DROP COLUMN IF EXISTS context_gathered,
  ADD COLUMN IF NOT EXISTS current_phase TEXT DEFAULT 'goal',
  ADD COLUMN IF NOT EXISTS reality_exploration_depth INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS emotions_reflected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS exceptions_explored BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS strengths_identified TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS parent_generated_ideas TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ready_for_options BOOLEAN DEFAULT false;

-- Add check constraint for valid GROW model phases
ALTER TABLE agent_sessions
  DROP CONSTRAINT IF EXISTS valid_phase,
  ADD CONSTRAINT valid_phase CHECK (current_phase IN ('goal', 'reality', 'options', 'will', 'closing'));

-- Update existing sessions to start in goal phase
UPDATE agent_sessions
SET current_phase = 'goal',
    reality_exploration_depth = 0,
    emotions_reflected = false,
    exceptions_explored = false,
    strengths_identified = '{}',
    parent_generated_ideas = '{}',
    ready_for_options = false
WHERE current_phase IS NULL;
