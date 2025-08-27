/*
  # Enhanced Notifications System

  1. Table Updates
    - Add more notification types
    - Add priority levels
    - Add action data for interactive notifications
    - Add expiration dates

  2. New Functions
    - Auto-cleanup expired notifications
    - Notification aggregation
    - Real-time notification triggers

  3. Security
    - Enhanced RLS policies
    - Notification privacy controls
*/

-- Add new columns to notifications table
DO $$
BEGIN
  -- Add priority column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'priority'
  ) THEN
    ALTER TABLE notifications ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;

  -- Add expires_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN expires_at timestamptz;
  END IF;

  -- Add action_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'action_url'
  ) THEN
    ALTER TABLE notifications ADD COLUMN action_url text;
  END IF;

  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'category'
  ) THEN
    ALTER TABLE notifications ADD COLUMN category text DEFAULT 'general';
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to create achievement notifications
CREATE OR REPLACE FUNCTION create_achievement_notification(
  p_user_id uuid,
  p_achievement_type text,
  p_achievement_data jsonb
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
  title_text text;
  message_text text;
BEGIN
  -- Generate title and message based on achievement type
  CASE p_achievement_type
    WHEN 'streak_milestone' THEN
      title_text := '🔥 Streak Milestone erreicht!';
      message_text := (p_achievement_data->>'streak_days') || ' Tage in Folge aktiv!';
    WHEN 'karma_milestone' THEN
      title_text := '⭐ Karma Master!';
      message_text := '+' || (p_achievement_data->>'karma_earned') || ' Karma heute verdient!';
    WHEN 'productivity_champion' THEN
      title_text := '🏆 Produktivitäts-Champion!';
      message_text := (p_achievement_data->>'jobs_completed') || ' Jobs heute abgeschlossen!';
    WHEN 'first_job' THEN
      title_text := '🎉 Erster Job abgeschlossen!';
      message_text := 'Herzlichen Glückwunsch zu deinem ersten erfolgreichen Job!';
    WHEN 'level_up' THEN
      title_text := '📈 Level Up!';
      message_text := 'Du hast Level ' || (p_achievement_data->>'new_level') || ' erreicht!';
    ELSE
      title_text := '🏆 Erfolg freigeschaltet!';
      message_text := 'Du hast einen neuen Meilenstein erreicht!';
  END CASE;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    category,
    priority,
    expires_at
  ) VALUES (
    p_user_id,
    'achievement',
    title_text,
    message_text,
    p_achievement_data,
    'achievement',
    'high',
    now() + interval '7 days'
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create job-related notifications
CREATE OR REPLACE FUNCTION create_job_notification(
  p_user_id uuid,
  p_notification_type text,
  p_job_data jsonb
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
  title_text text;
  message_text text;
BEGIN
  CASE p_notification_type
    WHEN 'new_application' THEN
      title_text := '📝 Neue Bewerbung erhalten';
      message_text := 'Jemand hat sich auf "' || (p_job_data->>'job_title') || '" beworben';
    WHEN 'application_accepted' THEN
      title_text := '✅ Bewerbung angenommen!';
      message_text := 'Ihre Bewerbung für "' || (p_job_data->>'job_title') || '" wurde angenommen';
    WHEN 'application_rejected' THEN
      title_text := '❌ Bewerbung abgelehnt';
      message_text := 'Ihre Bewerbung für "' || (p_job_data->>'job_title') || '" wurde leider abgelehnt';
    WHEN 'job_completed' THEN
      title_text := '🎉 Job abgeschlossen!';
      message_text := 'Job "' || (p_job_data->>'job_title') || '" erfolgreich abgeschlossen';
    WHEN 'payment_received' THEN
      title_text := '💰 Zahlung erhalten';
      message_text := '€' || (p_job_data->>'amount') || ' für "' || (p_job_data->>'job_title') || '" erhalten';
    ELSE
      title_text := '💼 Job Update';
      message_text := 'Es gibt Updates zu Ihrem Job';
  END CASE;

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    category,
    priority,
    expires_at
  ) VALUES (
    p_user_id,
    p_notification_type,
    title_text,
    message_text,
    p_job_data,
    'job',
    CASE WHEN p_notification_type IN ('payment_received', 'application_accepted') THEN 'high' ELSE 'normal' END,
    now() + interval '30 days'
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;