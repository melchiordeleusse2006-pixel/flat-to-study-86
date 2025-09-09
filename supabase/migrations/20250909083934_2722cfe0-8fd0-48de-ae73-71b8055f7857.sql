-- Update the handle_new_user function to properly extract all user data including phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_type_value text;
BEGIN
  -- Map user_type from user metadata to valid constraint values
  user_type_value := COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'student');
  
  -- Ensure the user_type is one of the valid values
  IF user_type_value NOT IN ('student', 'agency', 'admin', 'private') THEN
    user_type_value := 'student'; -- Default to student for invalid values
  END IF;

  INSERT INTO public.profiles (
    user_id, 
    user_type, 
    full_name, 
    email, 
    phone,
    university,
    agency_name
  )
  VALUES (
    NEW.id,
    user_type_value,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'university', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'company', NULL)
  );
  RETURN NEW;
END;
$$;