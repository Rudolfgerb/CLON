-- Add lesson enhancements and tracking

-- Add new columns to lessons
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS difficulty_level text CHECK (difficulty_level IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS estimated_duration integer;

-- Table for lesson completions
CREATE TABLE IF NOT EXISTS lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  score integer,
  UNIQUE (lesson_id, user_id)
);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own completions" ON lesson_completions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Table for lesson ratings
CREATE TABLE IF NOT EXISTS lesson_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (lesson_id, user_id)
);

ALTER TABLE lesson_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ratings" ON lesson_ratings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_ratings_lesson ON lesson_ratings(lesson_id);
