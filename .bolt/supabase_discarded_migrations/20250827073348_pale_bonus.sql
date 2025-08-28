/*
  # Complete Database Structure for Mutuus App

  ## 1. Core Tables
  - `profiles`: User profiles with karma, premium status, and wallet info
  - `jobs`: Job listings with cash/karma payment types
  - `applications`: Job applications from users
  - `user_wallets`: User balance and transaction history
  - `karma_transactions`: Karma-related transactions

  ## 2. Stripe Tables
  - `stripe_customers`: Maps users to Stripe customer IDs
  - `stripe_subscriptions`: Active subscriptions tracking
  - `stripe_orders`: Payment history and order details

  ## 3. Notification System
  - `notifications`: User notifications for various events

  ## 4. Security
  - Enable RLS on all tables
  - Policies for user data access
  - Admin policies where needed

  ## 5. Functions
  - `process_karma_purchase`: Handle karma purchases via Stripe
  - `calculate_job_commission`: Calculate commission fees
  - `update_premium_status`: Update user premium status
  - `handle_job_completion`: Process job completion payments

  ## 6. Triggers
  - Auto-update timestamps on record changes
  - Auto-create wallet on profile creation
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (Enhanced)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT 'Mutuus User',
  bio text DEFAULT '',
  website text DEFAULT '',
  avatar_url text DEFAULT '',
  karma integer DEFAULT 100,
  level integer DEFAULT 1,
  premium boolean DEFAULT false,
  premium_expires_at timestamptz DEFAULT NULL,
  total_jobs_completed integer DEFAULT 0,
  total_earnings numeric(10,2) DEFAULT 0.00,
  rating numeric(2,1) DEFAULT 5.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. JOBS TABLE (Enhanced)
-- =====================================================

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'other',
  location text DEFAULT 'remote',
  job_type text CHECK (job_type IN ('cash', 'karma')) DEFAULT 'cash',
  hourly_rate numeric(8,2) DEFAULT NULL,
  fixed_amount numeric(10,2) DEFAULT NULL,
  karma_reward integer DEFAULT NULL,
  estimated_hours integer DEFAULT 1,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  tags text[] DEFAULT '{}',
  requirements text DEFAULT '',
  deliverables text DEFAULT '',
  status text CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')) DEFAULT 'active',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT NULL,
  completed_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. APPLICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  hourly_rate numeric(8,2) DEFAULT NULL,
  estimated_hours integer DEFAULT NULL,
  experience text DEFAULT '',
  portfolio text DEFAULT '',
  status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. USER WALLETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance_euros numeric(10,2) DEFAULT 0.00,
  pending_euros numeric(10,2) DEFAULT 0.00,
  total_earned numeric(10,2) DEFAULT 0.00,
  total_spent numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. KARMA TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS karma_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text CHECK (transaction_type IN ('karma_to_money', 'money_to_karma', 'job_reward', 'daily_bonus', 'achievement_bonus', 'purchase')) DEFAULT 'purchase',
  karma_amount integer NOT NULL,
  money_amount numeric(8,2) DEFAULT 0.00,
  exchange_rate numeric(6,4) DEFAULT 0.00,
  status text CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
  description text DEFAULT '',
  stripe_payment_intent_id text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. STRIPE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id text NOT NULL UNIQUE,
  customer_id text NOT NULL,
  status text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  checkout_session_id text NOT NULL UNIQUE,
  customer_id text NOT NULL,
  amount_total integer NOT NULL,
  payment_status text NOT NULL,
  status text CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  product_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 7. COMMISSION TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_amount numeric(10,2) NOT NULL,
  commission_rate numeric(5,4) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  net_amount numeric(10,2) NOT NULL,
  is_premium_rate boolean DEFAULT false,
  status text CHECK (status IN ('pending', 'processed', 'paid_out')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz DEFAULT NULL
);

-- =====================================================
-- 8. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  expires_at timestamptz DEFAULT NULL,
  action_url text DEFAULT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 9. USER ACTIVITY LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}',
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_user_id ON karma_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT TO authenticated USING (status = 'active');
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Job owners can update their jobs" ON jobs FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Applications policies
CREATE POLICY "Users can view own applications" ON applications FOR SELECT TO authenticated USING (auth.uid() = applicant_id);
CREATE POLICY "Job owners can view applications for their jobs" ON applications FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT created_by FROM jobs WHERE jobs.id = applications.job_id)
);
CREATE POLICY "Users can create applications" ON applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Job owners can update application status" ON applications FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT created_by FROM jobs WHERE jobs.id = applications.job_id)
);

-- Wallets policies
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON user_wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own wallet" ON user_wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Karma transactions policies
CREATE POLICY "Users can view own karma transactions" ON karma_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create karma transactions" ON karma_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Stripe tables policies
CREATE POLICY "Users can view own stripe data" ON stripe_customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stripe data" ON stripe_customers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON stripe_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON stripe_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON stripe_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON stripe_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON stripe_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Commission transactions policies
CREATE POLICY "Users can view own commissions" ON commission_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commissions" ON commission_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view own activity" ON user_activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON user_activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to process karma purchases
CREATE OR REPLACE FUNCTION process_karma_purchase(
  user_id uuid,
  karma_amount integer,
  payment_amount numeric,
  stripe_payment_intent_id text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Add karma to user profile
  UPDATE profiles 
  SET 
    karma = karma + karma_amount,
    updated_at = now()
  WHERE id = user_id;

  -- Record karma transaction
  INSERT INTO karma_transactions (
    user_id,
    transaction_type,
    karma_amount,
    money_amount,
    exchange_rate,
    description,
    stripe_payment_intent_id
  ) VALUES (
    user_id,
    'purchase',
    karma_amount,
    payment_amount,
    payment_amount / karma_amount,
    format('Purchased %s karma for €%s', karma_amount, payment_amount),
    stripe_payment_intent_id
  );

  -- Log activity
  INSERT INTO user_activity_logs (user_id, activity_type, activity_data)
  VALUES (user_id, 'karma_purchase', jsonb_build_object(
    'karma_amount', karma_amount,
    'payment_amount', payment_amount
  ));

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, category)
  VALUES (user_id, 'karma_purchase', 'Karma erhalten!', 
          format('%s Karma Punkte wurden Ihrem Konto gutgeschrieben.', karma_amount), 
          'payment');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate job commission
CREATE OR REPLACE FUNCTION calculate_job_commission(
  job_amount numeric,
  is_premium boolean DEFAULT false
) RETURNS TABLE(
  gross_amount numeric,
  commission_rate numeric,
  commission_amount numeric,
  net_amount numeric
) AS $$
DECLARE
  rate numeric := CASE WHEN is_premium THEN 0.05 ELSE 0.098 END;
  commission numeric;
BEGIN
  commission := job_amount * rate;
  
  RETURN QUERY SELECT
    job_amount,
    rate,
    commission,
    job_amount - commission;
END;
$$ LANGUAGE plpgsql;

-- Function to update premium status
CREATE OR REPLACE FUNCTION update_premium_status(
  user_id uuid,
  is_premium boolean,
  expires_at timestamptz DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    premium = is_premium,
    premium_expires_at = expires_at,
    updated_at = now()
  WHERE id = user_id;

  -- Log activity
  INSERT INTO user_activity_logs (user_id, activity_type, activity_data)
  VALUES (user_id, 'premium_status_change', jsonb_build_object(
    'is_premium', is_premium,
    'expires_at', expires_at
  ));

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, category)
  VALUES (user_id, 'premium_update', 
          CASE WHEN is_premium THEN 'Premium aktiviert!' ELSE 'Premium deaktiviert' END,
          CASE WHEN is_premium THEN 'Ihr Premium Zugang wurde aktiviert. Sie zahlen jetzt nur 5% Provision!' 
               ELSE 'Ihr Premium Zugang ist abgelaufen.' END,
          'subscription');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle job completion
CREATE OR REPLACE FUNCTION handle_job_completion(
  job_id uuid,
  final_amount numeric
) RETURNS void AS $$
DECLARE
  job_record jobs%ROWTYPE;
  freelancer_premium boolean;
  commission_calc record;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM jobs WHERE id = job_id;
  
  IF job_record.assigned_to IS NULL THEN
    RAISE EXCEPTION 'Job has no assigned freelancer';
  END IF;

  -- Get freelancer premium status
  SELECT premium INTO freelancer_premium 
  FROM profiles WHERE id = job_record.assigned_to;

  -- Calculate commission
  SELECT * INTO commission_calc 
  FROM calculate_job_commission(final_amount, freelancer_premium);

  -- Record commission transaction
  INSERT INTO commission_transactions (
    job_id,
    user_id,
    gross_amount,
    commission_rate,
    commission_amount,
    net_amount,
    is_premium_rate,
    status
  ) VALUES (
    job_id,
    job_record.assigned_to,
    commission_calc.gross_amount,
    commission_calc.commission_rate,
    commission_calc.commission_amount,
    commission_calc.net_amount,
    freelancer_premium,
    'processed'
  );

  -- Update user wallet
  UPDATE user_wallets 
  SET 
    balance_euros = balance_euros + commission_calc.net_amount,
    total_earned = total_earned + commission_calc.net_amount,
    updated_at = now()
  WHERE user_id = job_record.assigned_to;

  -- Update job status
  UPDATE jobs 
  SET 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  WHERE id = job_id;

  -- Update profile stats
  UPDATE profiles 
  SET 
    total_jobs_completed = total_jobs_completed + 1,
    total_earnings = total_earnings + commission_calc.net_amount,
    updated_at = now()
  WHERE id = job_record.assigned_to;

  -- Create notifications
  INSERT INTO notifications (user_id, type, title, message, category) VALUES
    (job_record.assigned_to, 'job_completed', 'Job abgeschlossen!', 
     format('Sie haben €%s für "%s" erhalten (€%s Provision abgezogen).', 
            commission_calc.net_amount, job_record.title, commission_calc.commission_amount), 
     'payment'),
    (job_record.created_by, 'job_completed', 'Job wurde abgeschlossen!',
     format('"%s" wurde erfolgreich abgeschlossen.', job_record.title),
     'job');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stripe_subscriptions_updated_at BEFORE UPDATE ON stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stripe_orders_updated_at BEFORE UPDATE ON stripe_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallet on profile creation
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create wallet
CREATE TRIGGER create_wallet_on_profile AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert some sample jobs for testing
INSERT INTO jobs (title, description, category, job_type, fixed_amount, karma_reward, estimated_hours, created_by)
VALUES 
  ('React Komponente erstellen', 'Erstelle eine wiederverwendbare React Komponente für unser Dashboard', 'development', 'cash', 150.00, NULL, 8, (SELECT id FROM auth.users LIMIT 1)),
  ('Logo Design', 'Kreatives Logo für Startup gesucht', 'design', 'karma', NULL, 200, 4, (SELECT id FROM auth.users LIMIT 1)),
  ('SEO Optimierung', 'Website SEO verbessern und Keywords optimieren', 'marketing', 'cash', 75.00, NULL, 3, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;