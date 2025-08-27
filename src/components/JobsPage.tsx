import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Clock, Euro, Star, Briefcase, Crown, Calculator, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import JobApplicationModal from './JobApplicationModal';
import { calculateJobCommission } from '../lib/stripe';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  job_type: 'cash' | 'karma';
  hourly_rate: number | null;
  estimated_hours: number | null;
  fixed_amount: number | null;
  karma_reward: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  status: string;
  created_by: string;
  created_at: string;
}

interface Profile {
  id: string;
  premium: boolean;
}

interface JobsPageProps {
  isDark: boolean;
  user: User;
  userProfile: Profile | null;
}

const JobsPage: React.FC<JobsPageProps> = ({ isDark, user, userProfile }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const filters = [
    { id: 'all', label: 'Alle Jobs', icon: null },
    { id: 'cash', label: 'Cash Jobs', icon: Euro },
    { id: 'karma', label: 'Karma Jobs', icon: Star }
  ] as const;
  type FilterId = typeof filters[number]['id'];

  const [selectedFilter, setSelectedFilter] = useState<FilterId>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || job.job_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatPayment = (job: Job) => {
    if (job.job_type === 'cash') {
      const amount = job.fixed_amount || (job.hourly_rate * job.estimated_hours);
      return `€${amount.toFixed(2)}`;
    }
    return `${job.karma_reward} Karma`;
  };

  const getNetPayment = (job: Job) => {
    if (job.job_type === 'cash') {
      const amount = job.fixed_amount || (job.hourly_rate * job.estimated_hours);
      const commission = calculateJobCommission(amount, userProfile?.premium || false);
      return `€${commission.netAmount.toFixed(2)} netto`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Lädt Jobs...</div>
      </div>
    );
  }

  return (
    <>
      {/* Application Modal */}
      <JobApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        isDark={isDark}
        job={selectedJob}
        user={user}
        userProfile={userProfile}
        onSuccess={() => {
          setSelectedJob(null);
        }}
      />

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedJob.title}
                </h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedJob.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-green-500">
                    {selectedJob.job_type === 'cash' ? <Euro className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                    {formatPayment(selectedJob)}
                  </div>
                  <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedJob.location}
                  </div>
                  <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedJob.estimated_hours}h
                  </div>
                </div>

                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Commission Breakdown for Cash Jobs */}
              {selectedJob.job_type === 'cash' && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border mb-4`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Calculator className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Zahlungsübersicht
                    </span>
                    {userProfile?.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Bruttobetrag:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>€{(selectedJob.fixed_amount || (selectedJob.hourly_rate * selectedJob.estimated_hours)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Provision ({userProfile?.premium ? '5%' : '9.8%'}):</span>
                      <span className="text-red-500">-€{calculateJobCommission(selectedJob.fixed_amount || (selectedJob.hourly_rate * selectedJob.estimated_hours), userProfile?.premium || false).commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-500 pt-2 border-t border-gray-300">
                      <span>Sie erhalten:</span>
                      <span>€{calculateJobCommission(selectedJob.fixed_amount || (selectedJob.hourly_rate * selectedJob.estimated_hours), userProfile?.premium || false).netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    setShowApplicationModal(true);
                  }}
                  className={`w-full py-4 rounded-xl font-semibold transition-transform duration-300 ${
                    selectedJob.job_type === 'cash'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  }`}
                >
                  Bewerbung senden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Jobs</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredJobs.length} verfügbare Jobs
              </p>
            </div>
          </div>

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

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-3 rounded-2xl font-semibold flex items-center space-x-2 ${
                  selectedFilter === filter.id
                    ? filter.id === 'cash'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : filter.id === 'karma'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : isDark
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.icon && <filter.icon className="w-4 h-4" />}
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border text-center`}>
                <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Keine Jobs gefunden</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border cursor-pointer hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      job.job_type === 'cash' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600' 
                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}>
                      {job.job_type === 'cash' ? <Euro className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                        {job.title}
                      </h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-3`}>
                        {job.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-green-500">
                          {job.job_type === 'cash' ? <Euro className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                          {formatPayment(job)}
                        </div>
                        {job.job_type === 'cash' && (
                          <div className="flex items-center text-blue-500">
                            <Calculator className="w-4 h-4 mr-1" />
                            {getNetPayment(job)}
                          </div>
                        )}
                        <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Clock className="w-4 h-4 mr-1" />
                          {job.estimated_hours}h
                        </div>
                      </div>

                      {/* Premium Badge for better rates */}
                      {job.job_type === 'cash' && userProfile?.premium && (
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
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobsPage;