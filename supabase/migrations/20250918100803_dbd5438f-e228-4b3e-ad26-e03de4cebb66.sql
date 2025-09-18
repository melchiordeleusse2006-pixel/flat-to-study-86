-- Update all RLS policies and database functions to include 'private' user type alongside 'agency'

-- Update function that returns user profile type
CREATE OR REPLACE FUNCTION public.get_user_profile_type()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT user_type FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Update agency business info function to include private landlords
CREATE OR REPLACE FUNCTION public.get_agency_business_info(agency_id_param uuid)
RETURNS TABLE(agency_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    COALESCE(p.agency_name, p.full_name, 'Real Estate Agency') as agency_name
  FROM profiles p
  WHERE p.id = agency_id_param
  AND p.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text, 'private'::text, 'PRIVATE'::text]);
$function$;

-- Update agency contact function to include private landlords
CREATE OR REPLACE FUNCTION public.get_agency_contact_for_conversation(agency_id_param uuid)
RETURNS TABLE(agency_name text, agency_phone text, agency_email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    p.agency_name,
    p.phone as agency_phone,
    p.email as agency_email
  FROM profiles p
  WHERE p.id = agency_id_param
  AND p.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text, 'private'::text, 'PRIVATE'::text])
  AND (
    -- Allow agency/private to see their own contact info
    p.user_id = auth.uid()
    OR
    -- Allow users who have messaged this agency/private to see contact info
    EXISTS (
      SELECT 1 FROM messages m
      JOIN listings l ON m.listing_id = l.id
      WHERE l.agency_id = agency_id_param
      AND m.sender_id = auth.uid()
    )
  );
$function$;

-- Update listings RLS policy to include private landlords
DROP POLICY IF EXISTS "Agencies can manage their own listings" ON public.listings;
CREATE POLICY "Agencies and private landlords can manage their own listings" 
ON public.listings 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text, 'private'::text, 'PRIVATE'::text])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = listings.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text, 'private'::text, 'PRIVATE'::text])
  )
);

-- Update archives RLS policies to include private landlords
DROP POLICY IF EXISTS "Agencies can view their own archived listings" ON public.archives;
CREATE POLICY "Agencies and private landlords can view their own archived listings" 
ON public.archives 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = archives.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text, 'private'::text, 'PRIVATE'::text])
  )
);

DROP POLICY IF EXISTS "Agencies can add to their own archives" ON public.archives;
CREATE POLICY "Agencies and private landlords can add to their own archives" 
ON public.archives 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = archives.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text, 'private'::text, 'PRIVATE'::text])
  )
);

-- Update messages RLS policies to include private landlords
DROP POLICY IF EXISTS "Agencies can view messages for their listings" ON public.messages;
CREATE POLICY "Agencies and private landlords can view messages for their listings" 
ON public.messages 
FOR SELECT 
USING (
  (get_user_profile_type() = ANY (ARRAY['agency'::text, 'private'::text])) 
  AND (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = messages.agency_id 
      AND p.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Agencies can update messages for their listings" ON public.messages;
CREATE POLICY "Agencies and private landlords can update messages for their listings" 
ON public.messages 
FOR UPDATE 
USING (
  (get_user_profile_type() = ANY (ARRAY['agency'::text, 'private'::text])) 
  AND (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = messages.agency_id 
      AND p.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Agencies can send replies to their listings" ON public.messages;
CREATE POLICY "Agencies and private landlords can send replies to their listings" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() = sender_id) 
  AND (get_user_profile_type() = ANY (ARRAY['agency'::text, 'private'::text])) 
  AND (
    EXISTS (
      SELECT 1 FROM (listings l JOIN profiles p ON (l.agency_id = p.id))
      WHERE l.id = messages.listing_id 
      AND p.user_id = auth.uid()
    )
  )
);

-- Update agency credits RLS policies to include private landlords  
DROP POLICY IF EXISTS "Agencies can view their own credits" ON public.agency_credits;
CREATE POLICY "Agencies and private landlords can view their own credits" 
ON public.agency_credits 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = agency_credits.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = ANY (ARRAY['agency'::text, 'private'::text])
  )
);

DROP POLICY IF EXISTS "Agencies can update their own credits" ON public.agency_credits;
CREATE POLICY "Agencies and private landlords can update their own credits" 
ON public.agency_credits 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = agency_credits.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = ANY (ARRAY['agency'::text, 'private'::text])
  )
);

-- Update credit transactions RLS policy to include private landlords
DROP POLICY IF EXISTS "Agencies can view their own transactions" ON public.credit_transactions;
CREATE POLICY "Agencies and private landlords can view their own transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = credit_transactions.agency_id 
    AND profiles.user_id = auth.uid() 
    AND profiles.user_type = ANY (ARRAY['agency'::text, 'private'::text])
  )
);

-- Update agency credits initialization trigger to include private landlords
CREATE OR REPLACE FUNCTION public.initialize_agency_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Create credits for agency and private users
  IF NEW.user_type = ANY (ARRAY['agency', 'private']) THEN
    INSERT INTO public.agency_credits (agency_id, credits_balance)
    VALUES (NEW.id, 1) -- Give 1 free credit for first listing
    ON CONFLICT (agency_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update functions that check for published listings to include private landlords
CREATE OR REPLACE FUNCTION public.agency_has_published_listings(agency_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM listings 
    WHERE agency_id = agency_profile_id 
    AND status = 'PUBLISHED'
  );
$function$;