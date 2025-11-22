-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  feedback_type TEXT NOT NULL, -- e.g., 'bug', 'feature', 'contact'
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL -- e.g., 'new', 'seen', 'archived'
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own feedback
CREATE POLICY "Users can submit feedback" ON public.feedback
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert feedback if user_id is null
-- This requires a different approach, perhaps a dedicated API key or open endpoint.
-- For now, we will only allow authenticated users to submit feedback.

-- Allow admins to access all feedback
CREATE POLICY "Admins can manage all feedback" ON public.feedback
FOR ALL USING (is_admin());
