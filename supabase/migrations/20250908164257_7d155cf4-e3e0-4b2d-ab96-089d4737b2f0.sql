-- Fix infinite recursion in profiles RLS policy by using security definer functions
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Agency contact info for legitimate business only" ON public.profiles;

-- Create a completely new policy structure without self-reference
-- Policy for agencies to see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for agencies to be visible to users who have messaged them
CREATE POLICY "Agency contact info visible to message senders" 
ON public.profiles 
FOR SELECT 
USING (
  (user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text])) 
  AND (listing_id IN (SELECT listing_id FROM user_has_sent_messages_to_any_listing()))
  AND EXISTS (
    SELECT 1 FROM listings l 
    WHERE l.agency_id = profiles.id
    AND l.id IN (SELECT listing_id FROM user_has_sent_messages_to_any_listing())
  )
);