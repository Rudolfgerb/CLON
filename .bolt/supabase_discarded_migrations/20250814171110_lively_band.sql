/*
  # Campus System Database Schema

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty` (text)
      - `thumbnail` (text)
      - `color` (text)
      - `created_by` (uuid, foreign key to profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lessons`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses)
      - `title` (text)
      - `description` (text)
      - `content` (text)
      - `code_example` (text, optional)
      - `karma_reward` (integer)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lesson_media`
      - `id` (uuid, primary key)
      - `lesson_id` (uuid, foreign key to lessons)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `created_at` (timestamp)
    
    - `quizzes`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses)
      - `question` (text)
      - `options` (jsonb array)
      - `correct_answer` (integer)
      - `order_index` (integer)
      - `created_at` (timestamp)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `lesson_id` (uuid, foreign key to lessons)
      - `completed` (boolean)
      - `completed_at` (timestamp)
    
    - `user_quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `course_id` (uuid, foreign key to courses)
      - `score` (integer)
      - `total_questions` (integer)
      - `karma_earned` (integer)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for courses and lessons
    - User-specific access for progress and results
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'Anfänger',
  thumbnail text DEFAULT '📚',
  color text DEFAULT 'from-blue-500 to-blue-600',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  code_example text,
  karma_reward integer DEFAULT 25,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lesson_media table
CREATE TABLE IF NOT EXISTS lesson_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

-- Create user_quiz_results table
CREATE TABLE IF NOT EXISTS user_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  karma_earned integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies for courses (public read, authenticated create/update)
CREATE POLICY "Anyone can read courses"
  ON courses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for lessons (public read, course creator can manage)
CREATE POLICY "Anyone can read lessons"
  ON lessons
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Course creators can manage lessons"
  ON lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Policies for lesson_media (public read, lesson creator can manage)
CREATE POLICY "Anyone can read lesson media"
  ON lesson_media
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Lesson creators can manage media"
  ON lesson_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons 
      JOIN courses ON courses.id = lessons.course_id
      WHERE lessons.id = lesson_media.lesson_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Policies for quizzes (public read, course creator can manage)
CREATE POLICY "Anyone can read quizzes"
  ON quizzes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Course creators can manage quizzes"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = quizzes.course_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Policies for user_progress (users can only access their own)
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_quiz_results (users can only access their own)
CREATE POLICY "Users can read own quiz results"
  ON user_quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quiz results"
  ON user_quiz_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_media_lesson_id ON lesson_media(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user_id ON user_quiz_results(user_id);

-- Add updated_at trigger for courses
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger for lessons
CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();