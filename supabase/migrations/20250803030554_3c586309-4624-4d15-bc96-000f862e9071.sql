-- Clear all existing face enrollment data to start fresh
TRUNCATE TABLE face_enrollment CASCADE;

-- Clear face embedding data from users table  
UPDATE users SET face_embedding = NULL, face_verified = false;