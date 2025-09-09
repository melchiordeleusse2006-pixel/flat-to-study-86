-- First, let's add the updated_at column to messages table and then add conversation_id
ALTER TABLE public.messages 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add a conversation_id field to messages to help with conversation isolation
ALTER TABLE public.messages 
ADD COLUMN conversation_id TEXT;

-- Create a function to generate conversation IDs based on listing and student
CREATE OR REPLACE FUNCTION public.generate_conversation_id(p_listing_id UUID, p_student_id UUID)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CONCAT('listing-', p_listing_id::text, '-student-', p_student_id::text);
$$;