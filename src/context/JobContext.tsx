import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { JobService, JobFilters } from '../services/jobService';
import { JobPost } from '../lib/supabase';

interface JobStats {
  jobsCreated: number;
  jobsCompleted: number;
  jobsActive: number;
  applicationsSubmitted: number;
  applicationsAccepted: number;
  totalEarnings: number;
  totalKarmaEarned: number;
}

interface JobContextType {
  // State
  jobs: JobPost[];
  myJobs: JobPost[];
  applications: any[];
  stats: JobStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadJobs: (filters?: JobFilters) => Promise<void>;
  loadMyJobs: () => Promise<void>;
  loadApplications: () => Promise<void>;
  loadStats: () => Promise<void>;
  searchJobs: (searchTerm: string, filters?: JobFilters) => Promise<void>;
  createJob: (jobData: any) => Promise<any>;
  updateJobStatus: (jobId: string, status: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  submitApplication: (jobId: string, applicationData: any) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<void>;
  
  // Utilities
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children, user }) => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [myJobs, setMyJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    setError(error.message || `Error in ${operation}`);
  }, []);

  const loadJobs = useCallback(async (filters?: JobFilters) => {
    if (!user) return;

    setLoading(true);
    try {
      const jobsData = await JobService.getJobs(filters);
      setJobs(jobsData);
      clearError();
    } catch (error) {
      handleError(error, 'loadJobs');
    } finally {
      setLoading(false);
    }
  }, [user, clearError, handleError]);

  const loadMyJobs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const myJobsData = await JobService.getMyJobs(user.id);
      setMyJobs(myJobsData);
      clearError();
    } catch (error) {
      handleError(error, 'loadMyJobs');
    } finally {
      setLoading(false);
    }
  }, [user, clearError, handleError]);

  const loadApplications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const applicationsData = await JobService.getUserApplications(user.id);
      setApplications(applicationsData);
      clearError();
    } catch (error) {
      handleError(error, 'loadApplications');
    } finally {
      setLoading(false);
    }
  }, [user, clearError, handleError]);

  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      const statsData = await JobService.getUserJobStats(user.id);
      setStats(statsData);
      clearError();
    } catch (error) {
      handleError(error, 'loadStats');
    }
  }, [user, clearError, handleError]);

  const searchJobs = useCallback(async (searchTerm: string, filters?: JobFilters) => {
    if (!user) return;

    setLoading(true);
    try {
      const searchResults = await JobService.searchJobs(searchTerm, filters);
      setJobs(searchResults);
      clearError();
    } catch (error) {
      handleError(error, 'searchJobs');
    } finally {
      setLoading(false);
    }
  }, [user, clearError, handleError]);

  const createJob = useCallback(async (jobData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newJob = await JobService.createJob({
        ...jobData,
        creator_id: user.id
      });
      
      // Add to myJobs list
      setMyJobs(prev => [newJob, ...prev]);
      clearError();
      return newJob;
    } catch (error) {
      handleError(error, 'createJob');
      throw error;
    }
  }, [user, clearError, handleError]);

  const updateJobStatus = useCallback(async (jobId: string, status: string) => {
    if (!user) return;

    try {
      await JobService.updateJob(jobId, { status } as any);
      
      // Update local state
      setMyJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status } : job
      ));
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status } : job
      ));
      
      clearError();
    } catch (error) {
      handleError(error, 'updateJobStatus');
    }
  }, [user, clearError, handleError]);

  const deleteJob = useCallback(async (jobId: string) => {
    if (!user) return;

    try {
      await JobService.deleteJob(jobId, user.id);
      
      // Remove from local state
      setMyJobs(prev => prev.filter(job => job.id !== jobId));
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      clearError();
    } catch (error) {
      handleError(error, 'deleteJob');
    }
  }, [user, clearError, handleError]);

  const submitApplication = useCallback(async (jobId: string, applicationData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const application = await JobService.submitApplication({
        job_id: jobId,
        applicant_id: user.id,
        ...applicationData
      });
      
      // Add to applications list
      setApplications(prev => [application, ...prev]);
      clearError();
      return application;
    } catch (error) {
      handleError(error, 'submitApplication');
      throw error;
    }
  }, [user, clearError, handleError]);

  const updateApplicationStatus = useCallback(async (applicationId: string, status: string) => {
    if (!user) return;

    try {
      await JobService.updateApplicationStatus(applicationId, status as any, user.id);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
      
      clearError();
    } catch (error) {
      handleError(error, 'updateApplicationStatus');
    }
  }, [user, clearError, handleError]);

  const refreshData = useCallback(async () => {
    if (!user) return;

    await Promise.all([
      loadJobs(),
      loadMyJobs(),
      loadApplications(),
      loadStats()
    ]);
  }, [user, loadJobs, loadMyJobs, loadApplications, loadStats]);

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setJobs([]);
      setMyJobs([]);
      setApplications([]);
      setStats(null);
    }
  }, [user, refreshData]);

  const value: JobContextType = {
    // State
    jobs,
    myJobs,
    applications,
    stats,
    loading,
    error,
    
    // Actions
    loadJobs,
    loadMyJobs,
    loadApplications,
    loadStats,
    searchJobs,
    createJob,
    updateJobStatus,
    deleteJob,
    submitApplication,
    updateApplicationStatus,
    
    // Utilities
    refreshData,
    clearError
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export default JobContext;