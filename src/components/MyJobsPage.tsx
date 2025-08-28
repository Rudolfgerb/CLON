import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Briefcase, Eye, Edit, Trash2, Users, MessageSquare, Clock, Euro, Star } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase, JobPost } from '../lib/supabase';

interface Profile {
  id: string;
  premium: boolean;
}

interface MyJobsPageProps {
  isDark: boolean;
  user: User;
  userProfile: Profile | null;
  onBackToBrowse: () => void;
}

const MyJobsPage: React.FC<MyJobsPageProps> = ({ isDark, user, userProfile, onBackToBrowse }) => {
  const [myJobs, setMyJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  const loadMyJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications (
            id,
            status,
            applicant_id,
            profiles:applicant_id (
              full_name,
              email
            )
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyJobs(data || []);
    } catch (error) {
      console.error('Error loading my jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadMyJobs();
  }, [loadMyJobs]);

  const deleteJob = async (jobId: string) => {
    if (!confirm('Möchten Sie diesen Job wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('creator_id', user.id); // Security: Only allow deleting own jobs

      if (error) throw error;
      setMyJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .eq('creator_id', user.id);

      if (error) throw error;
      
      setMyJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: newStatus } 
          : job
      ));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const getJobStats = (job: JobPost) => {
    const applications = job.applications || [];
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
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

  const formatPayment = (job: JobPost) => {
    if (job.payment_type === 'cash') {
      return `€${job.cash_amount?.toFixed(2) || '0.00'}`;
    }
    return `${job.karma_amount || 0} Karma`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Lädt Ihre Jobs...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToBrowse}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Meine Jobs
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {myJobs.length} Jobs erstellt
              </p>
            </div>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
            <span>Neuer Job</span>
          </button>
        </div>

        {/* Stats Overview */}
        {myJobs.length > 0 && (
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border mb-6`}>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {myJobs.length}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Gesamt</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {myJobs.filter(job => job.status === 'open').length}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Offen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {myJobs.reduce((total, job) => total + (job.applications?.length || 0), 0)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Bewerbungen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">
                  {myJobs.filter(job => job.status === 'completed').length}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Fertig</div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-4">
          {myJobs.length === 0 ? (
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border text-center`}>
              <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Noch keine Jobs erstellt
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Erstellen Sie Ihren ersten Job und finden Sie qualifizierte Bewerber
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium">
                Ersten Job erstellen
              </button>
            </div>
          ) : (
            myJobs.map((job) => {
              const stats = getJobStats(job);
              return (
                <div
                  key={job.id}
                  className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        job.payment_type === 'cash' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        {job.payment_type === 'cash' ? <Euro className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                          {job.title}
                        </h3>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2`}>
                          {job.description.length > 100 ? job.description.substring(0, 100) + '...' : job.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-green-500">
                            {job.payment_type === 'cash' ? <Euro className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                            {formatPayment(job)}
                          </div>
                          <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(job.created_at).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Application Stats */}
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'} mb-4`}>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-500">{stats.total}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Bewerbungen</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-500">{stats.pending}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Wartend</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-500">{stats.accepted}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Angenommen</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-500">{stats.rejected}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Abgelehnt</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isDark 
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ansehen</span>
                    </button>
                    
                    {stats.total > 0 && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>Bewerbungen ({stats.total})</span>
                      </button>
                    )}
                    
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors">
                      <Edit className="w-4 h-4" />
                      <span>Bearbeiten</span>
                    </button>
                    
                    {job.status === 'open' && stats.total === 0 && (
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Löschen</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Status Actions */}
                  {job.status === 'open' && (
                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-600">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateJobStatus(job.id, 'in_progress')}
                          className="text-sm px-3 py-1 bg-blue-500/20 text-blue-600 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          In Arbeit setzen
                        </button>
                        <button
                          onClick={() => updateJobStatus(job.id, 'cancelled')}
                          className="text-sm px-3 py-1 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}

                  {job.status === 'in_progress' && (
                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-600">
                      <button
                        onClick={() => updateJobStatus(job.id, 'completed')}
                        className="text-sm px-3 py-1 bg-green-500/20 text-green-600 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Als fertig markieren
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobsPage;