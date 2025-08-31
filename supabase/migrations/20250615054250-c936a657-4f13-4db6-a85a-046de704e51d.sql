
-- Make the email column nullable to support phone-based authentication
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Drop the existing unique constraint on email (not just the index)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;

-- Create a unique index that allows nulls for email but still ensures uniqueness for non-null emails
CREATE UNIQUE INDEX users_email_unique ON public.users(email) WHERE email IS NOT NULL;

-- Also ensure phone numbers are unique when they exist
CREATE UNIQUE INDEX users_phone_unique ON public.users(phone_number) WHERE phone_number IS NOT NULL;
