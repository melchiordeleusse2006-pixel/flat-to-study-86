-- Drop the problematic policy that causes infinite recursion
DROP POLICY "Users can view their conversations" ON messages;

-- Create a security definer function to check if user has sent messages to a listing
CREATE OR REPLACE FUNCTION public.user_has_sent_messages_to_listing(p_listing_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.messages 
    WHERE listing_id = p_listing_id 
    AND sender_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view their own sent messages" ON messages
FOR SELECT 
USING (sender_id = auth.uid());

CREATE POLICY "Users can view agency replies to their conversations" ON messages
FOR SELECT 
USING (
  -- Allow viewing agency replies for listings where the user has sent messages
  sender_id != auth.uid() 
  AND public.user_has_sent_messages_to_listing(listing_id)
);