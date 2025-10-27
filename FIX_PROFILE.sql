-- Fix missing profile for shweta.finalnd@gmail.com
-- Run this in Supabase SQL Editor

-- First, let's check if the user exists in auth
SELECT id, email FROM auth.users WHERE email = 'shweta.finalnd@gmail.com';

-- If the query above returns a user ID, copy it and use it below
-- Then run this to create the missing profile:

-- IMPORTANT: Replace 'USER_ID_HERE' with the actual ID from the query above
-- Example: If the ID is '123e4567-e89b-12d3-a456-426614174000', replace it below

INSERT INTO profiles (
  id,
  email,
  full_name,
  total_points,
  total_xp,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_HERE',  -- Replace this with your actual user ID from above
  'shweta.finalnd@gmail.com',
  'Shweta',
  0,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Verify the profile was created
SELECT * FROM profiles WHERE email = 'shweta.finalnd@gmail.com';
