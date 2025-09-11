-- Create archives table for storing deleted/rented listings
CREATE TABLE public.archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_listing_id UUID NOT NULL,
  agency_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rent_monthly_eur INTEGER NOT NULL,
  deposit_eur INTEGER NOT NULL,
  bills_included BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  floor TEXT,
  size_sqm INTEGER,
  amenities JSONB DEFAULT '[]'::jsonb,
  availability_date DATE NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  agency_fee TEXT,
  lease_end_date DATE,
  auto_repost BOOLEAN DEFAULT false,
  archive_reason TEXT NOT NULL, -- 'RENTED' or 'DELETED'
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  original_created_at TIMESTAMP WITH TIME ZONE,
  original_published_at TIMESTAMP WITH TIME ZONE,
  agency_contact JSONB -- Store agency contact info at time of archiving
);

-- Enable RLS
ALTER TABLE public.archives ENABLE ROW LEVEL SECURITY;

-- Create policies for archives
CREATE POLICY "Agencies can view their own archived listings" 
ON public.archives 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = archives.agency_id 
  AND profiles.user_id = auth.uid() 
  AND profiles.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text])
));

CREATE POLICY "Agencies can add to their own archives" 
ON public.archives 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = archives.agency_id 
  AND profiles.user_id = auth.uid() 
  AND profiles.user_type = ANY (ARRAY['agency'::text, 'AGENCY'::text])
));

-- Admins can view all archives
CREATE POLICY "Admins can view all archived listings" 
ON public.archives 
FOR SELECT 
USING (get_user_profile_type() = 'admin'::text);

-- Add index for performance
CREATE INDEX idx_archives_agency_id ON public.archives(agency_id);
CREATE INDEX idx_archives_lease_end_date ON public.archives(lease_end_date) WHERE auto_repost = true;