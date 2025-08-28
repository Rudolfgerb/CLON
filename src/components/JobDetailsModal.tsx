import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Euro, Star, Calculator, Crown, Calendar, User, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, JobPost } from '../lib/supabase';
import { calculateJobCommission } from '../lib/stripe';

interface Profile {
  id: string;
  premium: boolean;
  karma: number;
}

interface Application {
  id: string;
  applicant_id: string;
  cover_letter: string;
  proposed_amount: number | null;
  estimated_time: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    karma: number;
    premium: boolean;
  };
}

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  job: JobPost | null;
  user: SupabaseUser;
  userProfile: Profile | null;
  onApply: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  job,
  user,
  userProfile,
  onApply
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loadingApplications, setLoadingApplications] = useState(false);

  const isOwner = job?.creator_id === user.id;

  useEffect(() => {
    if (isOpen && job && isOwner) {
      loadApplications();
    }
  }, [isOpen, job, isOwner]);

  const loadApplications = async () => {
    if (!job) return;
    
    setLoadingApplications(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:applicant_id (
            full_name,
            email,
            karma,
            premium
          )
        `)
        .eq('job_id', job.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: action === 'accept' ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;
      
      // Reload applications
      await loadApplications();
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
    }
  };

  if (!isOpen || !job) return null;

  const formatPayment = (job: JobPost) => {
    if (job.payment_type === 'cash') {
      return `€${job.cash_amount?.toFixed(2) || '0.00'}`;
    }
    return `${job.karma_amount || 0} Karma`;
  };

  const getNetPayment = (job: JobPost) => {
    if (job.payment_type === 'cash' && job.cash_amount) {
      const commission = calculateJobCommission(job.cash_amount, userProfile?.premium || false);
      return commission.netAmount;
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600';
      case 'accepted': return 'bg-green-500/20 text-green-600';
      case 'rejected': return 'bg-red-500/20 text-red-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const userHasApplied = applications.some(app => app.applicant_id === user.id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border shadow-2xl`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                job.payment_type === 'cash' 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
              }`}>
                {job.payment_type === 'cash' ? <Euro className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {job.title}
                </h2>
                <div className="flex items-center space-x-2 text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    von {job.profiles?.full_name || 'Unbekannt'}
                  </span>
                  {job.profiles?.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>

          {/* Tab Navigation for owners */}
          {isOwner && (
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Job Details
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  activeTab === 'applications'
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Bewerbungen ({applications.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Payment Overview */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Zahlungsübersicht
                  </span>
                  {userProfile?.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                
                {job.payment_type === 'cash' && job.cash_amount ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Bruttobetrag:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>€{job.cash_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                        Provision ({userProfile?.premium ? '5%' : '9.8%'}):
                      </span>
                      <span className="text-red-500">
                        -€{calculateJobCommission(job.cash_amount, userProfile?.premium || false).commission.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-500 pt-2 border-t border-gray-300">
                      <span>Sie erhalten:</span>
                      <span>€{getNetPayment(job)?.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Karma Belohnung:</span>
                      <span className="text-purple-500 font-bold">{job.karma_amount || 0} Karma</span>
                    </div>
                    {job.additional_cash && job.additional_cash > 0 && (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Zusätzliches Geld:</span>
                        <span className="text-green-500 font-bold">€{job.additional_cash.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Job Information */}
              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Beschreibung
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {job.description}
                  </p>
                </div>

                {job.deliverables && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Lieferobjekte
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {job.deliverables}
                    </p>
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Anforderungen
                    </h3>
                    <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Job Meta Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString('de-DE') : 'Keine'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Dauer: {job.expected_duration || 1} Stunden
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Schwierigkeit: {job.difficulty_level || 'medium'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-orange-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Erstellt: {new Date(job.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Button for non-owners */}
              {!isOwner && (
                <div className="pt-4 border-t border-slate-600">
                  <button
                    onClick={onApply}
                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                      job.payment_type === 'cash'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-105'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105'
                    }`}
                  >
                    Jetzt bewerben
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Applications Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bewerbungen ({applications.length})
                </h3>
                {loadingApplications && (
                  <div className="text-sm text-blue-500">Lädt...</div>
                )}
              </div>

              {applications.length === 0 ? (
                <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl p-8 border text-center`}>
                  <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Noch keine Bewerbungen für diesen Job
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            application.profiles.premium 
                              ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-500'
                          }`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {application.profiles.full_name}
                              </span>
                              {application.profiles.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {application.profiles.karma} Karma
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                • {new Date(application.created_at).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status === 'pending' ? 'Wartend' :
                           application.status === 'accepted' ? 'Angenommen' :
                           application.status === 'rejected' ? 'Abgelehnt' : application.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {application.cover_letter}
                        </p>
                      </div>

                      {application.proposed_amount && (
                        <div className="mb-3">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Vorgeschlagener Betrag: 
                          </span>
                          <span className="text-green-500 font-medium ml-2">
                            €{application.proposed_amount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Actions for pending applications */}
                      {application.status === 'pending' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => handleApplicationAction(application.id, 'accept')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Annehmen</span>
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'reject')}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Ablehnen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions for non-owners */}
        {!isOwner && (
          <div className="p-6 border-t border-slate-700">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-medium border ${
                  isDark 
                    ? 'border-slate-600 text-gray-300 hover:bg-slate-700' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Schließen
              </button>
              {!userHasApplied && (
                <button
                  onClick={onApply}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all ${
                    job.payment_type === 'cash'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-105'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105'
                  }`}
                >
                  Bewerben
                </button>
              )}
              {userHasApplied && (
                <div className="flex-1 flex items-center justify-center text-blue-500 font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Bewerbung eingereicht
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsModal;