-- Fix infinite recursion by removing duplicate RLS policies

-- Drop duplicate policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Drop duplicate policies on listings table  
DROP POLICY IF EXISTS "Agencies can view all their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agencies can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agencies can delete their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agencies can insert their own listings" ON public.listings;

-- Keep only the clean policies with proper naming
-- Profiles policies (keeping the cleaner named ones)
-- "Users can view their own profile" - KEEP
-- "Users can update their own profile" - KEEP  
-- "Users can insert their own profile" - KEEP
-- "Agency contact info visible only through published listings" - KEEP

-- Listings policies - recreate clean ones
DROP POLICY IF EXISTS "Anyone can view published listings" ON public.listings;

-- Create clean RLS policies for listings
CREATE POLICY "Anyone can view published listings" 
ON public.listings 
FOR SELECT 
USING (status = 'PUBLISHED');

CREATE POLICY "Agencies can manage their own listings" 
ON public.listings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type IN ('agency', 'AGENCY')
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type IN ('agency', 'AGENCY')
  )
);