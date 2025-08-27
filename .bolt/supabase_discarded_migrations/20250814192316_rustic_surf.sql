/*
  # User Sessions and Activity Tracking

  1. New Tables
    - `user_sessions`
      - Track active user sessions
      - Online status management
      - Last activity tracking
    
    - `user_activity_log`
      - Log all user actions
      - Performance analytics
      - Behavior tracking

  2. Functions
    - Session management
    - Activity logging
    - Online status updates

  3. Security
    - RLS policies for privacy
    - Session cleanup
*/

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  last_activity timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User Activity Log Table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_log(created_at);

-- RLS Policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity_log
CREATE POLICY "Users can read own activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can log activity"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update user last login
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_login in profiles
  UPDATE profiles 
  SET 
    last_login = now(),
    login_streak = CASE 
      WHEN last_login::date = (now() - interval '1 day')::date THEN login_streak + 1
      WHEN last_login::date = now()::date THEN login_streak
      ELSE 1
    END
  WHERE id = NEW.user_id;
  
  -- Log login activity
  INSERT INTO user_activity_log (user_id, activity_type, activity_data)
  VALUES (NEW.user_id, 'login', jsonb_build_object('session_id', NEW.id));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_login_on_session
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_login();

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < now() OR (is_active = false AND created_at < now() - interval '7 days');
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_activity_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO user_activity_log (user_id, activity_type, activity_data)
  VALUES (p_user_id, p_activity_type, p_activity_data)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get online users count
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM user_sessions
    WHERE is_active = true 
    AND last_activity > now() - interval '5 minutes'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is online
CREATE OR REPLACE FUNCTION is_user_online(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_sessions
    WHERE user_id = p_user_id
    AND is_active = true
    AND last_activity > now() - interval '5 minutes'
  );
END;
$$ LANGUAGE plpgsql;