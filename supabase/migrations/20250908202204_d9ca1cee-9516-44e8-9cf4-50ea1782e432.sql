-- Update the function to set proper search path
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  response_data jsonb;
BEGIN
  -- Call the edge function asynchronously using pg_net (if available) or skip if not
  BEGIN
    -- Try to call the edge function using supabase_functions.http_request
    SELECT content INTO response_data
    FROM supabase_functions.http_request(
      'POST',
      'https://txuptwgqziperdffnuqq.supabase.co/functions/v1/send-message-notification',
      '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
      '{"message_id": "' || NEW.id || '"}'
    );
    
    -- Log success
    RAISE LOG 'Message notification sent for message ID: %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the insert
    RAISE LOG 'Failed to send message notification for message ID: %. Error: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';