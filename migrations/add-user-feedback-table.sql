-- Migration: Add user feedback collection feature
-- Date: 2025-10-27
-- Description: Create user_feedback table for collecting app feedback with ratings and comments

-- Create user_feedback table for collecting app feedback
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.agent_sessions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  feedback_text TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  page_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment to table
COMMENT ON TABLE public.user_feedback IS 'User feedback submissions with ratings and comments for product improvement';

-- Add column comments
COMMENT ON COLUMN public.user_feedback.rating IS 'User rating from 1-10';
COMMENT ON COLUMN public.user_feedback.feedback_text IS 'User written feedback explaining their rating';
COMMENT ON COLUMN public.user_feedback.context IS 'Additional context (e.g., feature used, time spent, etc.)';
COMMENT ON COLUMN public.user_feedback.session_id IS 'Optional link to coaching session if feedback is session-specific';

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_submitted_at ON public.user_feedback(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON public.user_feedback(rating);

-- Enable Row Level Security
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Service role has full access to feedback (for admin dashboard)
CREATE POLICY "Service role has full access to feedback"
  ON public.user_feedback
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
