/*
  # Fix missing columns in jobs table

  1. Changes
    - Ensure 'category' column exists in jobs table
    - Add any other potentially missing columns
    - Update indexes if needed

  2. Security
    - No changes to RLS policies needed
*/

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'category'
  ) THEN
    ALTER TABLE jobs ADD COLUMN category text NOT NULL DEFAULT 'other';
  END IF;
END $$;

-- Ensure all expected columns exist
DO $$
BEGIN
  -- Add job_type column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'job_type'
  ) THEN
    ALTER TABLE jobs ADD COLUMN job_type text NOT NULL DEFAULT 'cash' CHECK (job_type IN ('cash', 'karma'));
  END IF;

  -- Add karma_reward column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'karma_reward'
  ) THEN
    ALTER TABLE jobs ADD COLUMN karma_reward integer;
  END IF;

  -- Add tags column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'tags'
  ) THEN
    ALTER TABLE jobs ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add difficulty column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE jobs ADD COLUMN difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_difficulty ON jobs(difficulty);