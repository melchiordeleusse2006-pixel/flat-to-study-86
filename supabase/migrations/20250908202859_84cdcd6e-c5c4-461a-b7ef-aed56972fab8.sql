-- Drop the existing trigger and function, then recreate with a simpler approach
DROP TRIGGER IF EXISTS on_message_created_notification ON public.messages;
DROP FUNCTION IF EXISTS public.handle_new_message_notification() CASCADE;

-- Create a simple trigger function that uses pg_net (if available) or logs the attempt
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Log that we're attempting to send notification
  RAISE LOG 'Attempting to send notification for message ID: %', NEW.id;
  
  -- Try to make HTTP request using pg_net.http_post if available
  BEGIN
    PERFORM net.http_post(
      url := 'https://txuptwgqziperdffnuqq.supabase.co/functions/v1/send-message-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('message_id', NEW.id)
    );
    
    RAISE LOG 'Successfully triggered notification for message ID: %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- If pg_net is not available or fails, log the error but don't fail the insert
    RAISE LOG 'Failed to send notification for message ID: %. Error: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create the trigger
CREATE TRIGGER on_message_created_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();