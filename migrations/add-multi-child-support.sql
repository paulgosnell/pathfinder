-- Migration: Add Multi-Child Profile Support
-- Purpose: Enable parents to create separate profiles for each child
-- Date: 2025-10-19
-- CRITICAL FIX: Current system only supports ONE child per parent - this breaks multi-child families

-- ============================================================================
-- STEP 1: Create child_profiles table (separate from user_profiles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS child_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Child Identity (CRITICAL - child_name was missing from original schema!)
    child_name TEXT NOT NULL,
    nickname TEXT,
    child_age INTEGER,
    child_age_range TEXT,
    date_of_birth DATE,

    -- ADHD Diagnosis Information
    diagnosis_status TEXT CHECK (diagnosis_status IN ('diagnosed', 'suspected', 'exploring', 'not-adhd')),
    diagnosis_details TEXT,
    diagnosed_date DATE,
    diagnosed_by TEXT,
    adhd_subtype TEXT, -- inattentive, hyperactive, combined
    comorbidities TEXT[],

    -- Challenges & Behaviors (Per Child)
    main_challenges TEXT[] DEFAULT '{}',
    common_triggers TEXT[] DEFAULT '{}',
    behavioral_patterns JSONB DEFAULT '{}',
    emotional_regulation_notes TEXT,

    -- School Information (Per Child)
    school_name TEXT,
    school_type TEXT, -- public, private, charter, homeschool
    grade_level TEXT,
    has_iep BOOLEAN DEFAULT false,
    has_504_plan BOOLEAN DEFAULT false,
    school_support_details TEXT,
    teacher_relationship_notes TEXT,
    academic_strengths TEXT[],
    academic_struggles TEXT[],

    -- Medical & Treatment (Per Child)
    medication_status TEXT,
    current_medications JSONB DEFAULT '[]', -- [{name, dosage, started_date, effectiveness}]
    medication_notes TEXT,
    therapy_status TEXT,
    current_therapies JSONB DEFAULT '[]', -- [{type, provider, frequency, started_date}]
    therapy_notes TEXT,

    -- Strategy Tracking (Per Child)
    tried_solutions TEXT[] DEFAULT '{}',
    successful_strategies TEXT[] DEFAULT '{}',
    failed_strategies TEXT[] DEFAULT '{}',
    strategy_notes JSONB DEFAULT '{}',

    -- Parent Notes & Observations
    strengths TEXT[],
    interests TEXT[],
    parent_observations TEXT,
    communication_style TEXT,

    -- Metadata
    is_primary BOOLEAN DEFAULT false,
    profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Add indexes for performance
-- ============================================================================

CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX idx_child_profiles_is_primary ON child_profiles(user_id, is_primary);
CREATE INDEX idx_child_profiles_child_name ON child_profiles(user_id, child_name);

-- ============================================================================
-- STEP 3: Enable RLS (Row Level Security)
-- ============================================================================

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own children's profiles
CREATE POLICY "Users can view own child profiles" ON child_profiles
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- STEP 4: Add child_id to agent_sessions (link sessions to specific child)
-- ============================================================================

ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL;

-- Add index for faster session lookups by child
CREATE INDEX IF NOT EXISTS idx_agent_sessions_child_id ON agent_sessions(child_id);

-- ============================================================================
-- STEP 5: Add trigger to update last_updated timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_child_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_child_profiles_last_updated
    BEFORE UPDATE ON child_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_child_profiles_updated_at();

-- ============================================================================
-- STEP 6: Migrate existing data from user_profiles to child_profiles
-- ============================================================================

-- Insert existing single-child data as child profiles
-- Note: child_name is NOT in user_profiles, so we'll use 'Child' as placeholder
INSERT INTO child_profiles (
    user_id,
    child_name,
    child_age_range,
    diagnosis_status,
    diagnosis_details,
    main_challenges,
    common_triggers,
    tried_solutions,
    successful_strategies,
    failed_strategies,
    school_context,
    medication_status,
    is_primary,
    profile_complete,
    created_at
)
SELECT
    user_id,
    'Child' AS child_name, -- Placeholder - parents can update this
    child_age_range,
    diagnosis_status,
    diagnosis_details,
    main_challenges,
    common_triggers,
    tried_solutions,
    successful_strategies,
    failed_strategies,
    school_context,
    medication_status,
    true AS is_primary, -- Mark as primary child
    discovery_completed AS profile_complete,
    created_at
FROM user_profiles
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM child_profiles cp WHERE cp.user_id = user_profiles.user_id
  );

-- ============================================================================
-- STEP 7: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE child_profiles IS 'Individual child profiles - supports multiple children per parent';
COMMENT ON COLUMN child_profiles.child_name IS 'Child''s first name or nickname (REQUIRED)';
COMMENT ON COLUMN child_profiles.is_primary IS 'Primary/default child for quick access (if parent has multiple children)';
COMMENT ON COLUMN child_profiles.diagnosis_status IS 'ADHD diagnosis status: diagnosed, suspected, exploring, not-adhd';
COMMENT ON COLUMN child_profiles.main_challenges IS 'Top 2-5 challenges parent is facing with this child';
COMMENT ON COLUMN child_profiles.tried_solutions IS 'Strategies that have been attempted';
COMMENT ON COLUMN child_profiles.successful_strategies IS 'Strategies that worked well';
COMMENT ON COLUMN child_profiles.failed_strategies IS 'Strategies that did not work';

COMMENT ON COLUMN agent_sessions.child_id IS 'Which child this session is about (NULL if general family session)';

-- ============================================================================
-- STEP 8: Keep user_profiles for parent-level data only
-- ============================================================================

-- NOTE: We are NOT dropping user_profiles table
-- It now stores PARENT information (parent_name, relationship_to_child, etc.)
-- and FAMILY-LEVEL context (family_context, support_system_strength)
--
-- Child-specific data has been migrated to child_profiles
-- Going forward:
--   - user_profiles = parent info + family context
--   - child_profiles = individual child data (can be many per parent)
--   - agent_sessions.child_id = which child the session is about

-- Add comment to clarify user_profiles purpose
COMMENT ON TABLE user_profiles IS 'Parent-level profile and family context (NOT child-specific data - see child_profiles)';

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify success)
-- ============================================================================

-- Count children per user
-- SELECT user_id, COUNT(*) as num_children FROM child_profiles GROUP BY user_id;

-- See all children for a specific user
-- SELECT child_name, diagnosis_status, is_primary FROM child_profiles WHERE user_id = 'YOUR_USER_ID';

-- Check sessions linked to children
-- SELECT s.id, cp.child_name, s.session_type FROM agent_sessions s
-- LEFT JOIN child_profiles cp ON s.child_id = cp.id
-- WHERE s.user_id = 'YOUR_USER_ID';
