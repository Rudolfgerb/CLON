/*
  # Fix Jobs Database Structure and RLS Policies

  1. Database Structure
    - Jobs table should be publicly readable for active jobs
    - Only authenticated users can create jobs
    - Only job creators can manage their own jobs
    - Applications are private between job creator and applicant

  2. Security Policies
    - Public can read active, non-expired jobs
    - Authenticated users can create jobs (must set created_by to their own ID)
    - Job creators can update/delete their own jobs
    - Applicants can read jobs they applied to

  3. Data Access Logic
    - Anonymous users: can browse active jobs
    - Authenticated users: can browse all jobs + create/manage their own
    - Job creators: can see applications for their jobs
    - Applicants: can see their own applications
*/

-- First, let's ensure the jobs table has the right structure
ALTER TABLE jobs 
  ALTER COLUMN created_by SET NOT NULL,
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can read active jobs" ON jobs;
DROP POLICY IF EXISTS "Assigned users can read their jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Job creators can manage their jobs" ON jobs;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON jobs;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON jobs;

-- Create comprehensive RLS policies for jobs table

-- 1. PUBLIC READ: Anyone (including anonymous) can read active, non-expired jobs
CREATE POLICY "Public can read active jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (
    status = 'active' 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- 2. AUTHENTICATED CREATE: Authenticated users can create jobs
CREATE POLICY "Authenticated users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
  );

-- 3. CREATOR MANAGEMENT: Job creators can read, update, and delete their own jobs
CREATE POLICY "Job creators can manage their own jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 4. APPLICANT ACCESS: Users can read jobs they have applied to
CREATE POLICY "Applicants can read jobs they applied to"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.job_id = jobs.id 
      AND applications.applicant_id = auth.uid()
    )
  );

-- Fix applications table policies
DROP POLICY IF EXISTS "Users can create applications" ON applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can view applications for their jobs" ON applications;
DROP POLICY IF EXISTS "Job creators can update application status" ON applications;

-- Applications policies
CREATE POLICY "Users can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = applicant_id
    AND EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_id 
      AND jobs.status = 'active'
      AND (jobs.expires_at IS NULL OR jobs.expires_at > now())
    )
  );

CREATE POLICY "Users can read their own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = applicant_id);

CREATE POLICY "Job creators can read applications for their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

CREATE POLICY "Job creators can update application status"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

-- Fix notifications policies
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Authenticated users can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to create notifications

CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_public_listing 
  ON jobs (status, expires_at, created_at DESC) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_jobs_creator 
  ON jobs (created_by, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_applicant 
  ON applications (job_id, applicant_id);

-- Add helpful functions for job management
CREATE OR REPLACE FUNCTION get_job_with_application_count(job_id uuid)
RETURNS TABLE (
  job_data jsonb,
  application_count bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    to_jsonb(jobs.*) as job_data,
    COUNT(applications.id) as application_count
  FROM jobs
  LEFT JOIN applications ON jobs.id = applications.job_id
  WHERE jobs.id = job_id
  AND (
    -- Public can see active jobs
    (jobs.status = 'active' AND (jobs.expires_at IS NULL OR jobs.expires_at > now()))
    OR 
    -- Job creator can see their own jobs
    (auth.uid() = jobs.created_by)
    OR
    -- Applicants can see jobs they applied to
    (auth.uid() IN (SELECT applicant_id FROM applications WHERE job_id = jobs.id))
  )
  GROUP BY jobs.id;
$$;

-- Function to check if user can apply to job
CREATE OR REPLACE FUNCTION can_apply_to_job(job_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM jobs
    WHERE id = job_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    AND created_by != auth.uid() -- Can't apply to own job
    AND NOT EXISTS (
      SELECT 1 FROM applications 
      WHERE job_id = jobs.id 
      AND applicant_id = auth.uid()
    ) -- Haven't already applied
  );
$$;