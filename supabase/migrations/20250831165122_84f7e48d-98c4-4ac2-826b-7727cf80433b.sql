-- First drop the trigger
DROP TRIGGER IF EXISTS on_message_created ON public.messages;

-- Then drop the function with CASCADE to remove dependencies
DROP FUNCTION IF EXISTS public.notify_agency_on_new_message() CASCADE;

-- Recreate a simple function that doesn't use external HTTP calls
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Just return the new record without any external calls
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new trigger that uses the simple function
CREATE TRIGGER on_new_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();