-- Fix the handle_new_user function to ensure it uses valid user_type values
-- Drop and recreate the function to handle user_type mapping correctly
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  user_type_value text;
BEGIN
  -- Map user_type from user metadata to valid constraint values
  user_type_value := COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'student');
  
  -- Ensure the user_type is one of the valid values
  IF user_type_value NOT IN ('student', 'agency', 'admin') THEN
    user_type_value := 'student'; -- Default to student for invalid values
  END IF;

  INSERT INTO public.profiles (user_id, user_type, full_name, email, university)
  VALUES (
    NEW.id,
    user_type_value,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'university', NULL)
  );
  RETURN NEW;
END;
$$;