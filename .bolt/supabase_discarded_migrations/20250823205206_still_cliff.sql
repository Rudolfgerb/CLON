/*
  # Fix Jobs Table RLS Infinite Recursion

  1. Problem
    - The current RLS policies on the jobs table create infinite recursion
    - Policies reference other tables that reference back to jobs table
    - This causes circular dependency in policy evaluation

  2. Solution
    - Drop all existing problematic policies
    - Create simplified, non-recursive policies
    - Use direct user ID comparisons instead of complex joins
    - Avoid subqueries that could cause recursion

  3. New Policies
    - Public can read active, non-expired jobs
    - Authenticated users can create jobs (with user ID check)
    - Job creators can manage their own jobs
    - Applicants can read jobs they applied to (simplified)
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Public can read active jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Job creators can manage their own jobs" ON jobs;
DROP POLICY IF EXISTS "Applicants can read jobs they applied to" ON jobs;

-- Create simplified, non-recursive policies

-- 1. Public can read active, non-expired jobs (no recursion)
CREATE POLICY "Public can read active jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (
    status = 'active' 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- 2. Authenticated users can create jobs (simple user check)
CREATE POLICY "Authenticated users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 3. Job creators can manage their own jobs (direct user comparison)
CREATE POLICY "Job creators can manage their own jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 4. Simplified policy for applicants to read jobs they applied to
-- This avoids the recursive join by using a simpler approach
CREATE POLICY "Applicants can read applied jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user created the job
    auth.uid() = created_by
    OR
    -- Allow if job is active (public access)
    (status = 'active' AND (expires_at IS NULL OR expires_at > now()))
    OR
    -- Allow if user is assigned to the job
    auth.uid() = assigned_to
  );

-- Note: For checking if a user applied to a job, we'll handle this in the application layer
-- instead of in RLS policies to avoid recursion issues