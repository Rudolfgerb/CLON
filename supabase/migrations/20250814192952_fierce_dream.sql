/*
  # Add missing status column to jobs table

  1. Changes
    - Add `status` column to jobs table with default 'active'
    - Add index for better query performance
    - Update existing jobs to have 'active' status
*/

-- Add status column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'status'
  ) THEN
    ALTER TABLE jobs ADD COLUMN status text DEFAULT 'active';
    
    -- Add constraint to ensure valid status values
    ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
    CHECK (status IN ('active', 'completed', 'cancelled', 'expired'));
    
    -- Add index for better query performance
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    
    -- Update existing jobs to have active status
    UPDATE jobs SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;