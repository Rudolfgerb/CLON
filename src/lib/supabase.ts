import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
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

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  code_example: string | null;
  karma_reward: number;
  order_index: number;
  is_published: boolean;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number | null;
  created_at: string;
  updated_at: string;
}

export interface LessonMedia {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface UserQuizResult {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  total_questions: number;
  karma_earned: number;
  completed_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  message: string;
  hourly_rate: number | null;
  estimated_hours: number | null;
  experience: string;
  portfolio: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  read?: boolean; // Add this optional field
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