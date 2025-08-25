import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  User, 
  Euro, 
  Briefcase,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface NotificationsPageProps {
  isDark: boolean;
  onBack: () => void;
}


interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  message: string;
  hourly_rate: number | null;
  estimated_hours: number | null;
  experience: string;
  portfolio: string;
  status: 'pending' | 'accepted' | 'rejected';
  read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ isDark, onBack }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [readApplications, setReadApplications] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      // Load applications for jobs created by current user
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner(
            id,
            title,
            created_by
          )
        `)
        .eq('jobs.created_by', 'temp-user-id') // TODO: Replace with actual user ID
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markApplicationAsRead = (applicationId: string) => {
    setReadApplications(prev => new Set([...prev, applicationId]));
  };

  const isApplicationUnread = (applicationId: string) => {
    return !readApplications.has(applicationId);
  };


  const handleApplicationAction = async (applicationId: string, action: 'accepted' | 'rejected') => {
    setActionLoading(applicationId);
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: action })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: action } : app
        )
      );

      // Create notification for applicant
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        // Application status updated successfully
      }

    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std`;
    return `vor ${Math.floor(diffInMinutes / 1440)} Tagen`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'accepted': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Lädt Benachrichtigungen...
        </div>
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
              onClick={onBack}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Benachrichtigungen
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Bewerbungen und Updates
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Bell className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
          </div>
        </div>

        {/* Applications Section */}
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Bewerbungen auf Ihre Jobs ({applications.length})
          </h2>
          
          {applications.length === 0 ? (
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border text-center`}>
              <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Noch keine Bewerbungen erhalten
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                const isUnread = isApplicationUnread(application.id);
                return (
                  <div
                    key={application.id}
                    onClick={() => markApplicationAsRead(application.id)}
                    className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                      isUnread ? 'ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/20 animate-pulse' : ''
                    }`}
                  >
                    {isUnread && (
                      <div className="absolute top-3 right-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center`}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {isUnread ? '🔥 Neue Bewerbung' : 'Bewerbung'}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            Job: React Login-Komponente erstellen
                          </p>
                          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                            {application.message}
                          </p>
                          
                          {application.hourly_rate && (
                            <div className="flex items-center space-x-4 text-sm mb-3">
                              <div className="flex items-center text-green-500">
                                <Euro className="w-4 h-4 mr-1" />
                                {application.hourly_rate}/h
                              </div>
                              {application.estimated_hours && (
                                <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Clock className="w-4 h-4 mr-1" />
                                  {application.estimated_hours}h geschätzt
                                </div>
                              )}
                            </div>
                          )}

                          {application.experience && (
                            <div className="mb-3">
                              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Erfahrung:
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {application.experience}
                              </p>
                            </div>
                          )}

                          {application.portfolio && (
                            <div className="mb-3">
                              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Portfolio:
                              </p>
                              <a 
                                href={application.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 text-sm underline"
                              >
                                {application.portfolio}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                          application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          application.status === 'accepted' ? 'bg-green-500/20 text-green-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="capitalize">
                            {application.status === 'pending' ? 'Wartend' :
                             application.status === 'accepted' ? 'Angenommen' : 'Abgelehnt'}
                          </span>
                        </div>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatTimeAgo(application.created_at)}
                        </span>
                      </div>
                    </div>

                    {application.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApplicationAction(application.id, 'accepted')}
                          disabled={actionLoading === application.id}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>{actionLoading === application.id ? 'Wird angenommen...' : 'Annehmen'}</span>
                        </button>
                        <button
                          onClick={() => handleApplicationAction(application.id, 'rejected')}
                          disabled={actionLoading === application.id}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>{actionLoading === application.id ? 'Wird abgelehnt...' : 'Ablehnen'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* General Notifications */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Alle Benachrichtigungen (0)
          </h2>
          
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border text-center`}>
            <Bell className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Keine Benachrichtigungen vorhanden
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;