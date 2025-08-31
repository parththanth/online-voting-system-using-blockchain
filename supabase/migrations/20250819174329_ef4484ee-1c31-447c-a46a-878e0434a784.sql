-- Add account lockout functionality for enhanced security
-- Add column to track when account should be unlocked
ALTER TABLE public.users ADD COLUMN account_locked_until timestamp with time zone;

-- Create a function to check if an account is locked
CREATE OR REPLACE FUNCTION public.is_account_locked(user_id uuid)
RETURNS boolean
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(account_locked_until > now(), false)
  FROM public.users
  WHERE id = user_id;
$$;

-- Create a function to lock account after failed attempts
CREATE OR REPLACE FUNCTION public.lock_account_on_failed_otp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lock account for 15 minutes if 5 or more failed attempts
  IF NEW.failed_otp_attempts >= 5 THEN
    NEW.account_locked_until = now() + interval '15 minutes';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically lock accounts after failed attempts
CREATE TRIGGER trigger_lock_account_on_failed_otp
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  WHEN (NEW.failed_otp_attempts > OLD.failed_otp_attempts)
  EXECUTE FUNCTION public.lock_account_on_failed_otp();