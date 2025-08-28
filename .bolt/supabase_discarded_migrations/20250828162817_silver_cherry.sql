/*
  # Create Stripe Integration Tables

  1. New Tables
    - `stripe_customers` - Maps Supabase users to Stripe customers
    - `stripe_orders` - Records completed purchases
    - `commission_transactions` - Track platform commissions

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies

  3. Functions
    - Add functions for processing purchases
*/

-- Stripe customers mapping
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Stripe orders/purchases
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  checkout_session_id text NOT NULL UNIQUE,
  customer_id text NOT NULL,
  amount_total bigint,
  currency text DEFAULT 'eur',
  payment_status text,
  status text DEFAULT 'pending',
  product_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Commission transactions
CREATE TABLE IF NOT EXISTS commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  transaction_type text NOT NULL,
  amount numeric(10,2) NOT NULL,
  commission_rate numeric(4,3) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  net_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'completed',
  description text,
  stripe_payment_intent_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for stripe_customers
CREATE POLICY "Users can view own Stripe data"
  ON stripe_customers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage Stripe data"
  ON stripe_customers FOR ALL 
  USING (auth.role() = 'service_role');

-- Policies for stripe_orders  
CREATE POLICY "Users can view own orders"
  ON stripe_orders FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage orders"
  ON stripe_orders FOR ALL 
  USING (auth.role() = 'service_role');

-- Policies for commission_transactions
CREATE POLICY "Users can view own transactions"
  ON commission_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions"
  ON commission_transactions FOR ALL 
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_user_id ON stripe_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_user_id ON commission_transactions(user_id);

-- Function to process karma purchases
CREATE OR REPLACE FUNCTION process_karma_purchase(
  user_id_param uuid,
  karma_amount_param integer,
  payment_amount_param numeric(10,2)
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user karma
  UPDATE profiles
  SET 
    karma = karma + karma_amount_param,
    updated_at = now()
  WHERE id = user_id_param;

  -- Record karma transaction
  INSERT INTO karma_transactions (
    user_id,
    type,
    amount,
    description,
    balance_after
  ) VALUES (
    user_id_param,
    'purchase',
    karma_amount_param,
    format('Karma purchase: %s points for €%s', karma_amount_param, payment_amount_param),
    (SELECT karma FROM profiles WHERE id = user_id_param)
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Updated at triggers
CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_orders_updated_at
  BEFORE UPDATE ON stripe_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();