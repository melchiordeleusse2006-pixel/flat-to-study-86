-- Add rental tracking columns to listings table
ALTER TABLE public.listings 
ADD COLUMN lease_end_date DATE,
ADD COLUMN auto_repost BOOLEAN DEFAULT false;

-- Update the status check constraint to include RENTED
ALTER TABLE public.listings 
DROP CONSTRAINT IF EXISTS listings_status_check;

ALTER TABLE public.listings 
ADD CONSTRAINT listings_status_check 
CHECK (status IN ('DRAFT', 'PUBLISHED', 'EXPIRED', 'ARCHIVED', 'RENTED'));