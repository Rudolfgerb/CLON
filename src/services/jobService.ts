import { supabase } from '../lib/supabase';

export interface JobFilters {
  type?: 'cash' | 'karma' | 'all';
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'all';
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'payment_high' | 'payment_low';
  limit?: number;
  offset?: number;
}

export interface JobCreateData {
  title: string;
  description: string;
  category: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  payment_type: 'cash' | 'karma' | 'mixed';
  budget_type: 'fixed' | 'hourly';
  budget_amount: number;
  cash_amount?: number;
  karma_amount?: number;
  additional_cash?: number;
  additional_karma?: number;
  deadline: string;
  expected_duration: number;
  time_commitment: 'part_time' | 'full_time' | 'flexible';
  deliverables: string;
  requirements?: string[];
  tags?: string[];
  visibility: 'public' | 'private';
  creator_id: string;
}

export interface ApplicationData {
  job_id: string;
  applicant_id: string;
  cover_letter: string;
  proposed_amount?: number;
  estimated_time?: number;
}

export class JobService {
  // Job CRUD Operations
  static async createJob(jobData: JobCreateData) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select(`
          *,
          profiles:creator_id (
            full_name,
            email,
            premium
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  static async getJobs(filters: JobFilters = {}) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            email,
            premium,
            username
          ),
          applications (
            id,
            status,
            applicant_id,
            created_at
          )
        `);

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        query = query.eq('payment_type', filters.type);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'payment_high':
          query = query.order('budget_amount', { ascending: false });
          break;
        case 'payment_low':
          query = query.order('budget_amount', { ascending: true });
          break;
        default: // 'newest'
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  static async getJobById(id: string) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            email,
            premium,
            username,
            bio,
            website
          ),
          applications (
            id,
            status,
            cover_letter,
            proposed_amount,
            estimated_time,
            created_at,
            profiles:applicant_id (
              full_name,
              email,
              karma,
              level,
              premium
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  static async getMyJobs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications (
            id,
            status,
            applicant_id,
            created_at,
            profiles:applicant_id (
              full_name,
              email
            )
          )
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching my jobs:', error);
      throw error;
    }
  }

  static async updateJob(id: string, updates: Partial<JobCreateData>) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  static async deleteJob(id: string, userId: string) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('creator_id', userId); // Security: Only allow deleting own jobs

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Application Operations
  static async submitApplication(applicationData: ApplicationData) {
    try {
      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', applicationData.job_id)
        .eq('applicant_id', applicationData.applicant_id)
        .single();

      if (existingApplication) {
        throw new Error('Sie haben sich bereits für diesen Job beworben');
      }

      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select(`
          *,
          profiles:applicant_id (
            full_name,
            email
          ),
          jobs:job_id (
            title,
            creator_id
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  static async getApplicationsForJob(jobId: string, userId: string) {
    try {
      // First verify that the user owns the job
      const { data: job } = await supabase
        .from('jobs')
        .select('creator_id')
        .eq('id', jobId)
        .eq('creator_id', userId)
        .single();

      if (!job) {
        throw new Error('Unauthorized: Not your job');
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:applicant_id (
            full_name,
            email,
            karma,
            level,
            premium,
            bio,
            website
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  static async getUserApplications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            title,
            description,
            payment_type,
            cash_amount,
            karma_amount,
            creator_id,
            status,
            profiles:creator_id (
              full_name,
              email
            )
          )
        `)
        .eq('applicant_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(
    applicationId: string, 
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
    userId: string
  ) {
    try {
      // Verify user has permission to update this application
      const { data: application } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            creator_id
          )
        `)
        .eq('id', applicationId)
        .single();

      if (!application) {
        throw new Error('Application not found');
      }

      // Check if user is either the applicant or the job creator
      const isApplicant = application.applicant_id === userId;
      const isJobCreator = application.jobs?.creator_id === userId;

      if (!isApplicant && !isJobCreator) {
        throw new Error('Unauthorized to update this application');
      }

      const { data, error } = await supabase
        .from('applications')
        .update({
          status,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      // If accepted, we might need to update job status
      if (status === 'accepted') {
        await supabase
          .from('jobs')
          .update({
            assigned_to: application.applicant_id,
            status: 'in_progress',
            assigned_at: new Date().toISOString()
          })
          .eq('id', application.job_id);
      }

      return data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  static async getUserJobStats(userId: string) {
    try {
      const [myJobsResult, applicationsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, status, payment_type, cash_amount, karma_amount, created_at')
          .eq('creator_id', userId),
        
        supabase
          .from('applications')
          .select(`
            id, status, created_at,
            jobs:job_id (
              payment_type, cash_amount, karma_amount
            )
          `)
          .eq('applicant_id', userId)
      ]);

      const myJobs = myJobsResult.data || [];
      const myApplications = applicationsResult.data || [];

      const stats = {
        jobsCreated: myJobs.length,
        jobsCompleted: myJobs.filter(j => j.status === 'completed').length,
        jobsActive: myJobs.filter(j => j.status === 'in_progress').length,
        applicationsSubmitted: myApplications.length,
        applicationsAccepted: myApplications.filter(a => a.status === 'accepted').length,
        totalEarnings: myApplications
          .filter(a => a.status === 'accepted' && a.jobs?.payment_type === 'cash')
          .reduce((sum, a) => sum + (a.jobs?.cash_amount || 0), 0),
        totalKarmaEarned: myApplications
          .filter(a => a.status === 'accepted' && (a.jobs?.payment_type === 'karma' || a.jobs?.payment_type === 'mixed'))
          .reduce((sum, a) => sum + (a.jobs?.karma_amount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user job stats:', error);
      throw error;
    }
  }

  // Search and Discovery
  static async searchJobs(searchTerm: string, filters: JobFilters = {}) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            premium
          ),
          applications (
            id,
            status
          )
        `);

      if (searchTerm) {
        query = query.or(`
          title.ilike.%${searchTerm}%,
          description.ilike.%${searchTerm}%,
          tags.cs.{${searchTerm}},
          category.ilike.%${searchTerm}%
        `);
      }

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          query = query.eq(key, value);
        }
      });

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  // Job Categories and Tags
  static async getJobCategories() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      // Extract unique categories
      const categories = [...new Set(data.map(job => job.category))].filter(Boolean);
      return categories.map(category => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        count: data.filter(job => job.category === category).length
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getPopularTags(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;

      // Flatten and count tags
      const allTags = data.flatMap(job => job.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sort by count and return top tags
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  }

  // Recommendations
  static async getRecommendedJobs(userId: string) {
    try {
      // Get user's application history to understand preferences
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          jobs:job_id (
            category,
            tags,
            difficulty_level,
            payment_type
          )
        `)
        .eq('applicant_id', userId);

      // Analyze user preferences
      const preferences = this.analyzeUserPreferences(applications || []);

      // Get recommended jobs based on preferences
      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            premium
          ),
          applications (
            id,
            applicant_id
          )
        `)
        .eq('status', 'open')
        .neq('creator_id', userId) // Don't recommend own jobs
        .limit(10);

      // Filter out jobs user already applied to
      const { data: userApplications } = await supabase
        .from('applications')
        .select('job_id')
        .eq('applicant_id', userId);

      if (userApplications && userApplications.length > 0) {
        const appliedJobIds = userApplications.map(app => app.job_id);
        query = query.not('id', 'in', `(${appliedJobIds.join(',')})`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      return [];
    }
  }

  private static analyzeUserPreferences(applications: any[]) {
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    const difficulties: Record<string, number> = {};
    const paymentTypes: Record<string, number> = {};

    applications.forEach(app => {
      const job = app.jobs;
      if (!job) return;

      if (job.category) {
        categories[job.category] = (categories[job.category] || 0) + 1;
      }

      if (job.tags) {
        job.tags.forEach((tag: string) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }

      if (job.difficulty_level) {
        difficulties[job.difficulty_level] = (difficulties[job.difficulty_level] || 0) + 1;
      }

      if (job.payment_type) {
        paymentTypes[job.payment_type] = (paymentTypes[job.payment_type] || 0) + 1;
      }
    });

    return {
      preferredCategories: Object.keys(categories).sort((a, b) => categories[b] - categories[a]),
      preferredTags: Object.keys(tags).sort((a, b) => tags[b] - tags[a]),
      preferredDifficulties: Object.keys(difficulties).sort((a, b) => difficulties[b] - difficulties[a]),
      preferredPaymentTypes: Object.keys(paymentTypes).sort((a, b) => paymentTypes[b] - paymentTypes[a])
    };
  }
}

// Export for convenience
export const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  submitApplication,
  getApplicationsForJob,
  getUserApplications,
  updateApplicationStatus,
  getUserJobStats,
  searchJobs,
  getJobCategories,
  getPopularTags,
  getRecommendedJobs
} = JobService;