-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  landlord_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  monthly_rent INTEGER NOT NULL,
  security_deposit INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  contract_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability table
CREATE TABLE public.listing_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override INTEGER, -- Optional price override for specific dates
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, date)
);

-- Create payment schedules table
CREATE TABLE public.payment_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('security_deposit', 'first_month', 'monthly_rent')),
  amount INTEGER NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add booking-specific fields to listings table
ALTER TABLE public.listings 
ADD COLUMN booking_enabled BOOLEAN DEFAULT false,
ADD COLUMN instant_booking BOOLEAN DEFAULT false,
ADD COLUMN minimum_stay_days INTEGER DEFAULT 30,
ADD COLUMN maximum_stay_days INTEGER DEFAULT 365,
ADD COLUMN advance_booking_days INTEGER DEFAULT 90;

-- Enable RLS on new tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookings
CREATE POLICY "Tenants can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view bookings for their properties" 
ON public.bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id = bookings.landlord_id
));

CREATE POLICY "Tenants can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Landlords can update bookings for their properties" 
ON public.bookings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id = bookings.landlord_id
));

-- RLS policies for availability
CREATE POLICY "Anyone can view availability" 
ON public.listing_availability 
FOR SELECT 
USING (true);

CREATE POLICY "Landlords can manage availability for their properties" 
ON public.listing_availability 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM listings l 
  JOIN profiles p ON l.agency_id = p.id 
  WHERE l.id = listing_availability.listing_id 
  AND p.user_id = auth.uid()
));

-- RLS policies for payment schedules
CREATE POLICY "Tenants can view their payment schedules" 
ON public.payment_schedules 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM bookings b 
  WHERE b.id = payment_schedules.booking_id 
  AND b.tenant_id = auth.uid()
));

CREATE POLICY "Landlords can view payment schedules for their bookings" 
ON public.payment_schedules 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM bookings b 
  JOIN profiles p ON b.landlord_id = p.id 
  WHERE b.id = payment_schedules.booking_id 
  AND p.user_id = auth.uid()
));

-- Create function to automatically generate availability dates
CREATE OR REPLACE FUNCTION public.generate_listing_availability(
  p_listing_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.listing_availability (listing_id, date, is_available)
  SELECT 
    p_listing_id,
    generate_series(p_start_date, p_end_date, '1 day'::interval)::date,
    true
  ON CONFLICT (listing_id, date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check availability for a date range
CREATE OR REPLACE FUNCTION public.check_availability(
  p_listing_id UUID,
  p_check_in DATE,
  p_check_out DATE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.listing_availability
    WHERE listing_id = p_listing_id
    AND date >= p_check_in
    AND date < p_check_out
    AND is_available = false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create trigger to update updated_at on bookings
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();