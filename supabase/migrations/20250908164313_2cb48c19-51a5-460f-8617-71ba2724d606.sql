-- Fix infinite recursion by creating a simple, secure policy
-- First drop all existing policies on profiles table to start clean
DROP POLICY IF EXISTS "Agency contact info for legitimate business only" ON public.profiles;
DROP POLICY IF EXISTS "Agency contact info visible to message senders" ON public.profiles;

-- Keep the existing user profile policy (don't recreate if it exists)
-- Just add the policy for agency contact visibility with a different approach

-- This policy allows agency contact info to be seen by users who have messaged them
CREATE POLICY "Agency contact visible after messaging" 
ON public.profiles 
FOR SELECT 
USING (
  -- Always allow users to see their own profile
  (auth.uid() = user_id)
  OR
  -- For agency profiles: allow access if user has messaged any of their listings
  (user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text]) 
   AND auth.uid() IS NOT NULL 
   AND id IN (
     SELECT DISTINCT l.agency_id 
     FROM listings l 
     JOIN messages m ON l.id = m.listing_id 
     WHERE m.sender_id = auth.uid()
   ))
);