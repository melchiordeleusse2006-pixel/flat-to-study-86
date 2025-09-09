-- Check if the trigger exists and recreate it if needed
DROP TRIGGER IF EXISTS trigger_send_message_notification ON public.messages;

-- Recreate the trigger to call the edge function when a new message is inserted
CREATE TRIGGER trigger_send_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();