/*
  # Add missing deliverables column to jobs table

  1. Changes
    - Add `deliverables` column to `jobs` table
    - Set as text type to store job deliverable descriptions
    - Allow null values as this field is optional

  2. Security
    - No RLS changes needed as jobs table policies remain the same
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deliverables'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deliverables text;
  END IF;
END $$;