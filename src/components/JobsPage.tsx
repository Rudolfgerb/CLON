import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Clock, Euro, Star, Briefcase, Crown, Calculator, X, Filter, Grid, List, Plus } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase, JobPost } from '../lib/supabase';
import JobApplicationModal from './JobApplicationModal';
import JobDetailsModal from './JobDetailsModal';
import MyJobsPage from './MyJobsPage';
import { calculateJobCommission } from '../lib/stripe';

interface Profile {
  id: string;
  premium: boolean;
  karma: number;
}

interface JobsPageProps {
  isDark: boolean;
  user: User;
  userProfile: Profile | null;
}

const JobsPage: React.FC<JobsPageProps> = ({ isDark, user, userProfile }) => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'my-jobs', 'applications'
  const [jobTypeFilter, setJobTypeFilter] = useState('all'); // 'all', 'cash', 'karma'
  const [statusFilter, setStatusFilter] = useState('open');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'payment-high', 'payment-low'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid'
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            premium,
            username
          ),
          applications (
            id,
            status,
            applicant_id
          )
        `);

      // Apply filters based on active tab
      if (activeTab === 'browse') {
        query = query
          .eq('status', statusFilter)
          .neq('creator_id', user.id); // Don't show own jobs in browse
      } else if (activeTab === 'my-jobs') {
        query = query.eq('creator_id', user.id);
      } else if (activeTab === 'applications') {
        // Get jobs where user has applied
        const { data: userApplications } = await supabase
          .from('applications')
          .select('job_id')
          .eq('applicant_id', user.id);
        
        if (userApplications && userApplications.length > 0) {
          const jobIds = userApplications.map(app => app.job_id);
          query = query.in('id', jobIds);
        } else {
          setJobs([]);
          setLoading(false);
          return;
        }
      }

      // Apply job type filter
      if (jobTypeFilter !== 'all') {
        query = query.eq('payment_type', jobTypeFilter);
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      let processedData = data || [];

      // Sort by payment amount if needed
      if (sortBy === 'payment-high' || sortBy === 'payment-low') {
        processedData.sort((a, b) => {
          const aAmount = a.cash_amount || a.karma_amount || 0;
          const bAmount = b.cash_amount || b.karma_amount || 0;
          return sortBy === 'payment-high' ? bAmount - aAmount : aAmount - bAmount;
        });
      }

      setJobs(processedData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, jobTypeFilter, sortBy, user.id]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatPayment = (job: JobPost) => {
    if (job.payment_type === 'cash') {
      return `€${job.cash_amount?.toFixed(2) || '0.00'}`;
    }
    return `${job.karma_amount || 0} Karma`;
  };

  const getNetPayment = (job: JobPost) => {
    if (job.payment_type === 'cash' && job.cash_amount) {
      const commission = calculateJobCommission(job.cash_amount, userProfile?.premium || false);
      return `€${commission.netAmount.toFixed(2)} netto`;
    }
    return null;
  };

  const getJobStats = (job: JobPost) => {
    const applications = job.applications || [];
    return {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      userHasApplied: applications.some(app => app.applicant_id === user.id)
    };
  };

  const tabs = [
    { id: 'browse', label: 'Jobs durchsuchen', icon: Search },
    { id: 'my-jobs', label: 'Meine Jobs', icon: Briefcase },
    { id: 'applications', label: 'Bewerbungen', icon: Star }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Lädt Jobs...</div>
      </div>
    );
  }

  // If viewing my jobs, render the MyJobs component
  if (activeTab === 'my-jobs') {
    return (
      <MyJobsPage 
        isDark={isDark} 
        user={user} 
        userProfile={userProfile}
        onBackToBrowse={() => setActiveTab('browse')}
      />
    );
  }

  return (
    <>
      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={showJobDetails}
        onClose={() => {
          setShowJobDetails(false);
          setSelectedJob(null);
        }}
        isDark={isDark}
        job={selectedJob}
        user={user}
        userProfile={userProfile}
        onApply={() => {
          setShowJobDetails(false);
          setShowApplicationModal(true);
        }}
      />

      {/* Application Modal */}
      <JobApplicationModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedJob(null);
        }}
        isDark={isDark}
        job={selectedJob}
        user={user}
        userProfile={userProfile}
        onSuccess={() => {
          loadJobs(); // Refresh to update application status
        }}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Jobs</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredJobs.length} verfügbare Jobs
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <Filter className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                {viewMode === 'list' ? (
                  <Grid className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                ) : (
                  <List className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : isDark
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border mb-6`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Job-Typ
                  </label>
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="all">Alle Typen</option>
                    <option value="cash">Cash Jobs</option>
                    <option value="karma">Karma Jobs</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="open">Offen</option>
                    <option value="in_progress">In Arbeit</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sortieren nach
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="newest">Neueste zuerst</option>
                    <option value="oldest">Älteste zuerst</option>
                    <option value="payment-high">Bezahlung: Hoch zu Niedrig</option>
                    <option value="payment-low">Bezahlung: Niedrig zu Hoch</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-medium"
                  >
                    Filter anwenden
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Jobs durchsuchen..."
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Quick Stats for current view */}
          {activeTab === 'browse' && (
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border mb-6`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {jobs.filter(j => j.payment_type === 'cash').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Cash Jobs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {jobs.filter(j => j.payment_type === 'karma').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Karma Jobs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {jobs.filter(j => j.applications?.some(app => app.status === 'pending')).length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Wartende</div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs List/Grid */}
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
              : 'space-y-4'
          }`}>
            {filteredJobs.length === 0 ? (
              <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border text-center col-span-full`}>
                <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {activeTab === 'browse' ? 'Keine Jobs gefunden' : 
                   activeTab === 'my-jobs' ? 'Noch keine Jobs erstellt' : 
                   'Keine Bewerbungen vorhanden'}
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {activeTab === 'browse' ? 'Versuche andere Filter oder erstelle selbst einen Job' :
                   activeTab === 'my-jobs' ? 'Erstelle deinen ersten Job und starte durch' :
                   'Bewirb dich für interessante Jobs'}
                </p>
                {activeTab !== 'applications' && (
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium">
                    {activeTab === 'browse' ? 'Jobs durchsuchen' : 'Job erstellen'}
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job) => {
                const stats = getJobStats(job);
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    isDark={isDark}
                    viewMode={viewMode}
                    showOwnerActions={activeTab === 'my-jobs'}
                    showApplicationStatus={activeTab === 'applications'}
                    stats={stats}
                    userProfile={userProfile}
                    onViewDetails={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                    onApply={() => {
                      setSelectedJob(job);
                      setShowApplicationModal(true);
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Enhanced Job Card Component
interface JobCardProps {
  job: JobPost;
  isDark: boolean;
  viewMode: 'list' | 'grid';
  showOwnerActions?: boolean;
  showApplicationStatus?: boolean;
  stats?: {
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    userHasApplied: boolean;
  };
  userProfile: Profile | null;
  onViewDetails: () => void;
  onApply: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  isDark,
  viewMode,
  showOwnerActions = false,
  showApplicationStatus = false,
  stats,
  userProfile,
  onViewDetails,
  onApply
}) => {
  const formatPayment = (job: JobPost) => {
    if (job.payment_type === 'cash') {
      return `€${job.cash_amount?.toFixed(2) || '0.00'}`;
    }
    return `${job.karma_amount || 0} Karma`;
  };

  const getNetPayment = (job: JobPost) => {
    if (job.payment_type === 'cash' && job.cash_amount) {
      const commission = calculateJobCommission(job.cash_amount, userProfile?.premium || false);
      return `€${commission.netAmount.toFixed(2)} netto`;
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-600';
      case 'in_progress': return 'bg-blue-500/20 text-blue-600';
      case 'completed': return 'bg-purple-500/20 text-purple-600';
      case 'cancelled': return 'bg-red-500/20 text-red-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  return (
    <div
      className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border cursor-pointer hover:scale-[1.02] transition-all duration-300 ${
        viewMode === 'grid' ? 'flex flex-col' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          job.payment_type === 'cash' 
            ? 'bg-gradient-to-br from-green-500 to-green-600' 
            : 'bg-gradient-to-br from-purple-500 to-purple-600'
        }`}>
          {job.payment_type === 'cash' ? <Euro className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {job.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>
          
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-3`}>
            {job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}
          </p>
          
          <div className="flex items-center flex-wrap gap-2 text-sm mb-3">
            <div className="flex items-center text-green-500">
              {job.payment_type === 'cash' ? <Euro className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
              {formatPayment(job)}
            </div>
            {job.payment_type === 'cash' && getNetPayment(job) && (
              <div className="flex items-center text-blue-500">
                <Calculator className="w-4 h-4 mr-1" />
                {getNetPayment(job)}
              </div>
            )}
            <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Clock className="w-4 h-4 mr-1" />
              {job.expected_duration || 1}h
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {job.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span className={`px-2 py-1 rounded-full text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  +{job.tags.length - 3} mehr
                </span>
              )}
            </div>
          )}

          {/* Application Status for user's applications */}
          {showApplicationStatus && stats?.userHasApplied && (
            <div className="mb-3">
              <span className="inline-flex items-center space-x-1 bg-blue-500/20 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                <span>Bewerbung eingereicht</span>
              </span>
            </div>
          )}

          {/* Owner stats */}
          {showOwnerActions && stats && (
            <div className="flex items-center space-x-4 mb-3 text-sm">
              <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{stats.totalApplications} Bewerbungen</span>
              </div>
              {stats.pendingApplications > 0 && (
                <div className="flex items-center text-yellow-500">
                  <span>{stats.pendingApplications} warten</span>
                </div>
              )}
              {stats.acceptedApplications > 0 && (
                <div className="flex items-center text-green-500">
                  <span>{stats.acceptedApplications} angenommen</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={onViewDetails}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isDark 
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Details ansehen
            </button>
            
            {!showOwnerActions && !stats?.userHasApplied && (
              <button
                onClick={onApply}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
                  job.payment_type === 'cash'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-105'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105'
                }`}
              >
                Bewerben
              </button>
            )}
            
            {showOwnerActions && (
              <button
                onClick={onViewDetails}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:scale-105 transition-all"
              >
                Verwalten
              </button>
            )}
          </div>

          {/* Premium Badge for better rates */}
          {job.payment_type === 'cash' && userProfile?.premium && !showOwnerActions && (
            <div className="mt-2">
              <span className="inline-flex items-center space-x-1 bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" />
                <span>Premium: Nur 5% Provision</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;