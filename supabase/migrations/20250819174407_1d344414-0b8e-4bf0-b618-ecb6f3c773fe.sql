-- Fix security warnings by setting proper search_path for functions

-- Update is_account_locked function with proper search_path
CREATE OR REPLACE FUNCTION public.is_account_locked(user_id uuid)
RETURNS boolean
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(account_locked_until > now(), false)
  FROM public.users
  WHERE id = user_id;
$$;

-- Update lock_account_on_failed_otp function with proper search_path  
CREATE OR REPLACE FUNCTION public.lock_account_on_failed_otp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Lock account for 15 minutes if 5 or more failed attempts
  IF NEW.failed_otp_attempts >= 5 THEN
    NEW.account_locked_until = now() + interval '15 minutes';
  END IF;
  
  RETURN NEW;
END;
$$;