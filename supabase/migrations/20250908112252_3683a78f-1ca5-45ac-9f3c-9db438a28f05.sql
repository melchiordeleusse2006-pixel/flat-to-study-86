-- Drop the problematic policy that allows users to see all agency replies to listings they've messaged
DROP POLICY "Users can view agency replies to their conversations" ON public.messages;

-- Create a more specific policy that only allows users to see agency replies 
-- that are part of their specific conversation thread
CREATE POLICY "Users can view agency replies in their conversation" 
ON public.messages 
FOR SELECT 
USING (
  sender_id <> auth.uid() 
  AND EXISTS (
    -- Check if there's a conversation thread between this user and the agency
    -- A conversation thread exists if there are messages from both the user and the agency
    -- on the same listing in sequence
    SELECT 1 FROM messages user_msg
    WHERE user_msg.listing_id = messages.listing_id
    AND user_msg.sender_id = auth.uid()
    AND user_msg.created_at <= messages.created_at
    AND NOT EXISTS (
      -- No other user messages on this listing between user_msg and this agency reply
      SELECT 1 FROM messages other_msg
      WHERE other_msg.listing_id = messages.listing_id
      AND other_msg.sender_id != auth.uid()
      AND other_msg.sender_id != messages.sender_id
      AND other_msg.created_at > user_msg.created_at
      AND other_msg.created_at <= messages.created_at
    )
  )
);