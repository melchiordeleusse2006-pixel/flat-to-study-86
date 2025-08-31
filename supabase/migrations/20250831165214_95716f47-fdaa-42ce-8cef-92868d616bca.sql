-- Fix the function search path security warning
DROP FUNCTION IF EXISTS public.handle_new_message() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Just return the new record without any external calls
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_new_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();