-- Fix RLS policies to prevent infinite recursion
DROP POLICY IF EXISTS "profile_own_access" ON public.profiles;
DROP POLICY IF EXISTS "agency_contact_visibility" ON public.profiles;

-- Create simple policies without circular references
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_own" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow agencies to be viewed by users who have messaged them
CREATE POLICY "profiles_select_agency_after_messaging" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'agency' 
  AND EXISTS (
    SELECT 1 FROM messages m
    JOIN listings l ON l.id = m.listing_id
    WHERE l.agency_id = profiles.id
    AND m.sender_id = auth.uid()
  )
);

-- Fix the get_agency_business_info function to use full_name as fallback
CREATE OR REPLACE FUNCTION public.get_agency_business_info(agency_id_param uuid)
RETURNS TABLE(agency_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    COALESCE(p.agency_name, p.full_name, 'Real Estate Agency') as agency_name
  FROM profiles p
  WHERE p.id = agency_id_param
  AND p.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text]);
$function$;