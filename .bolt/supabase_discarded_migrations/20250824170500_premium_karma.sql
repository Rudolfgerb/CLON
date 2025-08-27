-- Add premium subscription fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create table for karma purchases
CREATE TABLE IF NOT EXISTS karma_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_price_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  karma_points INTEGER NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'completed'
);
