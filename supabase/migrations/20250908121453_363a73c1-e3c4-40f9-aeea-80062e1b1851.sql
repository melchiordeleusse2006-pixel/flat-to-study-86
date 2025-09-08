-- First, create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_has_sent_messages_to_any_listing()
RETURNS TABLE(listing_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT DISTINCT m.listing_id
  FROM messages m
  WHERE m.sender_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile_type()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT p.user_type
  FROM profiles p
  WHERE p.user_id = auth.uid();
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view agency replies in their conversation" ON public.messages;
DROP POLICY IF EXISTS "Agencies can view messages for their listings" ON public.messages;
DROP POLICY IF EXISTS "Agencies can update messages for their listings" ON public.messages;
DROP POLICY IF EXISTS "Agencies can send replies to their listings" ON public.messages;

-- Recreate policies using security definer functions
CREATE POLICY "Users can view agency replies in their conversation" 
ON public.messages 
FOR SELECT 
USING (
  sender_id <> auth.uid() 
  AND listing_id IN (SELECT listing_id FROM public.user_has_sent_messages_to_any_listing())
);

CREATE POLICY "Agencies can view messages for their listings" 
ON public.messages 
FOR SELECT 
USING (
  public.get_user_profile_type() = 'agency'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = messages.agency_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Agencies can update messages for their listings" 
ON public.messages 
FOR UPDATE 
USING (
  public.get_user_profile_type() = 'agency'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = messages.agency_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Agencies can send replies to their listings" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND public.get_user_profile_type() = 'agency'
  AND EXISTS (
    SELECT 1 FROM listings l
    JOIN profiles p ON l.agency_id = p.id
    WHERE l.id = messages.listing_id 
    AND p.user_id = auth.uid()
  )
);