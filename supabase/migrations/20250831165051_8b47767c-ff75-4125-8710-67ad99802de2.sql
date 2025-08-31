-- Remove the problematic trigger that uses net extension
DROP TRIGGER IF EXISTS trigger_notify_agency_on_new_message ON public.messages;

-- Drop the function that uses the net extension
DROP FUNCTION IF EXISTS public.notify_agency_on_new_message();

-- Create a simpler trigger that just logs the message creation
-- The email notification will be handled by the edge function call from the frontend
CREATE OR REPLACE FUNCTION public.log_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Just return the new record, no external HTTP calls
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;