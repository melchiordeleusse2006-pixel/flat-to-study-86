-- Completely restart the RLS policies with the simplest possible approach
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop everything
DROP POLICY IF EXISTS "user_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "public_agency_visibility" ON public.profiles;

-- Create a function to safely get current user profile without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create super simple policies
CREATE POLICY "profiles_own_data" 
ON public.profiles 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow everyone to see agency profiles (needed for listings)
CREATE POLICY "profiles_view_agencies" 
ON public.profiles 
FOR SELECT 
USING (user_type IN ('agency', 'AGENCY'));