import React, { useState } from 'react';
import { X, Euro, Star, Save } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface CreateJobPageProps {
  isDark: boolean;
  user: User;
  onBack: () => void;
}

const CreateJobPage: React.FC<CreateJobPageProps> = ({ isDark, user, onBack }) => {
  const [jobType, setJobType] = useState<'cash' | 'karma'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: 'development',
    location: 'remote',
    hourlyRate: '',
    fixedAmount: '',
    karmaReward: '100',
    estimatedHours: '1',
    difficulty: 'easy',
    tags: '',
    requirements: ''
  });

  const categories = [
    { id: 'development', label: 'Entwicklung' },
    { id: 'design', label: 'Design' },
    { id: 'writing', label: 'Texte' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'other', label: 'Sonstiges' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = jobData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const jobPayload = {
        title: jobData.title,
        description: jobData.description,
        category: jobData.category,
        location: jobData.location,
        job_type: jobType,
        hourly_rate: jobType === 'cash' && jobData.hourlyRate ? parseFloat(jobData.hourlyRate) : null,
        fixed_amount: jobType === 'cash' && jobData.fixedAmount ? parseFloat(jobData.fixedAmount) : null,
        karma_reward: jobType === 'karma' ? parseInt(jobData.karmaReward) : null,
        estimated_hours: parseInt(jobData.estimatedHours),
        difficulty: jobData.difficulty,
        tags: tagsArray,
        requirements: jobData.requirements,
        status: 'active',
        created_by: user.id
      };

      const { error: insertError } = await supabase
        .from('jobs')
        .insert(jobPayload);

      if (insertError) throw insertError;

      setSuccess('Job erfolgreich erstellt!');
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error) {
      const err = error as { message?: string };
      setError(err.message || 'Fehler beim Erstellen des Jobs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Job erstellen
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Neuen Job veröffentlichen
              </p>
            </div>
          </div>
        </div>

        {/* Job Type Selection */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setJobType('cash')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                jobType === 'cash'
                  ? 'border-green-500 bg-green-500/20'
                  : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Euro className={`w-8 h-8 mx-auto mb-2 ${jobType === 'cash' ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cash Job</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bezahlte Arbeit</p>
            </button>

            <button
              onClick={() => setJobType('karma')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                jobType === 'karma'
                  ? 'border-purple-500 bg-purple-500/20'
                  : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Star className={`w-8 h-8 mx-auto mb-2 ${jobType === 'karma' ? 'text-purple-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Karma Job</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Community Hilfe</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Grundinformationen
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Titel
                </label>
                <input
                  type="text"
                  value={jobData.title}
                  onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="z.B. React Komponente erstellen"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Beschreibung
                </label>
                <textarea
                  rows={4}
                  value={jobData.description}
                  onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detaillierte Beschreibung..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Kategorie
                  </label>
                  <select
                    value={jobData.category}
                    onChange={(e) => setJobData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Standort
                  </label>
                  <input
                    type="text"
                    value={jobData.location}
                    onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Remote, Berlin..."
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {jobType === 'cash' ? 'Bezahlung' : 'Karma Belohnung'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {jobType === 'cash' ? (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Stundensatz (€)
                    </label>
                    <input
                      type="number"
                      value={jobData.hourlyRate}
                      onChange={(e) => setJobData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="25.00"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Oder Festpreis (€)
                    </label>
                    <input
                      type="number"
                      value={jobData.fixedAmount}
                      onChange={(e) => setJobData(prev => ({ ...prev, fixedAmount: e.target.value }))}
                      placeholder="150.00"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Karma Punkte
                  </label>
                  <input
                    type="number"
                    value={jobData.karmaReward}
                    onChange={(e) => setJobData(prev => ({ ...prev, karmaReward: e.target.value }))}
                    placeholder="100"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              )}
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Geschätzte Stunden
                </label>
                <input
                  type="number"
                  value={jobData.estimatedHours}
                  onChange={(e) => setJobData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="8"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags (kommagetrennt)
                </label>
                <input
                  type="text"
                  value={jobData.tags}
                  onChange={(e) => setJobData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="React, TypeScript, CSS"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Anforderungen
                </label>
                <textarea
                  rows={3}
                  value={jobData.requirements}
                  onChange={(e) => setJobData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Spezielle Anforderungen..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 ${
              jobType === 'cash'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
            } disabled:opacity-50`}
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Wird erstellt...' : `${jobType === 'cash' ? 'Cash' : 'Karma'} Job erstellen`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;