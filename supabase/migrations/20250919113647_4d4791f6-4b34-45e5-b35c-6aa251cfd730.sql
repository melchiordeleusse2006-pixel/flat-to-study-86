-- Fix search path for functions that need it
CREATE OR REPLACE FUNCTION public.generate_listing_availability(
  p_listing_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.listing_availability (listing_id, date, is_available)
  SELECT 
    p_listing_id,
    generate_series(p_start_date, p_end_date, '1 day'::interval)::date,
    true
  ON CONFLICT (listing_id, date) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_availability(
  p_listing_id UUID,
  p_check_in DATE,
  p_check_out DATE
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.listing_availability
    WHERE listing_id = p_listing_id
    AND date >= p_check_in
    AND date < p_check_out
    AND is_available = false
  );
END;
$$;