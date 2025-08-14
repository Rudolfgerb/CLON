/*
  # Chat Bubbles System

  1. New Tables
    - `chat_bubbles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `creator_id` (uuid, references profiles)
      - `max_participants` (integer, default 10)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bubble_participants`
      - `id` (uuid, primary key)
      - `bubble_id` (uuid, references chat_bubbles)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamp)
      - `is_online` (boolean, default true)
    
    - `bubble_messages`
      - `id` (uuid, primary key)
      - `bubble_id` (uuid, references chat_bubbles)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Bubble creators can manage their bubbles
    - Participants can read/write in joined bubbles
*/

-- Chat Bubbles Table
CREATE TABLE IF NOT EXISTS chat_bubbles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  max_participants integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_bubbles ENABLE ROW LEVEL SECURITY;

-- Bubble Participants Table
CREATE TABLE IF NOT EXISTS bubble_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bubble_id uuid NOT NULL REFERENCES chat_bubbles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_online boolean DEFAULT true,
  UNIQUE(bubble_id, user_id)
);

ALTER TABLE bubble_participants ENABLE ROW LEVEL SECURITY;

-- Bubble Messages Table
CREATE TABLE IF NOT EXISTS bubble_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bubble_id uuid NOT NULL REFERENCES chat_bubbles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bubble_messages ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_bubbles_creator ON chat_bubbles(creator_id);
CREATE INDEX IF NOT EXISTS idx_chat_bubbles_active ON chat_bubbles(is_active);
CREATE INDEX IF NOT EXISTS idx_bubble_participants_bubble ON bubble_participants(bubble_id);
CREATE INDEX IF NOT EXISTS idx_bubble_participants_user ON bubble_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_bubble_messages_bubble ON bubble_messages(bubble_id);
CREATE INDEX IF NOT EXISTS idx_bubble_messages_created ON bubble_messages(created_at);

-- RLS Policies for chat_bubbles
CREATE POLICY "Anyone can read active bubbles"
  ON chat_bubbles
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create bubbles"
  ON chat_bubbles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own bubbles"
  ON chat_bubbles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own bubbles"
  ON chat_bubbles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- RLS Policies for bubble_participants
CREATE POLICY "Users can read participants of joined bubbles"
  ON bubble_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bubble_participants bp2 
      WHERE bp2.bubble_id = bubble_participants.bubble_id 
      AND bp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join bubbles"
  ON bubble_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON bubble_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave bubbles"
  ON bubble_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for bubble_messages
CREATE POLICY "Participants can read messages"
  ON bubble_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bubble_participants bp 
      WHERE bp.bubble_id = bubble_messages.bubble_id 
      AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON bubble_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bubble_participants bp 
      WHERE bp.bubble_id = bubble_messages.bubble_id 
      AND bp.user_id = auth.uid()
    )
  );

-- Updated at trigger for chat_bubbles
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_bubbles_updated_at
  BEFORE UPDATE ON chat_bubbles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();