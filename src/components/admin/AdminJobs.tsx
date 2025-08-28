import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Search, Euro, Star, MapPin, Clock,
  Eye, Trash2, CheckCircle, XCircle, Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminJobsProps {
  isDark: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  job_type: 'cash' | 'karma';
  hourly_rate: number | null;
  fixed_amount: number | null;
  karma_reward: number | null;
  estimated_hours: number;
  status: string;
  created_at: string;
  created_by: string;
  profiles: {
    full_name: string;
    email: string;
  };
  applications: { id: string; status: string }[];
}

const AdminJobs: React.FC<AdminJobsProps> = ({ isDark }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            email
          ),
          applications (
            id,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;
      loadJobs(); // Refresh data
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Job löschen möchten?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      loadJobs(); // Refresh data
    } catch (error) {
      console.error('Error deleting job:', error);
    }
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

  const formatPayment = (job: Job) => {
    if (job.job_type === 'cash') {
      return job.fixed_amount ? `€${job.fixed_amount}` : `€${job.hourly_rate}/h`;
    }
    return `${job.karma_reward} Karma`;
  };

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;
      loadJobs(); // Refresh data
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Job löschen möchten?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      loadJobs(); // Refresh data
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatPayment = (job: Job) => {
    if (job.job_type === 'cash') {
      return job.fixed_amount ? `€${job.fixed_amount}` : `€${job.hourly_rate}/h`;
    }
    return `${job.karma_reward} Karma`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-600';
      case 'completed': return 'bg-blue-500/20 text-blue-600';
      case 'cancelled': return 'bg-red-500/20 text-red-600';
      case 'paused': return 'bg-yellow-500/20 text-yellow-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Jobs werden geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
              Job Verwaltung
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredJobs.length} von {jobs.length} Jobs
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Jobs suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="all">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Abgebrochen</option>
              <option value="paused">Pausiert</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="all">Alle Typen</option>
              <option value="cash">Cash Jobs</option>
              <option value="karma">Karma Jobs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job Details
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ersteller
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bezahlung
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bewerbungen
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              {filteredJobs.map((job) => (
                <tr key={job.id} className={`border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <td className="px-6 py-4">
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {job.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {job.category}
                        </span>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.estimated_hours}h
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {job.profiles?.full_name || 'Unbekannt'}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {job.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {job.job_type === 'cash' ? (
                        <Euro className="w-4 h-4 text-green-500" />
                      ) : (
                        <Star className="w-4 h-4 text-purple-500" />
                      )}
                      <span className={`font-medium ${
                        job.job_type === 'cash' ? 'text-green-500' : 'text-purple-500'
                      }`}>
                        {formatPayment(job)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {job.applications?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 rounded text-blue-500 hover:bg-blue-500/10"
                        title="Anzeigen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {job.status === 'active' ? (
                        <button 
                          onClick={() => updateJobStatus(job.id, 'paused')}
                          className="p-1 rounded text-yellow-500 hover:bg-yellow-500/10"
                          title="Pausieren"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateJobStatus(job.id, 'active')}
                          className="p-1 rounded text-green-500 hover:bg-green-500/10"
                          title="Aktivieren"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => deleteJob(job.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="py-12 text-center">
            <Briefcase className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-4`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Keine Jobs gefunden
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;