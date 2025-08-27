/*
  # Karma Money Exchange System

  1. New Tables
    - `karma_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `transaction_type` (text: 'karma_to_money', 'money_to_karma', 'job_reward', 'daily_bonus')
      - `karma_amount` (integer)
      - `money_amount` (decimal)
      - `exchange_rate` (decimal, default 100.0)
      - `status` (text: 'pending', 'completed', 'failed')
      - `description` (text)
      - `created_at` (timestamp)
      - `completed_at` (timestamp)

    - `user_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, unique)
      - `balance_euros` (decimal, default 0.00)
      - `total_earned` (decimal, default 0.00)
      - `total_spent` (decimal, default 0.00)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own transactions and wallet
    - Add policies for secure money handling
*/

-- Karma Transactions Table
CREATE TABLE IF NOT EXISTS karma_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('karma_to_money', 'money_to_karma', 'job_reward', 'daily_bonus', 'achievement_bonus')),
  karma_amount integer NOT NULL DEFAULT 0,
  money_amount decimal(10,2) NOT NULL DEFAULT 0.00,
  exchange_rate decimal(10,2) DEFAULT 100.0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;

-- User Wallets Table
CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance_euros decimal(10,2) DEFAULT 0.00,
  total_earned decimal(10,2) DEFAULT 0.00,
  total_spent decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_karma_transactions_user ON karma_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_type ON karma_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_status ON karma_transactions(status);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_created ON karma_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON user_wallets(user_id);

-- RLS Policies for karma_transactions
CREATE POLICY "Users can read own transactions"
  ON karma_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON karma_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update transactions"
  ON karma_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_wallets
CREATE POLICY "Users can read own wallet"
  ON user_wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON user_wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create wallets"
  ON user_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Updated at trigger for user_wallets
CREATE TRIGGER user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to create wallet on profile creation
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_on_profile
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();