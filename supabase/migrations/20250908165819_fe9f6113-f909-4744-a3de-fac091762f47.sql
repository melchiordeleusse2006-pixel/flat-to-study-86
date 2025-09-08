-- The issue seems to be that we're still getting infinite recursion
-- Let's disable RLS temporarily and then re-enable with simpler policies

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_agency_after_messaging" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create the most basic policies that cannot cause recursion
CREATE POLICY "user_profile_access" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow public viewing of agency profiles only (no complex joins)
CREATE POLICY "public_agency_visibility" 
ON public.profiles 
FOR SELECT 
USING (user_type = 'agency');