-- Add session type system
-- Created: October 14, 2025
-- Purpose: Replace time-based sessions with purpose-based session types

-- Add session_type column to agent_sessions
ALTER TABLE agent_sessions
ADD COLUMN session_type TEXT DEFAULT 'coaching'
CHECK (session_type IN ('discovery', 'quick-tip', 'update', 'strategy', 'crisis', 'coaching'));

-- Add discovery completion tracking to user_profiles
ALTER TABLE user_profiles
ADD COLUMN discovery_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN discovery_completed_at TIMESTAMPTZ;

-- Add discovery-specific profile fields
-- These will be populated during the initial discovery call
ALTER TABLE user_profiles
ADD COLUMN diagnosis_status TEXT,  -- e.g., 'diagnosed', 'in-process', 'suspected', 'not-diagnosed'
ADD COLUMN diagnosis_details TEXT,  -- Details about diagnosis (ADHD type, when diagnosed, etc.)
ADD COLUMN main_challenges TEXT[],  -- Primary challenges parent is facing
ADD COLUMN family_context TEXT,     -- Family situation (siblings, support system, etc.)
ADD COLUMN school_context TEXT,     -- School situation and challenges
ADD COLUMN medication_status TEXT,  -- On medication, tried medication, no medication, etc.
ADD COLUMN support_network TEXT[];  -- Other support they have (therapist, school support, etc.)

-- Create index for session_type queries
CREATE INDEX idx_agent_sessions_session_type ON agent_sessions(session_type);

-- Create index for discovery completion queries
CREATE INDEX idx_user_profiles_discovery ON user_profiles(discovery_completed) WHERE discovery_completed = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN agent_sessions.session_type IS 'Type of session: discovery (onboarding), quick-tip (fast advice), update (progress check), strategy (deep dive), crisis (emergency), coaching (full GROW)';
COMMENT ON COLUMN user_profiles.discovery_completed IS 'Whether user has completed initial discovery call';
COMMENT ON COLUMN user_profiles.diagnosis_status IS 'ADHD diagnosis status: diagnosed, in-process, suspected, not-diagnosed';
COMMENT ON COLUMN user_profiles.main_challenges IS 'Primary challenges identified during discovery';
COMMENT ON COLUMN user_profiles.family_context IS 'Family situation and support system';
COMMENT ON COLUMN user_profiles.school_context IS 'School situation and challenges';
COMMENT ON COLUMN user_profiles.medication_status IS 'Medication status and history';
COMMENT ON COLUMN user_profiles.support_network IS 'Other professional support (therapist, school counselor, etc.)';

-- Update existing sessions to have default session_type
UPDATE agent_sessions SET session_type = 'coaching' WHERE session_type IS NULL;
