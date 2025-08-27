/*
  # Stripe Integration Tables

  1. New Tables
    - `stripe_customers` - Maps Supabase users to Stripe customers
    - `stripe_subscriptions` - Tracks premium subscriptions
    - `stripe_orders` - Records one-time purchases (karma, etc.)
    - `commission_transactions` - Tracks job commission payments

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access

  3. Functions
    - Helper function for processing karma purchases
    - Commission calculation functions
*/

-- Stripe customers mapping
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stripe data"
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

CREATE POLICY "Users can read own subscriptions"
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
  product_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
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
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_amount decimal(10,2) NOT NULL,
  commission_amount decimal(10,2) NOT NULL,
  net_amount decimal(10,2) NOT NULL,
  commission_rate decimal(5,4) NOT NULL,
  is_premium boolean DEFAULT false,
  status text DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own commission transactions"
  ON commission_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = receiver_id);

-- Function to process karma purchases
CREATE OR REPLACE FUNCTION process_karma_purchase(
  user_id uuid,
  karma_amount integer,
  payment_amount decimal
) RETURNS void AS $$
BEGIN
  -- Add karma to user profile
  UPDATE profiles 
  SET karma = karma + karma_amount,
      updated_at = now()
  WHERE id = user_id;
  
  -- Create transaction record
  INSERT INTO karma_transactions (
    user_id,
    transaction_type,
    karma_amount,
    money_amount,
    description,
    status
  ) VALUES (
    user_id,
    'money_to_karma',
    karma_amount,
    payment_amount,
    'Karma purchase via Stripe',
    'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
  amount decimal,
  is_premium boolean DEFAULT false
) RETURNS TABLE (
  gross_amount decimal,
  commission_amount decimal,
  net_amount decimal,
  commission_rate decimal
) AS $$
DECLARE
  rate decimal := CASE WHEN is_premium THEN 0.05 ELSE 0.098 END;
  commission decimal := amount * rate;
BEGIN
  RETURN QUERY SELECT 
    amount,
    commission,
    amount - commission,
    rate;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_job_id ON commission_transactions(job_id);