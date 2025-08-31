-- Fix the RLS policy for agencies viewing messages to use lowercase 'agency'
DROP POLICY IF EXISTS "Agencies can view messages for their listings" ON public.messages;

-- Create corrected policy that checks for lowercase 'agency' 
CREATE POLICY "Agencies can view messages for their listings" 
ON public.messages 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = messages.agency_id) AND (profiles.user_id = auth.uid()) AND (profiles.user_type = 'agency'::text))));

-- Add foreign key constraint to ensure agency_id references profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_agency_id_fkey'
    ) THEN
        ALTER TABLE public.messages 
        ADD CONSTRAINT messages_agency_id_fkey 
        FOREIGN KEY (agency_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;