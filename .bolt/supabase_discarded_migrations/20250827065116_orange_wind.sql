/*
  # Core Mutuus Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `jobs` - Job postings (cash and karma)
    - `applications` - Job applications
    - `courses` - Learning courses
    - `lessons` - Course lessons
    - `user_progress` - Learning progress tracking
    - `notifications` - User notifications
    - `stripe_customers` - Stripe customer mapping
    - `stripe_subscriptions` - Subscription management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT 'Mutuus User',
  bio text DEFAULT '',
  website text DEFAULT '',
  twitter text DEFAULT '',
  instagram text DEFAULT '',
  avatar_url text DEFAULT '',
  karma integer DEFAULT 100,
  level integer DEFAULT 1,
  premium boolean DEFAULT false,
  login_streak integer DEFAULT 0,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  location text NOT NULL DEFAULT 'remote',
  job_type text NOT NULL CHECK (job_type IN ('cash', 'karma')),
  hourly_rate decimal(10,2),
  estimated_hours integer,
  fixed_amount decimal(10,2),
  total_payment decimal(10,2),
  karma_reward integer,
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags text[] DEFAULT '{}',
  requirements text DEFAULT '',
  deliverables text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  expires_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  hourly_rate decimal(10,2),
  estimated_hours integer,
  experience text DEFAULT '',
  portfolio text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'development',
  difficulty text NOT NULL DEFAULT 'beginner',
  thumbnail text DEFAULT '',
  color text DEFAULT 'from-blue-500 to-blue-600',
  karma_reward integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  code_example text,
  karma_reward integer DEFAULT 10,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  difficulty_level text DEFAULT 'beginner',
  estimated_duration integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(user_id)
);

-- Stripe subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  subscription_id text UNIQUE,
  price_id text,
  status text NOT NULL DEFAULT 'not_started',
  current_period_start integer,
  current_period_end integer,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(customer_id)
);

-- Stripe orders table (for one-time payments)
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id text NOT NULL UNIQUE,
  payment_intent_id text,
  customer_id text NOT NULL REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  amount_subtotal integer NOT NULL,
  amount_total integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  payment_status text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT TO authenticated USING (status = 'active');
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Applications policies
CREATE POLICY "Users can view applications for their jobs" ON applications FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid()));
CREATE POLICY "Users can view their own applications" ON applications FOR SELECT TO authenticated 
  USING (auth.uid() = applicant_id);
CREATE POLICY "Users can create applications" ON applications FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Job owners can update applications" ON applications FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid()));

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Users can create courses" ON courses FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Lessons policies
CREATE POLICY "Anyone can view published lessons" ON lessons FOR SELECT TO authenticated USING (is_published = true);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Stripe policies
CREATE POLICY "Users can view own stripe data" ON stripe_customers FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON stripe_subscriptions FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM stripe_customers WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id AND stripe_customers.user_id = auth.uid()));
CREATE POLICY "Users can view own orders" ON stripe_orders FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM stripe_customers WHERE stripe_customers.customer_id = stripe_orders.customer_id AND stripe_customers.user_id = auth.uid()));

-- Functions
CREATE OR REPLACE FUNCTION can_apply_to_job(job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if job exists and is active
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = 'active') THEN
    RETURN false;
  END IF;
  
  -- Check if user is not the job creator
  IF EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND created_by = auth.uid()) THEN
    RETURN false;
  END IF;
  
  -- Check if user hasn't already applied
  IF EXISTS (SELECT 1 FROM applications WHERE job_id = can_apply_to_job.job_id AND applicant_id = auth.uid()) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Insert sample data
INSERT INTO courses (id, title, description, category, difficulty, thumbnail, color, karma_reward, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'React Grundlagen', 'Lerne die Basics von React', 'development', 'beginner', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400', 'from-blue-500 to-blue-600', 150, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (course_id, title, description, content, karma_reward, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Was ist React?', 'Einführung in React', 'React ist eine JavaScript-Bibliothek...', 25, 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'Komponenten erstellen', 'Erste React Komponente', 'Komponenten sind die Bausteine...', 25, 2)
ON CONFLICT DO NOTHING;