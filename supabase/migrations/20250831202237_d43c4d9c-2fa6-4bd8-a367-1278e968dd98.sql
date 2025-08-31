-- Allow students to also see agency replies to their messages
-- This updates the existing policy to include agency messages for listings where the student has sent messages
DROP POLICY "Users can view their own sent messages" ON messages;

CREATE POLICY "Users can view their conversations" ON messages
FOR SELECT 
USING (
  -- Users can see their own sent messages
  sender_id = auth.uid() 
  OR 
  -- Students can see agency replies for listings where they have sent messages
  (
    EXISTS (
      SELECT 1 FROM messages student_messages 
      WHERE student_messages.listing_id = messages.listing_id 
      AND student_messages.sender_id = auth.uid()
    )
  )
);