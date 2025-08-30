-- Update the get_listings_with_agency function to fix security issues
-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_listings_with_agency;

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.get_listings_with_agency(
    p_limit integer DEFAULT 50, 
    p_offset integer DEFAULT 0, 
    p_city text DEFAULT NULL, 
    p_min_price integer DEFAULT NULL, 
    p_max_price integer DEFAULT NULL, 
    p_listing_type text DEFAULT NULL, 
    p_min_bedrooms integer DEFAULT NULL
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
    agency_name text, 
    agency_phone text, 
    agency_email text
)
LANGUAGE sql
SECURITY INVOKER  -- Changed from DEFINER to INVOKER
STABLE
SET search_path = public
AS $$
    SELECT 
        l.id,
        l.title,
        l.type,
        l.description,
        l.address_line,
        l.city,
        l.country,
        l.lat,
        l.lng,
        l.rent_monthly_eur,
        l.deposit_eur,
        l.bills_included,
        l.furnished,
        l.bedrooms,
        l.bathrooms,
        l.floor,
        l.size_sqm,
        l.amenities,
        l.availability_date,
        l.images,
        l.video_url,
        l.status,
        l.created_at,
        l.published_at,
        p.agency_name,
        p.phone as agency_phone,
        p.email as agency_email
    FROM listings l
    JOIN profiles p ON l.agency_id = p.id
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