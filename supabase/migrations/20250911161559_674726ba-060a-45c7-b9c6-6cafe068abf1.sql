-- Update archives table to allow null values for the same fields as listings table
-- This allows archiving of listings that were created with empty/null values

ALTER TABLE archives 
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN type DROP NOT NULL,
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN address_line DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN country DROP NOT NULL,
  ALTER COLUMN rent_monthly_eur DROP NOT NULL,
  ALTER COLUMN deposit_eur DROP NOT NULL,
  ALTER COLUMN bedrooms DROP NOT NULL,
  ALTER COLUMN bathrooms DROP NOT NULL,
  ALTER COLUMN availability_date DROP NOT NULL;