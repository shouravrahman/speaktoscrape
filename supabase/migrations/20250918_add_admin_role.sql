-- Add role column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;

-- Create a policy so users can read their own role
CREATE POLICY "Users can read their own role" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

-- Create a policy so admins can read any role
-- Note: This requires a way to check if the current user is an admin.
-- We can create a function for this.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now, a policy for admins
CREATE POLICY "Admins can view all user profiles" ON public.user_profiles
FOR SELECT USING (is_admin());

-- Update existing policies to be more restrictive if needed, or ensure this stacks correctly.
-- For now, we assume the existing policies for update/insert are sufficient.
