/*
  # Business Logic RPC Functions

  1. Job Application Functions
    - `process_job_application` - Handle job applications with validation
    - `accept_job_application` - Accept application and assign job
    - `complete_job_with_payment` - Complete job with payment processing

  2. Karma & Wallet Functions
    - `process_karma_purchase` - Handle karma purchases
    - `calculate_commission` - Calculate commission based on user type
    - `transfer_karma` - Transfer karma between users

  3. Admin Functions
    - `get_admin_statistics` - Get platform statistics
    - `is_admin` - Check if user has admin privileges
    - `moderate_content` - Content moderation actions
*/

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process job applications
CREATE OR REPLACE FUNCTION process_job_application(
  p_job_id UUID,
  p_applicant_id UUID,
  p_cover_letter TEXT,
  p_proposed_amount NUMERIC DEFAULT NULL,
  p_estimated_time INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_job_record RECORD;
  v_user_karma INTEGER;
  v_application_id UUID;
BEGIN
  -- Get job details
  SELECT * INTO v_job_record
  FROM job_posts
  WHERE id = p_job_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Job not found or not active');
  END IF;

  -- Check if user already applied
  IF EXISTS (
    SELECT 1 FROM job_applications 
    WHERE job_id = p_job_id AND applicant_id = p_applicant_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already applied to this job');
  END IF;

  -- For karma jobs, check if user has enough karma
  IF v_job_record.job_type = 'karma' THEN
    SELECT karma INTO v_user_karma
    FROM profiles
    WHERE id = p_applicant_id;
    
    IF v_user_karma < v_job_record.karma_reward THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient karma');
    END IF;
  END IF;

  -- Create application
  INSERT INTO job_applications (
    job_id, applicant_id, cover_letter, proposed_amount, estimated_time
  ) VALUES (
    p_job_id, p_applicant_id, p_cover_letter, p_proposed_amount, p_estimated_time
  ) RETURNING id INTO v_application_id;

  -- Create notification for job creator
  INSERT INTO notifications (
    user_id, type, title, message, related_job_id, related_application_id
  ) VALUES (
    v_job_record.creator_id,
    'application_received',
    'Neue Bewerbung erhalten',
    'Jemand hat sich auf Ihren Job "' || v_job_record.title || '" beworben.',
    p_job_id,
    v_application_id
  );

  RETURN json_build_object(
    'success', true, 
    'application_id', v_application_id,
    'message', 'Application submitted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
  p_amount NUMERIC,
  p_is_premium BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
  v_commission_rate NUMERIC;
  v_commission NUMERIC;
  v_net_amount NUMERIC;
BEGIN
  -- Set commission rate based on user type
  v_commission_rate := CASE 
    WHEN p_is_premium THEN 0.05  -- 5% for premium users
    ELSE 0.098  -- 9.8% for regular users
  END;
  
  v_commission := p_amount * v_commission_rate;
  v_net_amount := p_amount - v_commission;
  
  RETURN json_build_object(
    'gross_amount', p_amount,
    'commission_rate', v_commission_rate,
    'commission', v_commission,
    'net_amount', v_net_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to process karma purchases
CREATE OR REPLACE FUNCTION process_karma_purchase(
  p_user_id UUID,
  p_karma_amount INTEGER,
  p_payment_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
  v_current_karma INTEGER;
  v_new_karma INTEGER;
BEGIN
  -- Get current karma
  SELECT karma INTO v_current_karma
  FROM profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  v_new_karma := v_current_karma + p_karma_amount;
  
  -- Update user karma
  UPDATE profiles
  SET karma = v_new_karma, updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record karma transaction
  INSERT INTO karma_transactions (
    user_id, type, amount, description, balance_after
  ) VALUES (
    p_user_id,
    'reward',
    p_karma_amount,
    'Karma purchase via Stripe: €' || p_payment_amount,
    v_new_karma
  );
  
  RETURN json_build_object(
    'success', true,
    'old_karma', v_current_karma,
    'new_karma', v_new_karma,
    'added_karma', p_karma_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete job with payment
CREATE OR REPLACE FUNCTION complete_job_with_payment(
  p_job_id UUID,
  p_rating INTEGER DEFAULT NULL,
  p_review TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_job_record RECORD;
  v_worker_id UUID;
  v_commission_data JSON;
BEGIN
  -- Get job and assignment details
  SELECT jp.*, jp.assigned_to as worker_id
  INTO v_job_record
  FROM job_posts jp
  WHERE jp.id = p_job_id AND jp.status = 'in_progress';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Job not found or not in progress');
  END IF;
  
  v_worker_id := v_job_record.worker_id;
  
  -- Update job status
  UPDATE job_posts
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_job_id;
  
  -- Process payment based on job type
  IF v_job_record.job_type = 'cash' THEN
    -- Calculate commission
    SELECT calculate_commission(
      COALESCE(v_job_record.fixed_amount, v_job_record.hourly_rate * v_job_record.estimated_hours),
      (SELECT premium FROM profiles WHERE id = v_worker_id)
    ) INTO v_commission_data;
    
    -- Update worker wallet
    UPDATE profiles
    SET wallet_balance = wallet_balance + (v_commission_data->>'net_amount')::NUMERIC
    WHERE id = v_worker_id;
    
    -- Record wallet transaction
    INSERT INTO wallet_transactions (
      user_id, type, amount, description, balance_after
    ) VALUES (
      v_worker_id,
      'payment',
      (v_commission_data->>'net_amount')::NUMERIC,
      'Job completion payment for: ' || v_job_record.title,
      (SELECT wallet_balance FROM profiles WHERE id = v_worker_id)
    );
    
  ELSE
    -- Karma job - award karma to worker
    UPDATE profiles
    SET karma = karma + v_job_record.karma_reward
    WHERE id = v_worker_id;
    
    -- Record karma transaction
    INSERT INTO karma_transactions (
      user_id, job_id, type, amount, description, balance_after
    ) VALUES (
      v_worker_id,
      p_job_id,
      'earn',
      v_job_record.karma_reward,
      'Karma earned from job: ' || v_job_record.title,
      (SELECT karma FROM profiles WHERE id = v_worker_id)
    );
  END IF;
  
  -- Add review if provided
  IF p_rating IS NOT NULL THEN
    INSERT INTO job_reviews (
      job_id, reviewer_id, reviewee_id, rating, comment, type
    ) VALUES (
      p_job_id,
      v_job_record.creator_id,
      v_worker_id,
      p_rating,
      p_review,
      'from_creator'
    );
  END IF;
  
  -- Update user stats
  UPDATE profiles
  SET completed_jobs = completed_jobs + 1
  WHERE id = v_worker_id;
  
  -- Notifications
  INSERT INTO notifications (user_id, type, title, message, related_job_id) VALUES
    (v_worker_id, 'job_completed', 'Job abgeschlossen!', 'Ihr Job "' || v_job_record.title || '" wurde abgeschlossen.', p_job_id),
    (v_job_record.creator_id, 'job_completed', 'Job beendet', 'Ihr Job "' || v_job_record.title || '" wurde erfolgreich abgeschlossen.', p_job_id);
  
  RETURN json_build_object(
    'success', true,
    'job_id', p_job_id,
    'payment_processed', v_job_record.job_type = 'cash',
    'karma_awarded', v_job_record.job_type = 'karma'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_statistics(p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_stats JSON;
BEGIN
  v_start_date := NOW() - (p_days || ' days')::INTERVAL;
  
  WITH stats AS (
    SELECT
      (SELECT COUNT(*) FROM profiles) as total_users,
      (SELECT COUNT(*) FROM profiles WHERE created_at >= v_start_date) as new_users,
      (SELECT COUNT(*) FROM job_posts WHERE status = 'active') as active_jobs,
      (SELECT COUNT(*) FROM job_posts WHERE created_at >= v_start_date) as new_jobs,
      (SELECT COUNT(*) FROM profiles WHERE premium = true) as premium_users,
      (SELECT COALESCE(SUM(amount * 0.098), 0) FROM wallet_transactions WHERE created_at >= v_start_date AND type = 'payment') as commission_30d,
      (SELECT COALESCE(SUM(wallet_balance), 0) FROM profiles) as total_wallet_balance,
      (SELECT COUNT(*) FROM job_applications WHERE created_at >= v_start_date) as new_applications
  )
  SELECT json_build_object(
    'total_users', total_users,
    'new_users_30d', new_users,
    'active_jobs', active_jobs,
    'new_jobs_30d', new_jobs,
    'premium_users', premium_users,
    'commission_30d', commission_30d,
    'total_wallet_balance', total_wallet_balance,
    'new_applications_30d', new_applications
  ) INTO v_stats
  FROM stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;