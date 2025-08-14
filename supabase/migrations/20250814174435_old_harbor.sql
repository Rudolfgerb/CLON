/*
  # Benachrichtigungs- und Bewerbungssystem

  1. Neue Tabellen
    - `applications` - Bewerbungen auf Jobs
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key)
      - `applicant_id` (uuid, foreign key)
      - `message` (text)
      - `hourly_rate` (decimal)
      - `estimated_hours` (integer)
      - `experience` (text)
      - `portfolio` (text)
      - `status` (enum: pending, accepted, rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notifications` - Benachrichtigungen
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `data` (jsonb)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Sicherheit
    - Enable RLS auf beiden Tabellen
    - Policies für Benutzer-spezifische Zugriffe
*/

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  applicant_id uuid NOT NULL,
  message text NOT NULL,
  hourly_rate decimal(10,2),
  estimated_hours integer,
  experience text,
  portfolio text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_job_id_fkey'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT applications_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_applicant_id_fkey'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT applications_applicant_id_fkey 
    FOREIGN KEY (applicant_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Add updated_at trigger for applications
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'applications_updated_at'
  ) THEN
    CREATE TRIGGER applications_updated_at
      BEFORE UPDATE ON applications
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Users can view applications for their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = applicant_id);

CREATE POLICY "Users can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Job creators can update application status"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);