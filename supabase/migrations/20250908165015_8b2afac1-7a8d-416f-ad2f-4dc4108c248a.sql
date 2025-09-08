-- Drop ALL policies including potentially existing ones
DROP POLICY IF EXISTS "users_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "agency_business_visibility" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_agency_after_messaging" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create simple, working policies
CREATE POLICY "profile_own_access" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agency_contact_visibility" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'agency' 
  AND auth.uid() IN (
    SELECT DISTINCT m.sender_id 
    FROM messages m
    JOIN listings l ON l.id = m.listing_id
    WHERE l.agency_id = profiles.id
  )
);