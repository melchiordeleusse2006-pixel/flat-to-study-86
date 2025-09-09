-- Create trigger for automatic message notifications
CREATE OR REPLACE TRIGGER handle_new_message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();