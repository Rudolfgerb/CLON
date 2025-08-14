/*
  # Create jobs table for cash and karma jobs

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text, job title)
      - `description` (text, job description)
      - `category` (text, job category)
      - `location` (text, work location)
      - `job_type` (text, 'cash' or 'karma')
      - `hourly_rate` (decimal, for cash jobs)
      - `estimated_hours` (integer, estimated work hours)
      - `total_payment` (decimal, calculated total)
      - `karma_reward` (integer, for karma jobs)
      - `difficulty` (text, 'easy', 'medium', 'hard')
      - `tags` (jsonb, array of skill tags)
      - `requirements` (text, job requirements)
      - `deliverables` (text, expected deliverables)
      - `status` (text, 'active', 'completed', 'cancelled')
      - `expires_at` (timestamp, auto-deletion time)
      - `created_by` (uuid, creator user id)
      - `assigned_to` (uuid, assigned user id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for public read access
    - Add policies for authenticated users to create jobs
    - Add policies for job creators to manage their jobs
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  location text NOT NULL DEFAULT 'remote',
  job_type text NOT NULL CHECK (job_type IN ('cash', 'karma')),
  hourly_rate decimal(10,2),
  estimated_hours integer,
  total_payment decimal(10,2),
  karma_reward integer,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags jsonb DEFAULT '[]'::jsonb,
  requirements text,
  deliverables text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled', 'expired')),
  expires_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies for jobs table
CREATE POLICY "Anyone can read active jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Authenticated users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Job creators can manage their jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Assigned users can read their jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = assigned_to);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to automatically expire jobs
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS void AS $$
BEGIN
  UPDATE jobs 
  SET status = 'expired' 
  WHERE status = 'active' 
    AND expires_at IS NOT NULL 
    AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job or trigger to run expire_old_jobs() periodically