-- Allow publishing listings without filling all fields
ALTER TABLE public.listings
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