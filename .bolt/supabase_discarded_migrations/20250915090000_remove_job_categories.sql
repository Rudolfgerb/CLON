-- Remove job categories and related references
DROP INDEX IF EXISTS idx_job_posts_category_id;

ALTER TABLE IF EXISTS job_posts DROP COLUMN IF EXISTS category_id;

DROP POLICY IF EXISTS "Public can view active categories" ON job_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON job_categories;

DROP TABLE IF EXISTS job_categories;
