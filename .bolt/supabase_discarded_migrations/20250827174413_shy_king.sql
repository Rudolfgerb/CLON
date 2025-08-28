/*
  # Fix RLS policies for profiles table

  1. Problem Resolution
    - Remove recursive policies causing infinite loops
    - Create simple, safe RLS policies
    - Ensure proper user access controls

  2. Security
    - Users can read their own profile
    - Users can update their own profile  
    - Admins can read all profiles
    - Admins can update all profiles
    - Public read access for basic profile info

  3. Changes
    - Drop all existing policies
    - Create new non-recursive policies
    - Enable RLS on profiles table
*/

-- Drop all existing policies to prevent recursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable public read access"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

-- Simple admin policies using direct role check
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles"  
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );