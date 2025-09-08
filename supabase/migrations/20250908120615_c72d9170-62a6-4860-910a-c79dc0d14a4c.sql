-- Function to manually verify user email (admin only)
CREATE OR REPLACE FUNCTION public.admin_verify_user_email(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update the user's email confirmation status
  UPDATE auth.users 
  SET email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE email = user_email 
  AND email_confirmed_at IS NULL;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

-- Verify Marcello Re's email
SELECT public.admin_verify_user_email('abitaremilano2@tin.it');