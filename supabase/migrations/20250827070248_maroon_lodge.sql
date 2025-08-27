/*
  # Stripe Integration Tables

  1. New Tables
    - `stripe_customers` - Maps Supabase users to Stripe customers
    - `stripe_subscriptions` - Tracks premium subscriptions
    - `stripe_orders` - Records one-time payments (karma purchases, job payments)
    - `commission_transactions` - Tracks commission fees from jobs

  2. Security
    - Enable RLS on all tables
    - Add policies for users to access their own data

  3. Functions
    - Function to calculate commission rates
    - Function to process karma purchases
*/

-- Stripe customers mapping
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Stripe subscriptions
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  subscription_id text UNIQUE,
  price_id text,
  status text NOT NULL DEFAULT 'not_started',
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

-- Stripe orders (one-time payments)
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id text UNIQUE NOT NULL,
  payment_intent_id text,
  customer_id text REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  amount_subtotal bigint,
  amount_total bigint,
  currency text DEFAULT 'eur',
  payment_status text,
  status text DEFAULT 'pending',
  product_type text, -- 'karma_purchase', 'job_payment', etc.
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

-- Commission transactions
CREATE TABLE IF NOT EXISTS commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id integer REFERENCES jobs(id) ON DELETE CASCADE,
  payer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_amount decimal(10,2) NOT NULL,
  commission_rate decimal(5,4) NOT NULL, -- e.g., 0.098 for 9.8%
  commission_amount decimal(10,2) NOT NULL,
  net_amount decimal(10,2) NOT NULL,
  stripe_payment_intent_id text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their commission transactions"
  ON commission_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = recipient_id);

-- Update profiles table to include premium status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'premium'
  ) THEN
    ALTER TABLE profiles ADD COLUMN premium boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'premium_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN premium_expires_at timestamptz;
  END IF;
END $$;

-- Function to get commission rate based on premium status
CREATE OR REPLACE FUNCTION get_commission_rate(user_id uuid)
RETURNS decimal AS $$
DECLARE
  is_premium boolean;
BEGIN
  SELECT premium INTO is_premium
  FROM profiles
  WHERE id = user_id;
  
  IF is_premium AND (premium_expires_at IS NULL OR premium_expires_at > now()) THEN
    RETURN 0.05; -- 5% for premium users
  ELSE
    RETURN 0.098; -- 9.8% for regular users
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process karma purchase
CREATE OR REPLACE FUNCTION process_karma_purchase(
  user_id uuid,
  karma_amount integer,
  payment_amount decimal
)
RETURNS void AS $$
BEGIN
  -- Add karma to user profile
  UPDATE profiles
  SET karma = karma + karma_amount,
      updated_at = now()
  WHERE id = user_id;
  
  -- Record transaction
  INSERT INTO karma_transactions (
    user_id,
    transaction_type,
    karma_amount,
    money_amount,
    exchange_rate,
    status,
    description
  ) VALUES (
    user_id,
    'money_to_karma',
    karma_amount,
    payment_amount,
    payment_amount / karma_amount,
    'completed',
    'Karma purchase via Stripe'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_job_id ON commission_transactions(job_id);