-- Fix the security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION public.user_has_sent_messages_to_listing(p_listing_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.messages 
    WHERE listing_id = p_listing_id 
    AND sender_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;