-- Fix security issue: Restrict agency contact information access
-- Remove the overly permissive policy that allows anyone to see agency contact info
DROP POLICY IF EXISTS "Agency contact info visible only through published listings" ON public.profiles;

-- Create a more secure policy that only allows access to agency contact info for:
-- 1. The agency themselves
-- 2. Authenticated users who have sent messages to the agency's listings
CREATE POLICY "Agency contact info for legitimate business only" 
ON public.profiles 
FOR SELECT 
USING (
  (user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text])) 
  AND (
    -- Allow agency to see their own profile
    auth.uid() = user_id
    OR
    -- Allow authenticated users who have messaged this agency to see contact info
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM messages m
      JOIN listings l ON m.listing_id = l.id
      WHERE l.agency_id = profiles.id
      AND m.sender_id = auth.uid()
    ))
  )
);