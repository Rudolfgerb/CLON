/*
  # Add fixed_amount column to jobs table

  1. Changes
    - Add `fixed_amount` column to `jobs` table
    - Column type: numeric(10,2) to match other monetary fields
    - Allow NULL values since not all jobs will use fixed pricing

  2. Notes
    - This column is used for jobs with fixed pricing instead of hourly rates
    - Existing jobs will have NULL values for this column
*/

-- Add fixed_amount column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'fixed_amount'
  ) THEN
    ALTER TABLE jobs ADD COLUMN fixed_amount numeric(10,2);
  END IF;
END $$;