/*
  # Neues Job-System mit verbesserter Struktur

  1. Neue Tabellen
    - `job_posts` - Haupttabelle für alle Jobs
    - `job_media` - Medien/Dateien für Jobs
    - `job_categories` - Kategorien mit Beschreibungen
    - `job_applications` - Bewerbungen auf Jobs
    - `job_reviews` - Bewertungen nach Job-Abschluss

  2. Features
    - Unterstützung für Cash und Karma Jobs
    - Medien-Upload System
    - 3-stufiger Erstellprozess
    - Deadline Management
    - Bewerbungssystem

  3. Sicherheit
    - RLS auf allen Tabellen
    - Benutzer können nur eigene Jobs bearbeiten
    - Öffentlicher Zugriff auf aktive Jobs zum Lesen
*/

-- Job Categories Table
CREATE TABLE IF NOT EXISTS job_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text DEFAULT 'briefcase',
  color text DEFAULT 'blue',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job Posts Table (Ersetzt die alte jobs Tabelle)
CREATE TABLE IF NOT EXISTS job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis Informationen
  title text NOT NULL,
  description text NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('cash', 'karma')),
  category_id uuid REFERENCES job_categories(id),
  location text DEFAULT 'Remote',
  
  -- Schwierigkeit und Tags
  difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags text[] DEFAULT '{}',
  requirements text,
  deliverables text NOT NULL,
  
  -- Zeitplanung
  estimated_hours integer DEFAULT 1,
  deadline timestamptz,
  
  -- Bezahlung - Cash Jobs
  hourly_rate numeric(10,2),
  fixed_amount numeric(10,2),
  
  -- Belohnung - Karma Jobs  
  karma_reward integer,
  
  -- Zusätzliche Belohnungen (optional)
  additional_karma integer DEFAULT 0,
  additional_cash numeric(10,2) DEFAULT 0,
  
  -- Meta
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  featured boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_cash_payment CHECK (
    (job_type = 'cash' AND (hourly_rate > 0 OR fixed_amount > 0)) OR
    (job_type = 'karma' AND karma_reward > 0)
  )
);

-- Job Media Table
CREATE TABLE IF NOT EXISTS job_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  is_title_image boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Job Applications Table (Ersetzt die alte applications Tabelle)
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Bewerbungsdaten
  message text NOT NULL,
  proposed_hourly_rate numeric(10,2),
  experience text,
  portfolio_url text,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Kommunikation
  employer_response text,
  read_by_employer boolean DEFAULT false,
  read_by_applicant boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  
  -- Unique constraint - ein User kann sich nur einmal auf einen Job bewerben
  UNIQUE(job_id, applicant_id)
);

-- Job Reviews Table
CREATE TABLE IF NOT EXISTS job_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  application_id uuid REFERENCES job_applications(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Review Details
  rating integer CHECK (rating BETWEEN 1 AND 5),
  title text,
  comment text,
  would_work_again boolean,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO job_categories (name, description, icon, color) VALUES 
  ('development', 'Programmierung und Software-Entwicklung', 'code', 'blue'),
  ('design', 'UI/UX Design und Grafik', 'palette', 'purple'),
  ('writing', 'Texte und Content Creation', 'edit', 'green'),
  ('marketing', 'Digital Marketing und SEO', 'trending-up', 'red'),
  ('data', 'Datenanalyse und Business Intelligence', 'database', 'yellow'),
  ('consulting', 'Beratung und Strategieentwicklung', 'users', 'indigo'),
  ('translation', 'Übersetzungen und Lokalisierung', 'globe', 'pink'),
  ('other', 'Sonstige Aufgaben', 'more-horizontal', 'gray')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_categories
CREATE POLICY "Public can view active categories"
  ON job_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON job_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON uar.role_id = ar.id
      WHERE uar.user_id = auth.uid() AND ar.permissions ? 'manage_jobs'
    )
  );

-- RLS Policies for job_posts
CREATE POLICY "Public can view active jobs"
  ON job_posts
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Users can create jobs"
  ON job_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Job creators can manage their jobs"
  ON job_posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all jobs"
  ON job_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON uar.role_id = ar.id
      WHERE uar.user_id = auth.uid() AND ar.permissions ? 'manage_jobs'
    )
  );

-- RLS Policies for job_media
CREATE POLICY "Public can view media for active jobs"
  ON job_media
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_media.job_id AND jp.status = 'active'
    )
  );

CREATE POLICY "Job creators can manage their job media"
  ON job_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_media.job_id AND jp.created_by = auth.uid()
    )
  );

-- RLS Policies for job_applications
CREATE POLICY "Applicants can manage their applications"
  ON job_applications
  FOR ALL
  TO authenticated
  USING (auth.uid() = applicant_id);

CREATE POLICY "Job creators can view applications for their jobs"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_applications.job_id AND jp.created_by = auth.uid()
    )
  );

CREATE POLICY "Job creators can update applications for their jobs"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_applications.job_id AND jp.created_by = auth.uid()
    )
  );

-- RLS Policies for job_reviews
CREATE POLICY "Public can read reviews"
  ON job_reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create reviews for completed jobs"
  ON job_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN job_posts jp ON ja.job_id = jp.id
      WHERE ja.id = application_id 
      AND (ja.applicant_id = auth.uid() OR jp.created_by = auth.uid())
      AND ja.status = 'accepted'
      AND jp.status = 'completed'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_job_type ON job_posts(job_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_category_id ON job_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_by ON job_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_job_posts_deadline ON job_posts(deadline);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_at ON job_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_job_media_job_id ON job_media(job_id);
CREATE INDEX IF NOT EXISTS idx_job_media_is_title_image ON job_media(is_title_image);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Update triggers
CREATE OR REPLACE FUNCTION update_job_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_posts_updated_at
  BEFORE UPDATE ON job_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_job_posts_updated_at();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();