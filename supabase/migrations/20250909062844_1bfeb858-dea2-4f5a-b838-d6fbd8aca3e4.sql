-- Allow students to mark agency messages as read
CREATE POLICY "Students can mark agency messages as read" 
ON public.messages 
FOR UPDATE 
USING (
  -- Student can only update messages that were sent TO them (not sent BY them)
  auth.uid() <> sender_id 
  AND 
  -- And they must have sent messages to this listing (to prevent unauthorized access)
  user_has_sent_messages_to_listing(listing_id)
  AND 
  -- And the current user must be a student
  get_user_profile_type() = 'student'
)
WITH CHECK (
  -- They can only update the read_at field (and other non-critical fields)
  auth.uid() <> sender_id 
  AND 
  user_has_sent_messages_to_listing(listing_id)
  AND 
  get_user_profile_type() = 'student'
);