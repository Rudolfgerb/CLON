/*
  # Add deadline and deliverables to jobs table

  1. New Columns
     - `deadline` (timestamp) - When the job should be completed
     - `deliverables` (text) - What should be delivered for the job

  2. Updates
     - Add new columns to existing jobs table
     - Set default values where appropriate
*/

DO $$
BEGIN
  -- Add deadline column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deadline'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deadline timestamptz;
  END IF;

  -- Add deliverables column if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deliverables'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deliverables text;
  END IF;
END $$;