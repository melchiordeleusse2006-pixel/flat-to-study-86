-- Add notification trigger for new messages
CREATE OR REPLACE FUNCTION notify_agency_on_new_message()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger on messages table
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_agency_on_new_message();