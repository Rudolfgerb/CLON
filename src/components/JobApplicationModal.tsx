import React, { useState } from 'react';
import { X, Send, Star, AlertTriangle, Crown, Calculator } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase, JobPost } from '../lib/supabase';
import { calculateJobCommission } from '../lib/stripe';

interface Profile {
  id: string;
  karma: number;
  premium: boolean;
}

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  job: JobPost | null;
  user: User;
  userProfile: Profile | null;
  onSuccess: () => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  isDark,
  job,
  user,
  userProfile,
  onSuccess
}) => {
  const [applicationData, setApplicationData] = useState({
    message: '',
    hourlyRate: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check karma for karma jobs
      if (job.job_type === 'karma' && userProfile.karma < (job.karma_reward || 0)) {
        throw new Error('Nicht genügend Karma für diese Bewerbung');
      }

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          applicant_id: user.id,
          message: applicationData.message,
          proposed_hourly_rate: applicationData.hourlyRate ? parseFloat(applicationData.hourlyRate) : null,
          experience: applicationData.experience,
          status: 'pending'
        });

      if (error) throw error;
      
      onSuccess();
      onClose();
      setApplicationData({ message: '', hourlyRate: '', experience: '' });
    } catch (error) {
      const err = error as { message?: string };
      setError(err.message || 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const jobAmount = job.fixed_amount || ((job.hourly_rate || 0) * job.estimated_hours);
  const commission = job.job_type === 'cash' ? calculateJobCommission(jobAmount, userProfile?.premium || false) : null;

  // Check if user has enough karma for karma jobs

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-md border shadow-2xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bewerbung senden
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>

          {/* Job Payment Info for Cash Jobs */}
          {job.job_type === 'cash' && commission && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border mb-6`}>
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Zahlungsübersicht
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Bruttobetrag:</span>
                  <span>€{commission.grossAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      Provision ({commission.commissionRate}%):
                    </span>
                    {userProfile?.premium && <Crown className="w-3 h-3 text-yellow-500" />}
                  </span>
                  <span className="text-red-500">-€{commission.commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-green-500">
                  <span>Sie erhalten:</span>
                  <span>€{commission.netAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {!userProfile?.premium && (
                <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className={`text-xs ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                      Mit Premium nur 5% Provision! Spare €{(commission.grossAmount * 0.048).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Karma Job Info */}
          {job.job_type === 'karma' && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-500/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border mb-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Karma Job
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-500">
                    {job.karma_reward} Karma
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Du hast: {userProfile?.karma || 0}
                  </div>
                </div>
              </div>
              
              {!hasEnoughKarma && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className={`text-xs ${isDark ? 'text-red-200' : 'text-red-700'}`}>
                      Nicht genügend Karma! Du benötigst {(job.karma_reward || 0) - (userProfile?.karma || 0)} mehr Karma.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {job.job_type === 'cash' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ihr Stundensatz (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={applicationData.hourlyRate}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="25.00"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Erfahrung
              </label>
              <textarea
                rows={2}
                value={applicationData.experience}
                onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Relevante Erfahrung..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (job.job_type === 'karma' && !hasEnoughKarma)}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 ${
                job.job_type === 'cash'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
              } disabled:opacity-50`}
            >
              <Send className="w-5 h-5" />
              <span>
                {loading 
                  ? 'Wird gesendet...' 
                  : job.job_type === 'karma' && !hasEnoughKarma
                  ? 'Nicht genügend Karma'
                  : 'Bewerbung senden'
                }
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;