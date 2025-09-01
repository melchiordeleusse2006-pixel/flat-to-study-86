-- Fix security vulnerability: Remove agency contact information exposure
-- This migration restricts access to agency contact details (email and phone)
-- Only agency names will be publicly visible through listings

-- Update the get_agency_business_info function to only return agency name
-- Remove email and phone exposure
CREATE OR REPLACE FUNCTION public.get_agency_business_info(agency_id_param uuid)
RETURNS TABLE(
  agency_name text
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.agency_name
  FROM profiles p
  WHERE p.id = agency_id_param
  AND p.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text])
  AND EXISTS (
    SELECT 1 
    FROM listings l 
    WHERE l.agency_id = p.id 
    AND l.status = 'PUBLISHED'
  );
$$;

-- Update the get_listings_with_agency function to only include agency name
CREATE OR REPLACE FUNCTION public.get_listings_with_agency(
  p_limit integer DEFAULT 50, 
  p_offset integer DEFAULT 0, 
  p_city text DEFAULT NULL::text, 
  p_min_price integer DEFAULT NULL::integer, 
  p_max_price integer DEFAULT NULL::integer, 
  p_listing_type text DEFAULT NULL::text, 
  p_min_bedrooms integer DEFAULT NULL::integer
)
RETURNS TABLE(
  id uuid, title text, type text, description text, address_line text, 
  city text, country text, lat double precision, lng double precision, 
  rent_monthly_eur integer, deposit_eur integer, bills_included boolean, 
  furnished boolean, bedrooms integer, bathrooms integer, floor text, 
  size_sqm integer, amenities jsonb, availability_date date, images jsonb, 
  video_url text, status text, created_at timestamp with time zone, 
  published_at timestamp with time zone, agency_name text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    l.id, l.title, l.type, l.description, l.address_line,
    l.city, l.country, l.lat, l.lng, l.rent_monthly_eur,
    l.deposit_eur, l.bills_included, l.furnished, l.bedrooms,
    l.bathrooms, l.floor, l.size_sqm, l.amenities, l.availability_date,
    l.images, l.video_url, l.status, l.created_at, l.published_at,
    agency_info.agency_name
  FROM listings l
  LEFT JOIN LATERAL (
    SELECT * FROM public.get_agency_business_info(l.agency_id)
  ) agency_info ON true
  WHERE l.status = 'PUBLISHED'
  AND (p_city IS NULL OR l.city ILIKE '%' || p_city || '%')
  AND (p_min_price IS NULL OR l.rent_monthly_eur >= p_min_price)
  AND (p_max_price IS NULL OR l.rent_monthly_eur <= p_max_price)
  AND (p_listing_type IS NULL OR l.type = p_listing_type)
  AND (p_min_bedrooms IS NULL OR l.bedrooms >= p_min_bedrooms)
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Create a secure function for legitimate contact access
-- This function allows authenticated users to get agency contact info only when they have
-- sent a message to one of the agency's listings (proving legitimate interest)
CREATE OR REPLACE FUNCTION public.get_agency_contact_for_conversation(agency_id_param uuid)
RETURNS TABLE(
  agency_name text,
  agency_phone text,
  agency_email text
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.agency_name,
    p.phone as agency_phone,
    p.email as agency_email
  FROM profiles p
  WHERE p.id = agency_id_param
  AND p.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text])
  AND (
    -- Allow agency to see their own contact info
    p.user_id = auth.uid()
    OR
    -- Allow users who have messaged this agency to see contact info
    EXISTS (
      SELECT 1 FROM messages m
      JOIN listings l ON m.listing_id = l.id
      WHERE l.agency_id = agency_id_param
      AND m.sender_id = auth.uid()
    )
  );
$$;