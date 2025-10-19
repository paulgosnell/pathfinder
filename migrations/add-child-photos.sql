-- Migration: Add child photo storage to child_profiles
-- Purpose: Allow parents to upload photos of their children for personalization
-- Date: 2025-10-19

-- Add photo URL column to child_profiles
ALTER TABLE child_profiles
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_uploaded_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN child_profiles.photo_url IS 'URL to child photo (Supabase Storage or external)';
COMMENT ON COLUMN child_profiles.photo_uploaded_at IS 'When photo was last updated';

-- Optionally add parent photo to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS parent_photo_url TEXT,
ADD COLUMN IF NOT EXISTS parent_photo_uploaded_at TIMESTAMPTZ;

COMMENT ON COLUMN user_profiles.parent_photo_url IS 'URL to parent photo';
COMMENT ON COLUMN user_profiles.parent_photo_uploaded_at IS 'When parent photo was last updated';
