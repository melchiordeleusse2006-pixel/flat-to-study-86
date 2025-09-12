-- Add multilingual support to listings table
-- Convert text fields to support both English and Italian

-- Add new columns for multilingual content
ALTER TABLE public.listings 
ADD COLUMN title_multilingual JSONB DEFAULT '{"en": "", "it": ""}'::jsonb,
ADD COLUMN description_multilingual JSONB DEFAULT '{"en": "", "it": ""}'::jsonb;

-- Migrate existing data to new multilingual columns
UPDATE public.listings 
SET 
    title_multilingual = jsonb_build_object('en', COALESCE(title, ''), 'it', COALESCE(title, '')),
    description_multilingual = jsonb_build_object('en', COALESCE(description, ''), 'it', COALESCE(description, ''))
WHERE title_multilingual IS NULL OR description_multilingual IS NULL;

-- Create function to get listing content in specific language
CREATE OR REPLACE FUNCTION public.get_listing_text(
    multilingual_field JSONB,
    language_code TEXT DEFAULT 'en'
) RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT COALESCE(
        multilingual_field->>language_code,
        multilingual_field->>'en',
        ''
    );
$$;