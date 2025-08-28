/*
  # Business Logic Functions

  This migration creates all RPC functions for complex business operations:
  
  1. Job Management
    - Process job applications
    - Complete jobs with payments
    - Calculate commissions
    
  2. Payment Processing
    - Handle Stripe webhooks
    - Process karma purchases
    - Manage wallet transactions
    
  3. User Management
    - Update user ratings
    - Manage user levels
    - Handle user verification
    
  4. Analytics
    - Generate admin statistics
    - Track user activity
*/

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_admin_roles uar
    JOIN admin_roles ar ON uar.role_id = ar.id
    WHERE uar.user_id = user_id
    AND ar.permissions ? 'admin_access'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- JOB MANAGEMENT FUNCTIONS
-- ================================

-- Process job application
CREATE OR REPLACE FUNCTION process_job_application(
  p_job_id UUID,
  p_applicant_id UUID,
  p_message TEXT,
  p_proposed_rate DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  application_id UUID;
  job_creator UUID;
BEGIN
  -- Get job creator
  SELECT created_by INTO job_creator 
  FROM job_posts WHERE id = p_job_id;
  
  -- Prevent self-application
  IF job_creator = p_applicant_id THEN
    RAISE EXCEPTION 'Cannot apply to your own job';
  END IF;
  
  -- Check for duplicate application
  IF EXISTS (
    SELECT 1 FROM job_applications 
    WHERE job_id = p_job_id AND applicant_id = p_applicant_id
  ) THEN
    RAISE EXCEPTION 'You have already applied to this job';
  END IF;
  
  -- Create application
  INSERT INTO job_applications (
    job_id, applicant_id, message, proposed_hourly_rate, status
  ) VALUES (
    p_job_id, p_applicant_id, p_message, p_proposed_rate, 'pending'
  ) RETURNING id INTO application_id;
  
  -- Create notification for job creator
  INSERT INTO notifications (
    user_id, type, title, message, related_job_id, related_application_id
  ) VALUES (
    job_creator,
    'application_received',
    'Neue Bewerbung erhalten',
    'Sie haben eine neue Bewerbung für Ihren Job erhalten.',
    p_job_id,
    application_id
  );
  
  RETURN application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept job application
CREATE OR REPLACE FUNCTION accept_job_application(
  p_application_id UUID,
  p_job_creator_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_job_id UUID;
  v_applicant_id UUID;
BEGIN
  -- Get application details
  SELECT job_id, applicant_id INTO v_job_id, v_applicant_id
  FROM job_applications 
  WHERE id = p_application_id;
  
  -- Verify job ownership
  IF NOT EXISTS (
    SELECT 1 FROM job_posts 
    WHERE id = v_job_id AND created_by = p_job_creator_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Update application status
  UPDATE job_applications 
  SET status = 'accepted', responded_at = NOW()
  WHERE id = p_application_id;
  
  -- Update job status and assign worker
  UPDATE job_posts 
  SET status = 'in_progress', assigned_to = v_applicant_id, assigned_at = NOW()
  WHERE id = v_job_id;
  
  -- Reject other applications
  UPDATE job_applications 
  SET status = 'rejected', responded_at = NOW()
  WHERE job_id = v_job_id AND id != p_application_id AND status = 'pending';
  
  -- Notify accepted applicant
  INSERT INTO notifications (
    user_id, type, title, message, related_job_id, related_application_id
  ) VALUES (
    v_applicant_id,
    'application_accepted',
    'Bewerbung angenommen!',
    'Ihre Bewerbung wurde angenommen. Der Job kann beginnen.',
    v_job_id,
    p_application_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete job with payment
CREATE OR REPLACE FUNCTION complete_job_with_payment(
  p_job_id UUID,
  p_user_id UUID,
  p_rating INTEGER DEFAULT NULL,
  p_review_comment TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_job_record RECORD;
  v_commission_amount DECIMAL;
  v_net_amount DECIMAL;
  v_applicant_id UUID;
BEGIN
  -- Get job details
  SELECT * INTO v_job_record 
  FROM job_posts 
  WHERE id = p_job_id 
  AND (created_by = p_user_id OR assigned_to = p_user_id);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found or unauthorized';
  END IF;
  
  -- Calculate payment for cash jobs
  IF v_job_record.job_type = 'cash' THEN
    SELECT commission, net_amount INTO v_commission_amount, v_net_amount
    FROM calculate_job_commission(
      COALESCE(v_job_record.fixed_amount, v_job_record.hourly_rate * v_job_record.estimated_hours),
      EXISTS(SELECT 1 FROM profiles WHERE id = v_job_record.assigned_to AND premium = true)
    );
    
    -- Create wallet transaction
    INSERT INTO wallet_transactions (
      user_id, job_id, type, amount, description, balance_after
    ) VALUES (
      v_job_record.assigned_to,
      p_job_id,
      'payment',
      v_net_amount,
      'Payment for job: ' || v_job_record.title,
      (SELECT wallet_balance + v_net_amount FROM profiles WHERE id = v_job_record.assigned_to)
    );
    
    -- Update wallet balance
    UPDATE profiles 
    SET wallet_balance = wallet_balance + v_net_amount,
        completed_jobs = completed_jobs + 1
    WHERE id = v_job_record.assigned_to;
  END IF;
  
  -- Award karma points
  IF v_job_record.karma_reward > 0 THEN
    INSERT INTO karma_transactions (
      user_id, job_id, type, amount, description, balance_after
    ) VALUES (
      v_job_record.assigned_to,
      p_job_id,
      'earn',
      v_job_record.karma_reward + COALESCE(v_job_record.additional_karma, 0),
      'Karma earned for job: ' || v_job_record.title,
      (SELECT karma + v_job_record.karma_reward + COALESCE(v_job_record.additional_karma, 0) FROM profiles WHERE id = v_job_record.assigned_to)
    );
    
    -- Update karma balance
    UPDATE profiles 
    SET karma = karma + v_job_record.karma_reward + COALESCE(v_job_record.additional_karma, 0)
    WHERE id = v_job_record.assigned_to;
  END IF;
  
  -- Update job status
  UPDATE job_posts 
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_job_id;
  
  -- Create review if provided
  IF p_rating IS NOT NULL THEN
    INSERT INTO job_reviews (
      job_id, reviewer_id, reviewee_id, rating, comment, type
    ) VALUES (
      p_job_id, 
      p_user_id, 
      CASE WHEN v_job_record.created_by = p_user_id THEN v_job_record.assigned_to ELSE v_job_record.created_by END,
      p_rating,
      p_review_comment,
      CASE WHEN v_job_record.created_by = p_user_id THEN 'from_creator' ELSE 'from_worker' END
    );
    
    -- Update user rating
    PERFORM update_user_rating(
      CASE WHEN v_job_record.created_by = p_user_id THEN v_job_record.assigned_to ELSE v_job_record.created_by END
    );
  END IF;
  
  -- Notify completion
  INSERT INTO notifications (
    user_id, type, title, message, related_job_id
  ) VALUES (
    CASE WHEN v_job_record.created_by = p_user_id THEN v_job_record.assigned_to ELSE v_job_record.created_by END,
    'job_completed',
    'Job abgeschlossen',
    'Der Job "' || v_job_record.title || '" wurde erfolgreich abgeschlossen.',
    p_job_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- PAYMENT FUNCTIONS
-- ================================

-- Calculate commission for a job
CREATE OR REPLACE FUNCTION calculate_job_commission(
  p_amount DECIMAL,
  p_is_premium BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  gross_amount DECIMAL,
  commission_rate DECIMAL,
  commission DECIMAL,
  net_amount DECIMAL
) AS $$
DECLARE
  v_rate DECIMAL;
BEGIN
  v_rate := CASE WHEN p_is_premium THEN 0.05 ELSE 0.098 END;
  
  RETURN QUERY SELECT
    p_amount as gross_amount,
    v_rate as commission_rate,
    (p_amount * v_rate) as commission,
    (p_amount - (p_amount * v_rate)) as net_amount;
END;
$$ LANGUAGE plpgsql;

-- Process karma purchase
CREATE OR REPLACE FUNCTION process_karma_purchase(
  p_user_id UUID,
  p_karma_amount INTEGER,
  p_payment_amount DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add karma to user account
  UPDATE profiles 
  SET karma = karma + p_karma_amount
  WHERE id = p_user_id;
  
  -- Record karma transaction
  INSERT INTO karma_transactions (
    user_id, type, amount, description, balance_after
  ) VALUES (
    p_user_id,
    'purchase',
    p_karma_amount,
    'Purchased ' || p_karma_amount || ' karma points for €' || p_payment_amount,
    (SELECT karma FROM profiles WHERE id = p_user_id)
  );
  
  -- Create notification
  INSERT INTO notifications (
    user_id, type, title, message
  ) VALUES (
    p_user_id,
    'karma_purchased',
    'Karma Punkte erhalten',
    'Sie haben ' || p_karma_amount || ' Karma Punkte für €' || p_payment_amount || ' erhalten.'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- USER MANAGEMENT FUNCTIONS
-- ================================

-- Update user rating after review
CREATE OR REPLACE FUNCTION update_user_rating(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_avg_rating DECIMAL;
BEGIN
  -- Calculate average rating
  SELECT AVG(rating) INTO v_avg_rating
  FROM job_reviews
  WHERE reviewee_id = p_user_id;
  
  -- Update profile
  UPDATE profiles 
  SET rating = COALESCE(v_avg_rating, 0)
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- ADMIN FUNCTIONS
-- ================================

-- Get admin statistics
CREATE OR REPLACE FUNCTION get_admin_statistics(
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  total_users INTEGER,
  new_users INTEGER,
  active_jobs INTEGER,
  completed_jobs INTEGER,
  total_commission DECIMAL,
  premium_users INTEGER,
  total_karma_transactions INTEGER,
  avg_job_completion_time DECIMAL
) AS $$
DECLARE
  v_date_threshold TIMESTAMP;
BEGIN
  v_date_threshold := NOW() - (p_days_back || ' days')::INTERVAL;
  
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(DISTINCT p.id) as total_users,
      COUNT(DISTINCT CASE WHEN p.created_at >= v_date_threshold THEN p.id END) as new_users,
      COUNT(DISTINCT CASE WHEN jp.status = 'active' THEN jp.id END) as active_jobs,
      COUNT(DISTINCT CASE WHEN jp.status = 'completed' THEN jp.id END) as completed_jobs,
      COALESCE(SUM(wt.amount * 0.098), 0) as total_commission,
      COUNT(DISTINCT CASE WHEN p.premium = true THEN p.id END) as premium_users,
      COUNT(DISTINCT kt.id) as total_karma_transactions,
      AVG(EXTRACT(EPOCH FROM (jp.completed_at - jp.created_at)) / 3600)::DECIMAL as avg_completion_hours
    FROM profiles p
    LEFT JOIN job_posts jp ON jp.created_by = p.id
    LEFT JOIN wallet_transactions wt ON wt.user_id = p.id AND wt.created_at >= v_date_threshold
    LEFT JOIN karma_transactions kt ON kt.user_id = p.id AND kt.created_at >= v_date_threshold
  )
  SELECT * FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- TRIGGERS
-- ================================

-- Auto-update timestamps
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_posts_timestamp
  BEFORE UPDATE ON job_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_timestamp
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notifications_timestamp
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();