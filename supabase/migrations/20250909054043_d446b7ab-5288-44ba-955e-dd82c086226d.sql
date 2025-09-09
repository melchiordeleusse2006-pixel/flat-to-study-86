-- Drop and recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS handle_new_message_notification_trigger ON public.messages;

-- Create trigger for automatic message notifications
CREATE TRIGGER handle_new_message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();