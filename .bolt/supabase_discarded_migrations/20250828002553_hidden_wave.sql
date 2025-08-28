/*
  # Fix RLS Infinite Recursion

  1. Problem
    - Circular dependencies between profiles and user_admin_roles policies
    - Infinite recursion when checking admin permissions

  2. Solution  
    - Remove circular policy dependencies
    - Simplify admin role checks using direct queries
    - Use SECURITY DEFINER functions for complex admin logic
    - Create safe, non-recursive policies

  3. Changes
    - Drop existing problematic policies
    - Create simplified, direct policies
    - Add helper functions to avoid recursion
*/

-- First, drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can manage admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Only admins can manage user admin roles" ON user_admin_roles;

-- Create a SECURITY DEFINER function to check admin status safely
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  check_user_id UUID;
  is_admin_user BOOLEAN := false;
BEGIN
  -- Use provided UUID or current user
  check_user_id := COALESCE(user_uuid, auth.uid());
  
  -- Return false if no user
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Simple direct query without RLS to avoid recursion
  SELECT EXISTS (
    SELECT 1 FROM user_admin_roles uar
    JOIN admin_roles ar ON uar.role_id = ar.id
    WHERE uar.user_id = check_user_id
    AND ar.name IN ('admin', 'super_admin')
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$$;

-- Create a function to check specific admin permissions
CREATE OR REPLACE FUNCTION has_admin_permission(permission_name TEXT, user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  check_user_id UUID;
  has_permission BOOLEAN := false;
BEGIN
  check_user_id := COALESCE(user_uuid, auth.uid());
  
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM user_admin_roles uar
    JOIN admin_roles ar ON uar.role_id = ar.id
    WHERE uar.user_id = check_user_id
    AND (ar.permissions ? permission_name OR ar.name = 'super_admin')
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;

-- Recreate simplified policies for profiles table
CREATE POLICY "Enable read access for all users" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (is_admin());

-- Recreate simplified policies for admin_roles table
CREATE POLICY "Authenticated users can view admin roles" ON admin_roles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only super admins can manage admin roles" ON admin_roles
FOR ALL USING (has_admin_permission('manage_roles'));

-- Recreate simplified policies for user_admin_roles table  
CREATE POLICY "Users can view own admin roles" ON user_admin_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user admin roles" ON user_admin_roles
FOR SELECT USING (is_admin());

CREATE POLICY "Only super admins can manage user admin roles" ON user_admin_roles
FOR ALL USING (has_admin_permission('manage_users'));

-- Fix any other tables that might have circular dependencies
-- Simplify jobs table policies
DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;
CREATE POLICY "Admins can manage all jobs" ON jobs
FOR ALL USING (is_admin());

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_admin_permission(TEXT, UUID) TO authenticated;