-- Migration: Add parent profile columns to user_profiles
-- Purpose: Store basic parent information for profile page

-- Add parent-specific profile columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS parent_name TEXT,
ADD COLUMN IF NOT EXISTS relationship_to_child TEXT,
ADD COLUMN IF NOT EXISTS parent_age_range TEXT,
ADD COLUMN IF NOT EXISTS support_system_strength TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update the last_updated trigger to also update updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the existing trigger
DROP TRIGGER IF EXISTS update_user_profiles_last_updated ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.parent_name IS 'Optional parent/guardian name for personalization';
COMMENT ON COLUMN user_profiles.relationship_to_child IS 'Relationship to child (e.g., Mother, Father, Guardian)';
COMMENT ON COLUMN user_profiles.parent_age_range IS 'Parent age range (e.g., 30-39, 40-49)';
COMMENT ON COLUMN user_profiles.support_system_strength IS 'Strength of parent support system (e.g., Strong, Moderate, Limited)';
