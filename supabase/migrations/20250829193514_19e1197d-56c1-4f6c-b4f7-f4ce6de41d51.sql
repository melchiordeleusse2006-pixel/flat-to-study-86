-- Fix RLS policies to use lowercase 'agency' instead of uppercase 'AGENCY'

-- Drop existing policies
DROP POLICY IF EXISTS "Agencies can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agencies can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agencies can delete their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agencies can view all their own listings" ON public.listings;

-- Recreate policies with correct case
CREATE POLICY "Agencies can insert their own listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = 'agency'
));

CREATE POLICY "Agencies can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = 'agency'
));

CREATE POLICY "Agencies can delete their own listings" 
ON public.listings 
FOR DELETE 
USING (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = 'agency'
));

CREATE POLICY "Agencies can view all their own listings" 
ON public.listings 
FOR SELECT 
USING (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = 'agency'
));