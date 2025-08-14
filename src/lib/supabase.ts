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
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}