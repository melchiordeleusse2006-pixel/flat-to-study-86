-- Allow 'private' user type in profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('student','agency','admin','private'));

-- Ensure trigger to init credits also handles 'PRIVATE'/'AGENCY' variants (already handled), no change needed.
