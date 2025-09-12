-- Create credits table to track agency credits
CREATE TABLE public.agency_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agency_id)
);

-- Create credit transactions table to track credit purchases and usage
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
  credits_amount INTEGER NOT NULL,
  listing_id UUID NULL, -- For usage transactions
  stripe_payment_intent_id TEXT NULL, -- For purchase transactions
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add credit tracking columns to listings table
ALTER TABLE public.listings 
ADD COLUMN credits_used INTEGER DEFAULT 1,
ADD COLUMN credits_remaining INTEGER DEFAULT 0,
ADD COLUMN last_credit_deducted_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.agency_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for agency_credits
CREATE POLICY "Agencies can view their own credits" 
ON public.agency_credits 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = agency_credits.agency_id 
  AND profiles.user_id = auth.uid() 
  AND profiles.user_type = 'agency'
));

CREATE POLICY "Agencies can update their own credits" 
ON public.agency_credits 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = agency_credits.agency_id 
  AND profiles.user_id = auth.uid() 
  AND profiles.user_type = 'agency'
));

CREATE POLICY "System can insert credit records" 
ON public.agency_credits 
FOR INSERT 
WITH CHECK (true);

-- Create policies for credit_transactions
CREATE POLICY "Agencies can view their own transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = credit_transactions.agency_id 
  AND profiles.user_id = auth.uid() 
  AND profiles.user_type = 'agency'
));

CREATE POLICY "System can insert transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to initialize agency credits when agency profile is created
CREATE OR REPLACE FUNCTION public.initialize_agency_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create credits for agency users
  IF NEW.user_type = 'agency' THEN
    INSERT INTO public.agency_credits (agency_id, credits_balance)
    VALUES (NEW.id, 1) -- Give 1 free credit for first listing
    ON CONFLICT (agency_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for agency credit initialization
CREATE TRIGGER on_agency_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_agency_credits();

-- Create function to check if agency has sufficient credits
CREATE OR REPLACE FUNCTION public.agency_has_credits(agency_profile_id UUID, required_credits INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(credits_balance, 0) >= required_credits
  FROM agency_credits 
  WHERE agency_id = agency_profile_id;
$$;

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_agency_credits(agency_profile_id UUID, credits_amount INTEGER, listing_id_param UUID DEFAULT NULL, description_param TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO current_balance 
  FROM agency_credits 
  WHERE agency_id = agency_profile_id;
  
  -- Check if sufficient credits
  IF current_balance < credits_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE agency_credits 
  SET credits_balance = credits_balance - credits_amount,
      updated_at = now()
  WHERE agency_id = agency_profile_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (agency_id, transaction_type, credits_amount, listing_id, description)
  VALUES (agency_profile_id, 'usage', -credits_amount, listing_id_param, COALESCE(description_param, 'Credits used for listing'));
  
  RETURN TRUE;
END;
$$;

-- Create function to add credits (for purchases)
CREATE OR REPLACE FUNCTION public.add_agency_credits(agency_profile_id UUID, credits_amount INTEGER, stripe_payment_intent_id_param TEXT DEFAULT NULL, description_param TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add credits
  UPDATE agency_credits 
  SET credits_balance = credits_balance + credits_amount,
      updated_at = now()
  WHERE agency_id = agency_profile_id;
  
  -- If no existing record, create one
  IF NOT FOUND THEN
    INSERT INTO agency_credits (agency_id, credits_balance)
    VALUES (agency_profile_id, credits_amount);
  END IF;
  
  -- Record transaction
  INSERT INTO credit_transactions (agency_id, transaction_type, credits_amount, stripe_payment_intent_id, description)
  VALUES (agency_profile_id, 'purchase', credits_amount, stripe_payment_intent_id_param, COALESCE(description_param, 'Credits purchased'));
END;
$$;