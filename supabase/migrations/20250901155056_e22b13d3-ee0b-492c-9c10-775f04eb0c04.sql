-- Fix infinite recursion in profiles RLS policy by using security definer function

-- Drop the problematic policy
DROP POLICY IF EXISTS "Agency contact info visible only through published listings" ON public.profiles;

-- Create a security definer function to check if agency has published listings
CREATE OR REPLACE FUNCTION public.agency_has_published_listings(agency_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM listings 
    WHERE agency_id = agency_profile_id 
    AND status = 'PUBLISHED'
  );
$$;

-- Create a new policy using the security definer function to avoid recursion
CREATE POLICY "Agency contact info visible only through published listings" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text]) 
  AND public.agency_has_published_listings(id)
);