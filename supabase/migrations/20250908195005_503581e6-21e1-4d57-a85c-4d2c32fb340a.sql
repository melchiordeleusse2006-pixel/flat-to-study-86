-- Remove the problematic trigger and function that's causing the "net schema does not exist" error
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
DROP TRIGGER IF EXISTS on_new_message_created ON public.messages;
DROP FUNCTION IF EXISTS public.handle_new_message() CASCADE;