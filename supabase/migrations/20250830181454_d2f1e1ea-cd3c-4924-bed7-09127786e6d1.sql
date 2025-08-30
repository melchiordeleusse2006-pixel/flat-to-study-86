-- Drop the existing listings_with_agencies view
DROP VIEW IF EXISTS public.listings_with_agencies;

-- Create a simple view without SECURITY DEFINER that relies on the underlying table's RLS
CREATE VIEW public.listings_with_agencies AS
SELECT 
    l.id,
    l.agency_id,
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
    l.published_at,
    l.expires_at,
    l.created_at,
    l.updated_at,
    l.agency_fee,
    p.agency_name,
    p.phone AS agency_phone,
    p.email AS agency_email,
    p.full_name AS agency_contact_name
FROM listings l
JOIN profiles p ON l.agency_id = p.id;