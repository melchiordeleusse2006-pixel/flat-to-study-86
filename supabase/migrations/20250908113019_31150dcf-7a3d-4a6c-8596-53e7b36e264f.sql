-- Fix the infinite recursion issue in the messages RLS policy
-- Drop the problematic policy that's causing recursion
DROP POLICY "Users can view agency replies in their conversation" ON public.messages;

-- Create a simpler, non-recursive policy for users to view agency replies
-- This policy allows users to see replies from agencies to listings where they have sent messages
CREATE POLICY "Users can view agency replies in their conversation" 
ON public.messages 
FOR SELECT 
USING (
  -- User can see messages they didn't send (agency replies)
  sender_id != auth.uid() 
  AND 
  -- Only if they have sent a message to the same listing
  listing_id IN (
    SELECT DISTINCT listing_id 
    FROM messages 
    WHERE sender_id = auth.uid()
  )
);