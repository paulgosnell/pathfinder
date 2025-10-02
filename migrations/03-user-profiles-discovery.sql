-- Migration: Add User Profile and Discovery Phase Tracking
-- Purpose: Enable conversational discovery and user context building

-- Add user profile columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS child_age_range TEXT,
ADD COLUMN IF NOT EXISTS child_triggers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS child_patterns JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS parent_stress_patterns JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS home_environment JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tried_solutions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS successful_strategies JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS parent_preferences JSONB DEFAULT '{}';

-- Add discovery phase tracking to agent_sessions table
ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS discovery_phase_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS questions_asked INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS context_gathered JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS current_challenge TEXT,
ADD COLUMN IF NOT EXISTS parent_stress_level TEXT;

-- Create user_profile table for structured profile data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    child_age_range TEXT,
    common_triggers TEXT[],
    behavioral_patterns JSONB DEFAULT '{}',
    parent_stress_level TEXT DEFAULT 'unknown',
    home_constraints TEXT[],
    tried_solutions TEXT[],
    successful_strategies TEXT[],
    failed_strategies TEXT[],
    communication_preferences JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policy for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR ALL USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create trigger for updating last_updated
CREATE TRIGGER update_user_profiles_last_updated 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE user_profiles IS 'Stores learned context about users to enable personalized, context-aware coaching';
COMMENT ON COLUMN user_profiles.child_age_range IS 'Age range of child (e.g., "5-8", "9-12", "13-17")';
COMMENT ON COLUMN user_profiles.common_triggers IS 'Array of identified triggers for child behaviors';
COMMENT ON COLUMN user_profiles.behavioral_patterns IS 'JSON object storing observed patterns (e.g., {"morning_struggles": true, "homework_resistance": true})';
COMMENT ON COLUMN user_profiles.tried_solutions IS 'Array of strategy IDs that have been attempted';
COMMENT ON COLUMN user_profiles.successful_strategies IS 'Array of strategy IDs that worked well';
COMMENT ON COLUMN user_profiles.failed_strategies IS 'Array of strategy IDs that did not work';

