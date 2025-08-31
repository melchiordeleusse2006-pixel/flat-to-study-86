-- Fix function search path security issue
CREATE OR REPLACE FUNCTION notify_agency_on_new_message()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to send notification email
  PERFORM
    net.http_post(
      url := 'https://txuptwgqziperdffnuqq.supabase.co/functions/v1/send-message-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object('message_id', NEW.id::text)
    );
  
  RETURN NEW;
END;
$$;