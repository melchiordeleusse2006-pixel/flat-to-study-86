-- Drop the problematic policy and function
DROP POLICY IF EXISTS "Students can view agency replies to their messages" ON messages;
DROP FUNCTION IF EXISTS public.user_has_messaged_listing(uuid, uuid);

-- Create a simple policy using the existing function that works
CREATE POLICY "Students can view agency replies to their messages" 
ON messages 
FOR SELECT 
TO authenticated
USING (
  -- Allow viewing agency replies if the student has messaged this listing
  -- and this message is from an agency user
  sender_id != auth.uid() 
  AND public.user_has_sent_messages_to_listing(listing_id)
  AND get_user_profile_type() = 'student'
  AND EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.user_id = messages.sender_id 
      AND p.user_type = 'agency'
  )
);