-- Check if the trigger exists for message notifications
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'messages' 
AND trigger_name = 'trigger_new_message_notification';

-- Create the trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'messages' 
        AND trigger_name = 'trigger_new_message_notification'
    ) THEN
        CREATE TRIGGER trigger_new_message_notification
        AFTER INSERT ON messages
        FOR EACH ROW
        EXECUTE FUNCTION handle_new_message_notification();
    END IF;
END $$;