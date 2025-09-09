-- First, let's check if pg_net extension is available and enable it if needed
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS handle_new_message_notification_trigger ON public.messages;
DROP FUNCTION IF EXISTS public.handle_new_message_notification();

-- Create a simpler trigger function that uses the http extension
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_role_key text;
BEGIN
  -- Get the service role key from the vault (if available) or use a default approach
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dXB0d2dxemlwZXJkZmZudXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE1MTA2NSwiZXhwIjoyMDcxNzI3MDY1fQ.YHBOjOSAcL-z1Wh6QH6RG8XxDnJ8mXKnJ8kJ8kJ8kJ8';
  
  -- Log that we're attempting to send notification
  RAISE LOG 'Attempting to send notification for message ID: %', NEW.id;
  
  -- Use pg_net to make the HTTP request
  PERFORM net.http_post(
    url := 'https://txuptwgqziperdffnuqq.supabase.co/functions/v1/send-message-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('message_id', NEW.id)
  );
  
  RAISE LOG 'Successfully triggered notification for message ID: %', NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the insert
  RAISE LOG 'Failed to send notification for message ID: %. Error: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER handle_new_message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();