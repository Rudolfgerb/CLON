/*
  # Create Admin Functions

  1. Functions
    - `is_admin` - Check if user has admin privileges
    - `get_admin_statistics` - Get platform statistics

  2. Security
    - Functions use security definer for elevated permissions
*/

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- Function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_statistics()
RETURNS TABLE (
  total_users bigint,
  new_users_30d bigint,
  premium_users bigint,
  active_jobs bigint,
  completed_jobs bigint,
  total_karma bigint,
  commission_30d numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM profiles WHERE premium = true) as premium_users,
    (SELECT COUNT(*) FROM jobs WHERE status = 'open') as active_jobs,
    (SELECT COUNT(*) FROM jobs WHERE status = 'completed') as completed_jobs,
    (SELECT SUM(karma) FROM profiles) as total_karma,
    (SELECT COALESCE(SUM(commission_amount), 0) FROM commission_transactions WHERE created_at > NOW() - INTERVAL '30 days') as commission_30d;
END;
$$;