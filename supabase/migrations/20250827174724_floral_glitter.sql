/*
  # Add combined payment fields to jobs table

  1. Table Changes
    - Add `additional_karma` field for cash jobs offering bonus karma
    - Add `additional_cash` field for karma jobs offering bonus money
    - Add `deadline` field for job deadlines
    - Add `title_image_url` field for job cover images

  2. Features
    - Support for combined payment types (cash + karma or karma + cash)
    - Job deadline tracking
    - Media management with title images
*/

-- Add new fields to jobs table
DO $$
BEGIN
  -- Add deadline field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deadline'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deadline timestamptz;
  END IF;

  -- Add additional karma field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'additional_karma'
  ) THEN
    ALTER TABLE jobs ADD COLUMN additional_karma integer;
  END IF;

  -- Add additional cash field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'additional_cash'
  ) THEN
    ALTER TABLE jobs ADD COLUMN additional_cash numeric(10,2);
  END IF;

  -- Add title image URL field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'title_image_url'
  ) THEN
    ALTER TABLE jobs ADD COLUMN title_image_url text;
  END IF;

  -- Add media URLs array field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE jobs ADD COLUMN media_urls text[] DEFAULT '{}';
  END IF;
END $$;