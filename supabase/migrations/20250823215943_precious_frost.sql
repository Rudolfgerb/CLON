/*
  # Complete RLS Policy Rebuild for Jobs Table

  This migration completely rebuilds the RLS policies for the jobs table to eliminate
  infinite recursion errors. The new policies are simple and avoid any circular dependencies.

  ## Changes Made:
  1. Drop all existing policies on jobs table
  2. Create simple, non-recursive policies
  3. Ensure no circular dependencies with other tables
  4. Use direct auth.uid() comparisons only

  ## Security:
  - Public can read active jobs
  - Users can create jobs
  - Users can manage their own jobs
  - No complex joins that could cause recursion
*/

-- Drop all existing policies on jobs table
DROP POLICY IF EXISTS "Applicants can read applied jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Job creators can manage their own jobs" ON jobs;
DROP POLICY IF EXISTS "Public can read active jobs" ON jobs;

-- Create simple, non-recursive policies
CREATE POLICY "jobs_public_read" ON jobs
  FOR SELECT
  TO public
  USING (
    status = 'active' 
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "jobs_authenticated_create" ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "jobs_owner_all" ON jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Ensure RLS is enabled
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;