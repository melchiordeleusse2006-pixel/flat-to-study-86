-- Add RLS policy for admin/owner users to view all messages
CREATE POLICY "Admins can view all messages" 
ON public.messages 
FOR SELECT 
USING (get_user_profile_type() = 'admin'::text);

-- Add RLS policy for admin/owner users to view all listings
CREATE POLICY "Admins can view all listings" 
ON public.listings 
FOR SELECT 
USING (get_user_profile_type() = 'admin'::text);

-- Add RLS policy for admin/owner users to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_profile_type() = 'admin'::text);