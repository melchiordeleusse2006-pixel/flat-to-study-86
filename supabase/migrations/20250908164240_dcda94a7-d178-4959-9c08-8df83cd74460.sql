-- Fix infinite recursion in profiles RLS policy
-- First, create a security definer function to get user profile type
CREATE OR REPLACE FUNCTION public.get_user_profile_type()
RETURNS TEXT AS $$
  SELECT user_type FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create a function to check if user has sent messages to any listing
CREATE OR REPLACE FUNCTION public.user_has_sent_messages_to_any_listing()
RETURNS TABLE(listing_id UUID) AS $$
  SELECT DISTINCT m.listing_id 
  FROM public.messages m 
  WHERE m.sender_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Agency contact info for legitimate business only" ON public.profiles;

-- Recreate the policy without referencing profiles table directly
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