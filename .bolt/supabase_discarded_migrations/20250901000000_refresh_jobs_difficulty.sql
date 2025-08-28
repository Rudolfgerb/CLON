/*
  # Ensure difficulty column exists in jobs and refresh schema cache

  1. Changes
    - Add `difficulty` column to `jobs` table if missing
    - Refresh PostgREST schema cache

  2. Security
    - No changes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE jobs
      ADD COLUMN difficulty text NOT NULL DEFAULT 'medium'
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END $$;

-- Refresh PostgREST schema cache so the new column is recognized
NOTIFY pgrst, 'reload schema';
