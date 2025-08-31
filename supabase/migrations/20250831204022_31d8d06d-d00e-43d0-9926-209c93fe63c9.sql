-- Fix RLS policies to allow students to send messages and add real-time notifications

-- First, let's check current policies and fix them
-- Students should be able to INSERT messages (send messages)
-- Everyone should be able to view messages they're part of

-- Enable real-time for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Allow students to send messages
CREATE POLICY "Students can send messages to listings" 
ON public.messages 
FOR INSERT 
WITH CHECK (
    -- Students can send messages if they are authenticated and targeting a published listing
    auth.uid() = sender_id 
    AND EXISTS (
        SELECT 1 FROM public.listings 
        WHERE listings.id = listing_id 
        AND listings.status = 'PUBLISHED'
    )
);

-- Allow agencies to send messages (replies)
CREATE POLICY "Agencies can send replies to their listings" 
ON public.messages 
FOR INSERT 
WITH CHECK (
    -- Agencies can send messages if they own the listing
    auth.uid() = sender_id 
    AND EXISTS (
        SELECT 1 FROM public.listings l
        JOIN public.profiles p ON l.agency_id = p.id
        WHERE l.id = listing_id 
        AND p.user_id = auth.uid()
        AND p.user_type = 'agency'
    )
);