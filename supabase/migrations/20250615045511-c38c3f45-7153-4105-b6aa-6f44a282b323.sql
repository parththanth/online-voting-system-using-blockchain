
-- Add phone number column to users table
ALTER TABLE public.users ADD COLUMN phone_number TEXT;

-- Create unique index for phone numbers (allowing nulls for existing users)
CREATE UNIQUE INDEX idx_users_phone_number ON public.users(phone_number) WHERE phone_number IS NOT NULL;

-- Update OTP rate limiting table to work with phone numbers
ALTER TABLE public.otp_rate_limits ADD COLUMN phone_number TEXT;

-- Add constraint to ensure either email or phone is provided for rate limiting
ALTER TABLE public.otp_rate_limits ADD CONSTRAINT check_email_or_phone 
  CHECK ((email IS NOT NULL AND phone_number IS NULL) OR (email IS NULL AND phone_number IS NOT NULL));

-- Update security alerts to include phone number
ALTER TABLE public.security_alerts ADD COLUMN user_phone TEXT;

-- Create index for phone number lookups
CREATE INDEX idx_users_phone_lookup ON public.users(phone_number) WHERE phone_number IS NOT NULL;
