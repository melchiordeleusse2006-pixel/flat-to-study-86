-- Fix infinite recursion by creating simple, non-recursive policies
-- Drop all problematic policies
DROP POLICY IF EXISTS "Agency contact info for legitimate business only" ON public.profiles;
DROP POLICY IF EXISTS "Agency contact info visible to message senders" ON public.profiles; 
DROP POLICY IF EXISTS "Agency contact visible after messaging" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create simple, secure policies for profiles
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a safe policy for agency visibility using EXISTS
CREATE POLICY "profiles_select_agency_after_messaging" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text]) 
  AND EXISTS (
    SELECT 1 FROM messages m
    JOIN listings l ON l.id = m.listing_id
    WHERE l.agency_id = profiles.id
    AND m.sender_id = auth.uid()
  )
);