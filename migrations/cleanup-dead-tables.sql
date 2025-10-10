-- Migration: Cleanup Dead Tables and Resolve Schema Duplication
-- Purpose: Remove unused monitoring tables and consolidate user profile schema
-- Date: 2025-10-08
-- IMPORTANT: Review this migration carefully before applying to production

-- ============================================================
-- PART 1: Drop Dead Code Tables (Never Used)
-- ============================================================

-- These tables were created for monitoring/analytics but never implemented
-- Code interfaces exist but have zero callsites in production

DROP TABLE IF EXISTS agent_decisions CASCADE;
-- Purpose: Log AI decision-making for analysis
-- Status: Code exists in lib/monitoring/agent-monitor.ts but never called
-- Rows: 0

DROP TABLE IF EXISTS strategy_usage CASCADE;
-- Purpose: Track which ADHD strategies parents try
-- Status: Type definitions exist but no insert/update logic
-- Rows: 0

DROP TABLE IF EXISTS agent_errors CASCADE;
-- Purpose: Log AI agent errors for debugging
-- Status: logError() method exists but never called in try/catch blocks
-- Rows: 0

DROP TABLE IF EXISTS agent_tool_usage CASCADE;
-- Purpose: Track which AI tools are used
-- Status: saveToolUsage() method exists but never called by agent tools
-- Rows: 0

DROP TABLE IF EXISTS agent_daily_stats CASCADE;
-- Purpose: Aggregate daily usage metrics
-- Status: Has broken upsert logic, never successfully populated
-- Rows: 0

-- ============================================================
-- PART 2: Resolve users/user_profiles Duplication
-- ============================================================

-- Migration 03-user-profiles-discovery.sql created both:
-- 1. Columns in users table: child_age_range, child_triggers, etc.
-- 2. Separate user_profiles table with overlapping fields
--
-- Decision: Keep user_profiles as single source of truth (better structure)
-- Action: Remove duplicate columns from users table

-- First, migrate any data from users columns to user_profiles
-- (This is a safety check - in practice these columns may be unused)

INSERT INTO user_profiles (user_id, child_age_range, common_triggers, behavioral_patterns, tried_solutions, successful_strategies)
SELECT
    id as user_id,
    child_age_range,
    CASE
        WHEN child_triggers IS NOT NULL AND jsonb_typeof(child_triggers) = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(child_triggers))
        ELSE NULL
    END as common_triggers,
    child_patterns as behavioral_patterns,
    CASE
        WHEN tried_solutions IS NOT NULL AND jsonb_typeof(tried_solutions) = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(tried_solutions))
        ELSE NULL
    END as tried_solutions,
    CASE
        WHEN successful_strategies IS NOT NULL AND jsonb_typeof(successful_strategies) = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(successful_strategies))
        ELSE NULL
    END as successful_strategies
FROM users
WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
AND (
    child_age_range IS NOT NULL
    OR child_triggers IS NOT NULL
    OR child_patterns IS NOT NULL
    OR tried_solutions IS NOT NULL
    OR successful_strategies IS NOT NULL
);

-- Now drop the duplicate columns from users table
ALTER TABLE users
    DROP COLUMN IF EXISTS child_age_range CASCADE,
    DROP COLUMN IF EXISTS child_triggers CASCADE,
    DROP COLUMN IF EXISTS child_patterns CASCADE,
    DROP COLUMN IF EXISTS parent_stress_patterns CASCADE,
    DROP COLUMN IF EXISTS home_environment CASCADE,
    DROP COLUMN IF EXISTS tried_solutions CASCADE,
    DROP COLUMN IF EXISTS successful_strategies CASCADE,
    DROP COLUMN IF EXISTS parent_preferences CASCADE;

-- ============================================================
-- PART 3: Cleanup Discovery Phase Columns (Old System)
-- ============================================================

-- These columns were for the old "3-4 question discovery" system
-- Replaced by full GROW model coaching (50-minute sessions)

ALTER TABLE agent_sessions
    DROP COLUMN IF EXISTS discovery_phase_complete CASCADE,
    DROP COLUMN IF EXISTS questions_asked CASCADE,
    DROP COLUMN IF EXISTS context_gathered CASCADE;

-- Keep current_challenge and parent_stress_level - still used in GROW model

-- ============================================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================================

-- Uncomment these to verify cleanup:
-- SELECT COUNT(*) FROM user_profiles; -- Should have 3+ rows
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public';
