import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface JobPost {
  id: string;
  title: string;
  description: string;
  job_type: 'cash' | 'karma';
  location: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  requirements: string | null;
  deliverables: string;
  estimated_hours?: number;
  expected_duration?: number;
  deadline: string | null;
  hourly_rate: number | null;
  fixed_amount: number | null;
  karma_reward: number | null;
  additional_karma: number;
  additional_cash: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  creator_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  profiles?: Profile;
  job_media?: JobMedia[];
  applications?: JobApplication[];
}

export interface JobMedia {
  id: string;
  job_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  is_title_image: boolean;
  display_order: number;
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  message: string;
  proposed_hourly_rate: number | null;
  experience: string | null;
  portfolio_url: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  employer_response: string | null;
  read_by_employer: boolean;
  read_by_applicant: boolean;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  // Relations
  profiles?: Profile;
  job_posts?: JobPost;
}

export interface JobReview {
  id: string;
  job_id: string;
  application_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  would_work_again: boolean | null;
  created_at: string;
  updated_at: string;
}

// Legacy types for compatibility
export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  thumbnail: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  karma: number;
  level: number;
  premium: boolean;
  role: string;
  bio: string | null;
  website: string | null;
  last_login: string | null;
  is_active: boolean;
  premium_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
  priority?: string;
  expires_at?: string;
  action_url?: string;
  category?: string;
}

export interface ChatBubble {
  id: string;
  title: string;
  description: string | null;
  category: string;
  creator_id: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BubbleParticipant {
  id: string;
  bubble_id: string;
  user_id: string;
  joined_at: string;
  is_online: boolean;
}

export interface BubbleMessage {
  id: string;
  bubble_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface KarmaTransaction {
  id: string;
  user_id: string;
  transaction_type: 'karma_to_money' | 'money_to_karma' | 'job_reward' | 'daily_bonus' | 'achievement_bonus';
  karma_amount: number;
  money_amount: number;
  exchange_rate: number;
  status: 'pending' | 'completed' | 'failed';
  description: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface UserWallet {
  id: string;
  user_id: string;
  balance_euros: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  is_active: boolean;
  last_activity: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}