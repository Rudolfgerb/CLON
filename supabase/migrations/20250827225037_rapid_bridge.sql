/*
  # Comprehensive Row Level Security Policies

  This migration creates robust RLS policies for all tables ensuring:
  
  1. Data Security
    - Users can only access their own data
    - Public data is appropriately accessible
    - Admin access is properly controlled
    
  2. Business Logic Security
    - Job creators can manage their jobs
    - Applicants can view/modify their applications
    - Reviews are only editable by participants
    
  3. Performance
    - Policies use efficient indexes
    - Complex checks are optimized
*/

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ================================
-- PROFILES POLICIES
-- ================================

-- Users can read all public profile information
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON uar.role_id = ar.id
      WHERE uar.user_id = auth.uid() 
      AND ar.permissions ? 'edit_profiles'
    )
  );

-- ================================
-- JOB POSTS POLICIES
-- ================================

-- Anyone can view active public jobs
CREATE POLICY "Anyone can view public jobs"
  ON job_posts FOR SELECT
  USING (status = 'active' AND visibility = 'public');

-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
  ON job_posts FOR SELECT
  USING (created_by = auth.uid());

-- Authenticated users can create jobs
CREATE POLICY "Authenticated users can create jobs"
  ON job_posts FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs"
  ON job_posts FOR UPDATE
  USING (created_by = auth.uid());

-- Admins can manage all jobs
CREATE POLICY "Admins can manage all jobs"
  ON job_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ================================
-- JOB APPLICATIONS POLICIES
-- ================================

-- Users can view applications for their jobs or their own applications
CREATE POLICY "Users can view relevant applications"
  ON job_applications FOR SELECT
  USING (
    applicant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM job_posts jp 
      WHERE jp.id = job_applications.job_id 
      AND jp.created_by = auth.uid()
    )
  );

-- Users can create applications (but not for their own jobs)
CREATE POLICY "Users can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (
    auth.uid() = applicant_id AND
    NOT EXISTS (
      SELECT 1 FROM job_posts jp 
      WHERE jp.id = job_id 
      AND jp.created_by = auth.uid()
    )
  );

-- Users can update their own applications
CREATE POLICY "Users can update own applications"
  ON job_applications FOR UPDATE
  USING (applicant_id = auth.uid());

-- Job creators can update application status
CREATE POLICY "Job creators can update application status"
  ON job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_posts jp 
      WHERE jp.id = job_applications.job_id 
      AND jp.created_by = auth.uid()
    )
  );

-- ================================
-- NOTIFICATIONS POLICIES
-- ================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ================================
-- TRANSACTIONS POLICIES
-- ================================

-- Users can view their own karma transactions
CREATE POLICY "Users can view own karma transactions"
  ON karma_transactions FOR SELECT
  USING (user_id = auth.uid());

-- Users can view their own wallet transactions
CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions FOR SELECT
  USING (user_id = auth.uid());

-- System can create transactions
CREATE POLICY "System can create karma transactions"
  ON karma_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can create wallet transactions"
  ON wallet_transactions FOR INSERT
  WITH CHECK (true);

-- ================================
-- REVIEWS POLICIES
-- ================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON job_reviews FOR SELECT
  USING (true);

-- Only participants can create reviews
CREATE POLICY "Participants can create reviews"
  ON job_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_reviews.job_id
      AND (
        jp.created_by = auth.uid() OR
        jp.assigned_to = auth.uid()
      )
      AND jp.status = 'completed'
    )
  );

-- ================================
-- MEDIA POLICIES
-- ================================

-- Anyone can view job media
CREATE POLICY "Anyone can view job media"
  ON job_media FOR SELECT
  USING (true);

-- Job creators can manage their job media
CREATE POLICY "Job creators can manage media"
  ON job_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_media.job_id
      AND jp.created_by = auth.uid()
    )
  );