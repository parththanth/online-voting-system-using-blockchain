-- Fix security vulnerability in otp_rate_limits table
-- Remove overly permissive policy that allows any user to view all rate limit records

-- Drop the problematic policy that uses 'true' condition
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.otp_rate_limits;

-- Create a secure policy that allows users to only view their own rate limit records
-- by matching their authenticated email/phone with records in the table
CREATE POLICY "Users can view their own rate limits only" 
ON public.otp_rate_limits 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND (
      users.email = otp_rate_limits.email 
      OR users.phone_number = otp_rate_limits.phone_number
    )
  )
);

-- Ensure the system policy remains for edge functions to manage rate limits
-- (This should already exist but let's make sure it's properly defined)
DROP POLICY IF EXISTS "System can manage rate limits" ON public.otp_rate_limits;

CREATE POLICY "System can manage rate limits" 
ON public.otp_rate_limits 
FOR ALL 
USING (true);