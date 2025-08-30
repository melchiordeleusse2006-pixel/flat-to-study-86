-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Create RLS policies for listing images storage
CREATE POLICY "Anyone can view listing images"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-images');

CREATE POLICY "Agencies can upload listing images"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'listing-images' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'agency'
  )
);

CREATE POLICY "Agencies can update their listing images"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'listing-images' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'agency'
  )
);

CREATE POLICY "Agencies can delete their listing images"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'listing-images' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'agency'
  )
);

-- Add agency_fee column to listings table to support both numerical and text values
ALTER TABLE listings ADD COLUMN agency_fee TEXT;