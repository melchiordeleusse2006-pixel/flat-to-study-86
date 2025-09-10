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

-- Create function to get analytics data
CREATE OR REPLACE FUNCTION public.get_platform_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    total_page_views BIGINT,
    unique_visitors BIGINT,
    avg_time_per_page NUMERIC,
    listings_per_month JSONB,
    price_increases_count BIGINT,
    properties_taken_off_market BIGINT,
    most_viewed_listings JSONB,
    popular_pages JSONB
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        -- Total page views
        (SELECT COUNT(*) FROM page_views WHERE created_at::date BETWEEN start_date AND end_date),
        
        -- Unique visitors (by session_id)
        (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at::date BETWEEN start_date AND end_date),
        
        -- Average time per page
        (SELECT ROUND(AVG(time_spent_seconds), 2) FROM page_views WHERE created_at::date BETWEEN start_date AND end_date),
        
        -- Listings per month
        (SELECT jsonb_agg(
            jsonb_build_object(
                'month', month_year,
                'count', listing_count
            )
        ) FROM (
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month_year,
                COUNT(*) as listing_count
            FROM listings 
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month_year
        ) monthly_listings),
        
        -- Price increases count
        (SELECT COUNT(*) FROM listings 
         WHERE price_history IS NOT NULL 
         AND jsonb_array_length(price_history) > 0
         AND EXISTS (
             SELECT 1 FROM jsonb_array_elements(price_history) AS ph
             WHERE (ph->>'changed_at')::timestamp::date BETWEEN start_date AND end_date
             AND (ph->>'new_price')::integer > (ph->>'old_price')::integer
         )),
        
        -- Properties taken off market (status changed from PUBLISHED to something else)
        (SELECT COUNT(*) FROM listings 
         WHERE status != 'PUBLISHED' 
         AND updated_at::date BETWEEN start_date AND end_date),
        
        -- Most viewed listings
        (SELECT jsonb_agg(
            jsonb_build_object(
                'listing_id', listing_id,
                'title', l.title,
                'view_count', view_count
            )
        ) FROM (
            SELECT 
                lv.listing_id,
                COUNT(*) as view_count
            FROM listing_views lv
            JOIN listings l ON l.id = lv.listing_id
            WHERE lv.created_at::date BETWEEN start_date AND end_date
            GROUP BY lv.listing_id, l.title
            ORDER BY view_count DESC
            LIMIT 10
        ) top_listings),
        
        -- Popular pages
        (SELECT jsonb_agg(
            jsonb_build_object(
                'page', page_path,
                'views', view_count,
                'avg_time', avg_time
            )
        ) FROM (
            SELECT 
                page_path,
                COUNT(*) as view_count,
                ROUND(AVG(time_spent_seconds), 2) as avg_time
            FROM page_views
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY page_path
            ORDER BY view_count DESC
            LIMIT 10
        ) popular_pages);
$$;