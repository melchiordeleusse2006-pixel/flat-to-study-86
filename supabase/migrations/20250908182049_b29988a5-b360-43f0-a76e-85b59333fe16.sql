-- Drop the problematic policy
DROP POLICY IF EXISTS "Students can view agency replies to their messages" ON messages;

-- Create a security definer function to check if user has messaged a listing
CREATE OR REPLACE FUNCTION public.user_has_messaged_listing(p_listing_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.messages 
    WHERE listing_id = p_listing_id 
    AND sender_id = p_user_id
  );
END;
$$;

-- Create a simple policy for students to view agency replies
CREATE POLICY "Students can view agency replies to their messages" 
ON messages 
FOR SELECT 
TO authenticated
USING (
  -- Allow viewing agency replies if the student has messaged this listing
  sender_id != auth.uid() 
  AND public.user_has_messaged_listing(listing_id, auth.uid())
  AND EXISTS (
    SELECT 1 
    FROM listings l
    JOIN profiles p ON l.agency_id = p.id
    WHERE l.id = messages.listing_id 
      AND p.user_id = messages.sender_id
  )
);