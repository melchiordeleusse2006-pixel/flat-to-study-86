-- Update existing messages to have conversation_id for testing
-- For student messages, set conversation_id using the generate_conversation_id function
UPDATE public.messages 
SET conversation_id = generate_conversation_id(listing_id, sender_id)
WHERE conversation_id IS NULL 
AND sender_id IN (
  SELECT user_id FROM profiles WHERE user_type = 'student'
);

-- For agency messages, we need a more complex approach
-- We'll set a default conversation_id that can be updated by the app logic
UPDATE public.messages 
SET conversation_id = CONCAT('listing-', listing_id::text, '-agency-reply')
WHERE conversation_id IS NULL 
AND sender_id IN (
  SELECT user_id FROM profiles WHERE user_type = 'agency'
);