-- Migration: Add waitlist signups table
-- Description: Store email signups for launch notifications and early testers
-- Created: 2025-10-05

-- Create waitlist_signups table
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  early_tester BOOLEAN DEFAULT false NOT NULL,
  signup_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  contacted BOOLEAN DEFAULT false NOT NULL,
  contacted_date TIMESTAMPTZ,
  source TEXT DEFAULT 'landing_page',
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_email ON public.waitlist_signups(email);

-- Add index on early_tester for filtering
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_early_tester ON public.waitlist_signups(early_tester);

-- Add index on signup_date for ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_signup_date ON public.waitlist_signups(signup_date DESC);

-- Enable Row Level Security
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (sign up)
CREATE POLICY "Anyone can sign up to waitlist"
  ON public.waitlist_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated users can view signups
CREATE POLICY "Authenticated users can view waitlist signups"
  ON public.waitlist_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update contacted status
CREATE POLICY "Authenticated users can update waitlist signups"
  ON public.waitlist_signups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_waitlist_signups_updated_at ON public.waitlist_signups;
CREATE TRIGGER set_waitlist_signups_updated_at
  BEFORE UPDATE ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_signups_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.waitlist_signups IS 'Stores email signups for product launch notifications and early testing program';
COMMENT ON COLUMN public.waitlist_signups.email IS 'User email address (unique)';
COMMENT ON COLUMN public.waitlist_signups.early_tester IS 'Whether user opted in to early testing program';
COMMENT ON COLUMN public.waitlist_signups.contacted IS 'Whether we have contacted this person';
COMMENT ON COLUMN public.waitlist_signups.source IS 'Where the signup came from (landing_page, referral, etc)';
COMMENT ON COLUMN public.waitlist_signups.metadata IS 'Additional metadata (utm params, browser info, etc)';
