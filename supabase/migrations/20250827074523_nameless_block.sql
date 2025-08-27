/*
  # Admin System Setup

  1. New Tables
    - `admin_roles` - Stores admin role definitions
    - `user_admin_roles` - Links users to admin roles
    
  2. Updates to Existing Tables
    - Add `role` column to `profiles` table for basic role management
    
  3. Security
    - Enable RLS on new tables
    - Add policies for admin access control
    - Create function to check admin permissions
    
  4. Functions
    - `is_admin()` - Check if current user is admin
    - `has_admin_permission()` - Check specific admin permissions
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_admin_roles table
CREATE TABLE IF NOT EXISTS user_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_roles ENABLE ROW LEVEL SECURITY;

-- Create admin check functions
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND (role = 'admin' OR role = 'super_admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION has_admin_permission(permission_name text, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin has all permissions
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'super_admin') THEN
    RETURN true;
  END IF;
  
  -- Check role-based permissions
  RETURN EXISTS (
    SELECT 1 
    FROM user_admin_roles uar
    JOIN admin_roles ar ON uar.role_id = ar.id
    WHERE uar.user_id = user_id
    AND ar.permissions ? permission_name
    AND (ar.permissions->permission_name)::boolean = true
  );
END;
$$;

-- Insert default admin roles
INSERT INTO admin_roles (name, description, permissions) VALUES
('super_admin', 'Super Administrator with all permissions', '{
  "manage_users": true,
  "manage_jobs": true,
  "manage_courses": true,
  "manage_payments": true,
  "manage_system": true,
  "view_analytics": true,
  "manage_admins": true
}'::jsonb),
('job_manager', 'Manage jobs and applications', '{
  "manage_jobs": true,
  "view_analytics": true
}'::jsonb),
('course_manager', 'Manage courses and lessons', '{
  "manage_courses": true,
  "view_analytics": true
}'::jsonb),
('user_support', 'User support and basic management', '{
  "manage_users": true,
  "view_analytics": true
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- RLS Policies
CREATE POLICY "Admins can read admin_roles"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Super admins can manage admin_roles"
  ON admin_roles
  FOR ALL
  TO authenticated
  USING (has_admin_permission('manage_admins'));

CREATE POLICY "Admins can read user_admin_roles"
  ON user_admin_roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Super admins can manage user_admin_roles"
  ON user_admin_roles
  FOR ALL
  TO authenticated
  USING (has_admin_permission('manage_admins'));

-- Create admin stats view
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM jobs WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_jobs_30d,
  (SELECT COUNT(*) FROM applications WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_applications_30d,
  (SELECT COALESCE(SUM(commission_amount), 0) FROM commission_transactions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as commission_30d,
  (SELECT COUNT(*) FROM profiles WHERE premium = true) as premium_users,
  (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COALESCE(SUM(balance_euros), 0) FROM user_wallets) as total_wallet_balance;

-- Grant access to admin stats for admins
CREATE POLICY "Admins can view stats"
  ON admin_stats
  FOR SELECT
  TO authenticated
  USING (is_admin());