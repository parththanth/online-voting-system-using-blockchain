
-- Check current phone number formats in the users table
SELECT phone_number, COUNT(*) as count 
FROM public.users 
WHERE phone_number IS NOT NULL 
GROUP BY phone_number;

-- Update any phone numbers that don't have the correct +91 format for Indian numbers
UPDATE public.users 
SET phone_number = CASE 
  -- If it's a 10-digit number, add +91
  WHEN phone_number ~ '^[0-9]{10}$' THEN '+91' || phone_number
  -- If it starts with 91 and has 12 digits total, add +
  WHEN phone_number ~ '^91[0-9]{10}$' THEN '+' || phone_number
  -- If it already has +91, keep it as is
  WHEN phone_number ~ '^\+91[0-9]{10}$' THEN phone_number
  -- Default case: keep as is
  ELSE phone_number
END
WHERE phone_number IS NOT NULL 
AND phone_number !~ '^\+91[0-9]{10}$';
