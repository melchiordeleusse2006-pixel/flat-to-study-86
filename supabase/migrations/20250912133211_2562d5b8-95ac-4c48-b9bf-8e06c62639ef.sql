-- Fix security warnings by adding search_path to functions

-- Update the get_listing_text function to fix search path warning
CREATE OR REPLACE FUNCTION public.get_listing_text(
    multilingual_field JSONB,
    language_code TEXT DEFAULT 'en'
) RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
    SELECT COALESCE(
        multilingual_field->>language_code,
        multilingual_field->>'en',
        ''
    );
$$;

-- Update the get_listings_with_agency function to support multilingual content
CREATE OR REPLACE FUNCTION public.get_listings_with_agency_multilingual(
    p_limit integer DEFAULT 50, 
    p_offset integer DEFAULT 0, 
    p_city text DEFAULT NULL::text, 
    p_min_price integer DEFAULT NULL::integer, 
    p_max_price integer DEFAULT NULL::integer, 
    p_listing_type text DEFAULT NULL::text, 
    p_min_bedrooms integer DEFAULT NULL::integer,
    p_language text DEFAULT 'en'
)
RETURNS TABLE(
    id uuid, 
    title text, 
    type text, 
    description text, 
    address_line text, 
    city text, 
    country text, 
    lat double precision, 
    lng double precision, 
    rent_monthly_eur integer, 
    deposit_eur integer, 
    bills_included boolean, 
    furnished boolean, 
    bedrooms integer, 
    bathrooms integer, 
    floor text, 
    size_sqm integer, 
    amenities jsonb, 
    availability_date date, 
    images jsonb, 
    video_url text, 
    status text, 
    created_at timestamp with time zone, 
    published_at timestamp with time zone, 
    agency_name text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    l.id, 
    public.get_listing_text(l.title_multilingual, p_language) as title,
    l.type, 
    public.get_listing_text(l.description_multilingual, p_language) as description,
    l.address_line,
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