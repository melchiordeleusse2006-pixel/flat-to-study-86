-- Drop the existing policy first
DROP POLICY IF EXISTS "Students can view agency replies to their messages" ON messages;

-- Create a more restrictive policy for students to view agency replies
-- Students can only view agency replies that are specifically in response to their own conversation
CREATE POLICY "Students can view agency replies to their messages" 
ON messages 
FOR SELECT 
TO authenticated
USING (
  -- Allow viewing if this is an agency reply (sender_id != auth.uid())
  -- and the current user has sent a message to this exact listing
  -- and this reply is from the agency that owns the listing
  sender_id != auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM messages student_msg 
    WHERE student_msg.sender_id = auth.uid() 
      AND student_msg.listing_id = messages.listing_id
  )
  -- Ensure this message is from the agency that owns the listing
  AND EXISTS (
    SELECT 1 
    FROM listings l
    JOIN profiles p ON l.agency_id = p.id
    WHERE l.id = messages.listing_id 
      AND p.user_id = messages.sender_id
  )
);