import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Euro, Star, Briefcase, X, Send, User, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface JobsPageProps {
  isDark: boolean;
  user: any;
}

const JobsPage: React.FC<JobsPageProps> = ({ isDark, user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cash' | 'karma'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    message: '',
    hourlyRate: '',
    experience: ''
  });
  const [applicationLoading, setApplicationLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
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
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || job.job_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatPayment = (job: Job) => {
    if (job.job_type === 'cash') {
      return job.fixed_amount ? `€${job.fixed_amount}` : `€${job.hourly_rate}/h`;
    }
    return `${job.karma_reward} Karma`;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplicationLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: selectedJob.id,
          applicant_id: user.id,
          message: applicationData.message,
          hourly_rate: applicationData.hourlyRate ? parseFloat(applicationData.hourlyRate) : null,
          experience: applicationData.experience,
          status: 'pending'
        });

      if (error) throw error;
      
      setShowApplicationModal(false);
      setApplicationData({ message: '', hourlyRate: '', experience: '' });
    } catch (error: any) {
      console.error('Error applying:', error);
    } finally {
      setApplicationLoading(false);
    }
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
      {/* Job Details Modal */}
      {selectedJob && !showApplicationModal && (
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

              <button
                onClick={() => setShowApplicationModal(true)}
                className={`w-full py-4 rounded-xl font-semibold transition-transform duration-300 ${
                  selectedJob.job_type === 'cash'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                }`}
              >
                Jetzt bewerben
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-md border shadow-2xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bewerbung senden
                </h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nachricht
                  </label>
                  <textarea
                    rows={4}
                    value={applicationData.message}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Warum sind Sie der richtige Kandidat?"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                    required
                  />
                </div>

                {selectedJob.job_type === 'cash' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ihr Stundensatz (€)
                    </label>
                    <input
                      type="number"
                      value={applicationData.hourlyRate}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="25.00"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={applicationLoading}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 ${
                    selectedJob.job_type === 'cash'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  } disabled:opacity-50`}
                >
                  <Send className="w-5 h-5" />
                  <span>{applicationLoading ? 'Wird gesendet...' : 'Bewerbung senden'}</span>
                </button>
              </form>
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
            {[
              { id: 'all', label: 'Alle Jobs', icon: null },
              { id: 'cash', label: 'Cash Jobs', icon: Euro },
              { id: 'karma', label: 'Karma Jobs', icon: Star }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id as any)}
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
                        <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Clock className="w-4 h-4 mr-1" />
                          {job.estimated_hours}h
                        </div>
                      </div>
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