-- Fix the RLS policy for viewing agency profiles to handle both cases
-- Drop the existing policy first
DROP POLICY IF EXISTS "Anyone can view agency profiles" ON public.profiles;

-- Create new policy that handles both lowercase and uppercase
CREATE POLICY "Anyone can view agency profiles" 
ON public.profiles 
FOR SELECT 
USING (user_type IN ('agency', 'AGENCY'));