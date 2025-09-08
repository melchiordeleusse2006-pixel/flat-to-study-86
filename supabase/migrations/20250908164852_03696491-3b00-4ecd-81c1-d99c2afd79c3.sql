-- Clean up all existing policies and create final working structure
-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_agency_after_messaging" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create the final, clean policy set
-- Users can manage their own profiles
CREATE POLICY "users_own_profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Agency visibility for business contacts (separate policy to avoid recursion)
CREATE POLICY "agency_business_visibility" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'agency' 
  AND EXISTS (
    SELECT 1 FROM messages m
    JOIN listings l ON l.id = m.listing_id
    WHERE l.agency_id = profiles.id
    AND m.sender_id = auth.uid()
  )
);