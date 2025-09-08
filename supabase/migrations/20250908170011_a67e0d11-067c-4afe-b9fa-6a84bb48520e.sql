-- Completely reset the profiles table policies 
SELECT 'Resetting RLS policies for profiles table' as status;

-- First disable RLS to clear everything
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL possible policy names that might exist
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, clean policies
CREATE POLICY "profiles_own_access" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow viewing all agency profiles (for displaying agency names)
CREATE POLICY "agencies_public_view" 
ON public.profiles 
FOR SELECT 
USING (user_type = 'agency');