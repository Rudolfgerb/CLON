/*
  # Fix Jobs Table Schema

  1. Table Updates
    - Rename `job_posts` to `jobs` if needed
    - Add missing columns for proper job management
    - Fix foreign key references
    - Add proper constraints

  2. Security
    - Enable RLS on jobs table
    - Add policies for job management

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create jobs table if it doesn't exist (or rename from job_posts)
DO $$
BEGIN
  -- Check if job_posts exists and jobs doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_posts') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
    ALTER TABLE job_posts RENAME TO jobs;
  END IF;
END $$;

-- Create jobs table if neither exists
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text,
  difficulty_level text DEFAULT 'medium',
  budget_type text NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),
  budget_amount numeric(10,2) NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('cash', 'karma', 'mixed')),
  cash_amount numeric(10,2) DEFAULT 0,
  karma_amount integer DEFAULT 0,
  additional_cash numeric(10,2) DEFAULT 0,
  additional_karma integer DEFAULT 0,
  deadline timestamp with time zone NOT NULL,
  expected_duration integer,
  time_commitment text CHECK (time_commitment IN ('part_time', 'full_time', 'flexible')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  deliverables text NOT NULL,
  requirements text[],
  title_image_url text,
  tags text[],
  attachment_urls text[],
  creator_id uuid NOT NULL REFERENCES profiles(id),
  assigned_to uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  assigned_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- Constraints
  CONSTRAINT future_deadline CHECK (deadline > created_at),
  CONSTRAINT valid_payment_amounts CHECK (
    (payment_type = 'cash' AND cash_amount > 0 AND karma_amount = 0) OR
    (payment_type = 'karma' AND karma_amount > 0 AND cash_amount = 0) OR
    (payment_type = 'mixed' AND (cash_amount > 0 OR karma_amount > 0))
  ),
  CONSTRAINT valid_additional_rewards CHECK (
    (payment_type = 'cash' AND additional_karma >= 0) OR
    (payment_type = 'karma' AND additional_cash >= 0) OR
    (payment_type = 'mixed' AND additional_cash >= 0 AND additional_karma >= 0)
  )
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add job_type column for compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'job_type'
  ) THEN
    ALTER TABLE jobs ADD COLUMN job_type text GENERATED ALWAYS AS (payment_type) STORED;
  END IF;

  -- Add hourly_rate and fixed_amount for compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE jobs ADD COLUMN hourly_rate numeric(10,2) GENERATED ALWAYS AS (
      CASE WHEN budget_type = 'hourly' THEN budget_amount ELSE NULL END
    ) STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'fixed_amount'
  ) THEN
    ALTER TABLE jobs ADD COLUMN fixed_amount numeric(10,2) GENERATED ALWAYS AS (
      CASE WHEN budget_type = 'fixed' THEN budget_amount ELSE NULL END
    ) STORED;
  END IF;

  -- Add karma_reward column for compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'karma_reward'
  ) THEN
    ALTER TABLE jobs ADD COLUMN karma_reward integer GENERATED ALWAYS AS (karma_amount) STORED;
  END IF;

  -- Add estimated_hours for compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'estimated_hours'
  ) THEN
    ALTER TABLE jobs ADD COLUMN estimated_hours integer DEFAULT 1;
  END IF;

  -- Add location column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'location'
  ) THEN
    ALTER TABLE jobs ADD COLUMN location text DEFAULT 'remote';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view public jobs" ON jobs;
CREATE POLICY "Anyone can view public jobs" 
  ON jobs FOR SELECT 
  USING (visibility = 'public' OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can create jobs" ON jobs;
CREATE POLICY "Users can create jobs" 
  ON jobs FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
CREATE POLICY "Users can update own jobs" 
  ON jobs FOR UPDATE 
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;
CREATE POLICY "Admins can manage all jobs" 
  ON jobs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_creator ON jobs(creator_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_difficulty ON jobs(difficulty_level);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();