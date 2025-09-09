-- Add a conversation_id field to messages to help with conversation isolation
ALTER TABLE public.messages 
ADD COLUMN conversation_id TEXT;

-- Create a function to generate conversation IDs
CREATE OR REPLACE FUNCTION public.generate_conversation_id(p_listing_id UUID, p_student_id UUID, p_agency_id UUID)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CONCAT('listing-', p_listing_id::text, '-student-', p_student_id::text, '-agency-', p_agency_id::text);
$$;

-- Update existing messages with conversation IDs
UPDATE public.messages 
SET conversation_id = generate_conversation_id(listing_id, sender_id, agency_id)
WHERE conversation_id IS NULL AND sender_id IN (
  SELECT user_id FROM profiles WHERE user_type = 'student'
);

-- For agency messages, we need to find which student they were responding to
-- This is more complex, so let's handle it differently in the app