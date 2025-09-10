-- Create analytics tables for tracking website and property metrics

-- Table for tracking page views and website visits
CREATE TABLE public.page_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking property/listing views
CREATE TABLE public.listing_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables (only allow inserts for tracking, admin access for reads)
CREATE POLICY "Allow anonymous page view tracking" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous listing view tracking" 
ON public.listing_views 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);

CREATE INDEX idx_listing_views_created_at ON public.listing_views(created_at);
CREATE INDEX idx_listing_views_listing_id ON public.listing_views(listing_id);
CREATE INDEX idx_listing_views_user_id ON public.listing_views(user_id);

-- Add price history tracking to listings (for price increase analysis)
ALTER TABLE public.listings 
ADD COLUMN price_history JSONB DEFAULT '[]'::jsonb;

-- Create function to update price history when rent changes
CREATE OR REPLACE FUNCTION public.track_price_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- If rent_monthly_eur has changed, add to price history
    IF OLD.rent_monthly_eur IS DISTINCT FROM NEW.rent_monthly_eur THEN
        NEW.price_history = COALESCE(OLD.price_history, '[]'::jsonb) || 
            jsonb_build_object(
                'old_price', OLD.rent_monthly_eur,
                'new_price', NEW.rent_monthly_eur,
                'changed_at', NOW()
            );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price tracking
CREATE TRIGGER track_listing_price_changes
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.track_price_changes();