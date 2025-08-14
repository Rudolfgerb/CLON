import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, 
  Star, 
  Clock, 
  MapPin, 
  Briefcase, 
  FileText, 
  Tag, 
  Calendar,
  AlertCircle,
  Save,
  Plus,
  Minus,
  Users,
  Target,
  Euro
} from 'lucide-react';

interface CreateKarmaJobPageProps {
  isDark: boolean;
  onBack: () => void;
}

const CreateKarmaJobPage: React.FC<CreateKarmaJobPageProps> = ({ isDark, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRewardSystem, setShowRewardSystem] = useState(false);
  const [userKarma, setUserKarma] = useState(1247); // Mock user karma - should come from user profile

  // Form state
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: 'community',
    location: 'remote',
    customLocation: '',
    karmaReward: 50,
    estimatedHours: 1,
    maxDuration: { type: 'days', value: 7 },
    difficulty: 'easy',
    tags: [''],
    requirements: '',
    deliverables: '',
    helpType: 'learning' // learning, mentoring, community, review
  });

  // Reward system state
  const [rewardData, setRewardData] = useState({
    rewardType: 'karma', // 'karma' or 'money'
    karmaAmount: 50,
    moneyAmount: 25,
    maxWinners: 1,
    description: ''
  });

  const categories = [
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'learning', label: 'Lernen', icon: '📚' },
    { id: 'mentoring', label: 'Mentoring', icon: '🎓' },
    { id: 'review', label: 'Code Review', icon: '🔍' },
    { id: 'help', label: 'Hilfe', icon: '🤝' },
    { id: 'other', label: 'Sonstiges', icon: '⭐' }
  ];

  const locations = [
    { id: 'remote', label: 'Remote' },
    { id: 'berlin', label: 'Berlin' },
    { id: 'munich', label: 'München' },
    { id: 'hamburg', label: 'Hamburg' },
    { id: 'cologne', label: 'Köln' },
    { id: 'custom', label: 'Andere Stadt...' }
  ];

  const difficulties = [
    { id: 'easy', label: 'Einfach', color: 'text-green-500', bg: 'bg-green-500/20' },
    { id: 'medium', label: 'Mittel', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    { id: 'hard', label: 'Schwer', color: 'text-red-500', bg: 'bg-red-500/20' }
  ];

  const helpTypes = [
    { id: 'learning', label: 'Lernen & Üben', description: 'Gemeinsam neue Skills entwickeln', icon: '📚', karma: 25 },
    { id: 'mentoring', label: 'Mentoring', description: 'Wissen weitergeben und helfen', icon: '🎓', karma: 75 },
    { id: 'community', label: 'Community Projekt', description: 'Für die Gemeinschaft beitragen', icon: '👥', karma: 100 },
    { id: 'review', label: 'Code Review', description: 'Code überprüfen und Feedback geben', icon: '🔍', karma: 50 }
  ];

  const updateJobData = (field: string, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (jobData.tags.length < 5) {
      setJobData(prev => ({ ...prev, tags: [...prev.tags, ''] }));
    }
  };

  const removeTag = (index: number) => {
    if (jobData.tags.length > 1) {
      setJobData(prev => ({ 
        ...prev, 
        tags: prev.tags.filter((_, i) => i !== index) 
      }));
    }
  };

  const updateTag = (index: number, value: string) => {
    setJobData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const calculateKarmaReward = () => {
    const baseKarma = helpTypes.find(type => type.id === jobData.helpType)?.karma || 50;
    const difficultyMultiplier = jobData.difficulty === 'easy' ? 1 : jobData.difficulty === 'medium' ? 1.5 : 2;
    const hoursMultiplier = Math.max(1, jobData.estimatedHours * 0.5);
    return Math.round(baseKarma * difficultyMultiplier * hoursMultiplier);
  };

  const calculateExpirationDate = () => {
    const now = new Date();
    if (jobData.maxDuration.type === 'hours') {
      now.setHours(now.getHours() + jobData.maxDuration.value);
    } else {
      now.setDate(now.getDate() + jobData.maxDuration.value);
    }
    return now.toLocaleString('de-DE');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!jobData.title.trim()) {
        throw new Error('Titel ist erforderlich');
      }
      if (!jobData.description.trim()) {
        throw new Error('Beschreibung ist erforderlich');
      }

      // Calculate expiration date
      const expirationDate = new Date();
      if (jobData.maxDuration.type === 'hours') {
        expirationDate.setHours(expirationDate.getHours() + jobData.maxDuration.value);
      } else {
        expirationDate.setDate(expirationDate.getDate() + jobData.maxDuration.value);
      }

      // Prepare job data for database
      const jobPayload = {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        category: jobData.category,
        location: jobData.location === 'custom' ? jobData.customLocation : jobData.location,
        hourly_rate: null, // Karma jobs don't have hourly rate
        estimated_hours: jobData.estimatedHours,
        total_payment: null, // Karma jobs don't have payment
        karma_reward: calculateKarmaReward(),
        difficulty: jobData.difficulty,
        tags: jobData.tags.filter(tag => tag.trim() !== ''),
        requirements: jobData.requirements.trim(),
        deliverables: jobData.deliverables.trim(),
        expires_at: expirationDate.toISOString(),
        status: 'active',
        job_type: 'karma'
      };

      // Insert job into database
      const { data, error: insertError } = await supabase
        .from('jobs')
        .insert(jobPayload)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess('Karma Job erfolgreich erstellt!');
      
      // Reset form after 2 seconds and go back
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating karma job:', error);
      setError(error.message || 'Fehler beim Erstellen des Jobs');
    } finally {
      setLoading(false);
    }
  };

  if (showRewardSystem) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRewardSystem(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Karma Job belohnen
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Setze dein eigenes Karma oder Geld als Belohnung ein
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-purple-500">
              <Star className="w-5 h-5" />
              <span className="font-semibold">{userKarma.toLocaleString()} verfügbar</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Reward Type Selection */}
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Belohnungsart wählen
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Karma Reward */}
                <button
                  type="button"
                  onClick={() => setRewardData({...rewardData, rewardType: 'karma'})}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    rewardData.rewardType === 'karma'
                      ? 'border-purple-500 bg-purple-500/20'
                      : isDark
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Karma Belohnung
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                      Setze dein eigenes Karma als Belohnung ein
                    </p>
                    <div className="text-purple-500 font-semibold">
                      Verfügbar: {userKarma.toLocaleString()}
                    </div>
                  </div>
                </button>

                {/* Money Reward */}
                <button
                  type="button"
                  onClick={() => setRewardData({...rewardData, rewardType: 'money'})}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    rewardData.rewardType === 'money'
                      ? 'border-green-500 bg-green-500/20'
                      : isDark
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Euro className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Geld Belohnung
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                      Setze echtes Geld als Belohnung ein
                    </p>
                    <div className="text-green-500 font-semibold">
                      Aus deinem Guthaben
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Reward Configuration */}
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Belohnung konfigurieren
              </h2>
              
              <div className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {rewardData.rewardType === 'karma' ? 'Karma Menge' : 'Geld Betrag (€)'}
                  </label>
                  <div className="relative">
                    {rewardData.rewardType === 'karma' ? (
                      <Star className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <Euro className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                    <input
                      type="number"
                      min="1"
                      max={rewardData.rewardType === 'karma' ? userKarma : 1000}
                      value={rewardData.rewardType === 'karma' ? rewardData.karmaAmount : rewardData.moneyAmount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        if (rewardData.rewardType === 'karma') {
                          setRewardData({...rewardData, karmaAmount: Math.min(value, userKarma)});
                        } else {
                          setRewardData({...rewardData, moneyAmount: value});
                        }
                      }}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                    />
                  </div>
                  {rewardData.rewardType === 'karma' && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Maximal {userKarma.toLocaleString()} Karma verfügbar
                    </p>
                  )}
                </div>

                {/* Max Winners */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Anzahl Gewinner
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRewardData({...rewardData, maxWinners: Math.max(1, rewardData.maxWinners - 1)})}
                      className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={rewardData.maxWinners}
                      onChange={(e) => setRewardData({...rewardData, maxWinners: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))})}
                      className={`flex-1 px-4 py-3 rounded-xl border transition-colors text-center ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setRewardData({...rewardData, maxWinners: Math.min(10, rewardData.maxWinners + 1)})}
                      className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Wie viele Personen sollen die Belohnung erhalten?
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Belohnungsbeschreibung
                  </label>
                  <textarea
                    rows={3}
                    value={rewardData.description}
                    onChange={(e) => setRewardData({...rewardData, description: e.target.value})}
                    placeholder="Beschreibe, wofür die Belohnung vergeben wird..."
                    className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className={`${isDark ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'} rounded-2xl p-6 border`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Belohnungs-Zusammenfassung
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Belohnungsart:</span>
                  <span className={`font-medium ${rewardData.rewardType === 'karma' ? 'text-purple-400' : 'text-green-400'}`}>
                    {rewardData.rewardType === 'karma' ? 'Karma' : 'Geld'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Betrag pro Gewinner:</span>
                  <span className={`font-bold text-lg ${rewardData.rewardType === 'karma' ? 'text-purple-400' : 'text-green-400'}`}>
                    {rewardData.rewardType === 'karma' ? `${rewardData.karmaAmount} Karma` : `€${rewardData.moneyAmount}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Anzahl Gewinner:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {rewardData.maxWinners}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-current/20">
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gesamtkosten:</span>
                  <span className={`font-bold text-xl ${rewardData.rewardType === 'karma' ? 'text-purple-400' : 'text-green-400'}`}>
                    {rewardData.rewardType === 'karma' 
                      ? `${rewardData.karmaAmount * rewardData.maxWinners} Karma`
                      : `€${rewardData.moneyAmount * rewardData.maxWinners}`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowRewardSystem(false)}
                className={`flex-1 px-6 py-4 rounded-xl border font-semibold transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Zurück
              </button>
              <button
                type="button"
                onClick={() => {
                  // Here you would create the reward job
                  console.log('Creating reward job:', rewardData);
                  setSuccess('Belohnungs-Job erfolgreich erstellt!');
                  setTimeout(() => {
                    onBack();
                  }, 2000);
                }}
                disabled={loading}
                className={`flex-1 bg-gradient-to-r ${
                  rewardData.rewardType === 'karma' 
                    ? 'from-purple-500 to-purple-600 shadow-purple-500/30' 
                    : 'from-green-500 to-green-600 shadow-green-500/30'
                } text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                <Save className="w-5 h-5" />
                <span>Belohnung erstellen</span>
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-200 text-sm">{success}</p>
              </div>
            )}
          </div>
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
                Karma Job erstellen
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Community-Projekte für Karma-Punkte
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-purple-500">
            <Star className="w-5 h-5" />
            <span className="font-semibold">+{calculateKarmaReward()} Karma</span>
          </div>
        </div>

        {/* Karma Job Reward Button */}
        <div className="px-6 mb-6">
          <button
            onClick={() => setShowRewardSystem(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2"
          >
            <Target className="w-5 h-5" />
            <span>Karma Job belohnen</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Help Type Selection */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Art der Hilfe
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {helpTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => updateJobData('helpType', type.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    jobData.helpType === type.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : isDark
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {type.label}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {type.description}
                  </p>
                  <div className="flex items-center justify-center space-x-1 text-purple-500">
                    <Star className="w-3 h-3" />
                    <span className="text-xs font-medium">+{type.karma} Base</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Grundinformationen
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job-Titel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={jobData.title}
                    onChange={(e) => updateJobData('title', e.target.value)}
                    placeholder="z.B. Code Review für React Projekt"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Beschreibung <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className={`absolute left-4 top-4 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <textarea
                    rows={4}
                    value={jobData.description}
                    onChange={(e) => updateJobData('description', e.target.value)}
                    placeholder="Beschreibe, wobei du Hilfe brauchst oder wie du helfen möchtest..."
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Kategorie
                  </label>
                  <select
                    value={jobData.category}
                    onChange={(e) => updateJobData('category', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Schwierigkeit
                  </label>
                  <div className="flex space-x-2">
                    {difficulties.map(diff => (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => updateJobData('difficulty', diff.id)}
                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          jobData.difficulty === diff.id
                            ? `${diff.bg} ${diff.color} border-2 border-current`
                            : isDark
                              ? 'bg-slate-700 border-slate-600 text-gray-300 border hover:bg-slate-600'
                              : 'bg-gray-100 border-gray-200 text-gray-700 border hover:bg-gray-200'
                        }`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Standort
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Arbeitsort
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select
                    value={jobData.location}
                    onChange={(e) => updateJobData('location', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {jobData.location === 'custom' && (
                <div>
                  <input
                    type="text"
                    value={jobData.customLocation}
                    onChange={(e) => updateJobData('customLocation', e.target.value)}
                    placeholder="Stadt eingeben..."
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Time & Duration */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Zeit & Dauer
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Geschätzter Zeitaufwand (Stunden)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => updateJobData('estimatedHours', Math.max(1, jobData.estimatedHours - 1))}
                    className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={jobData.estimatedHours}
                    onChange={(e) => updateJobData('estimatedHours', Math.max(1, parseInt(e.target.value) || 1))}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors text-center ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                  />
                  <button
                    type="button"
                    onClick={() => updateJobData('estimatedHours', Math.min(40, jobData.estimatedHours + 1))}
                    className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job läuft ab nach
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Stunden Option */}
                  <button
                    type="button"
                    onClick={() => updateJobData('maxDuration', { type: 'hours', value: 24 })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      jobData.maxDuration.type === 'hours'
                        ? 'border-purple-500 bg-purple-500/20'
                        : isDark
                          ? 'border-slate-600 hover:border-slate-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <Clock className={`w-6 h-6 mx-auto mb-2 ${
                        jobData.maxDuration.type === 'hours' ? 'text-purple-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <h3 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Stunden
                      </h3>
                      {jobData.maxDuration.type === 'hours' && (
                        <input
                          type="number"
                          min="1"
                          max="72"
                          value={jobData.maxDuration.value}
                          onChange={(e) => updateJobData('maxDuration', { 
                            type: 'hours', 
                            value: parseInt(e.target.value) || 1 
                          })}
                          className={`w-16 px-2 py-1 rounded-lg border text-center text-sm ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </button>

                  {/* Tage Option */}
                  <button
                    type="button"
                    onClick={() => updateJobData('maxDuration', { type: 'days', value: 7 })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      jobData.maxDuration.type === 'days'
                        ? 'border-purple-500 bg-purple-500/20'
                        : isDark
                          ? 'border-slate-600 hover:border-slate-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                        jobData.maxDuration.type === 'days' ? 'text-purple-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <h3 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Tage
                      </h3>
                      {jobData.maxDuration.type === 'days' && (
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={jobData.maxDuration.value}
                          onChange={(e) => updateJobData('maxDuration', { 
                            type: 'days', 
                            value: parseInt(e.target.value) || 1 
                          })}
                          className={`w-16 px-2 py-1 rounded-lg border text-center text-sm ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </button>
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Job wird automatisch gelöscht am: {calculateExpirationDate()}
                </p>
              </div>

              {/* Karma Reward Display */}
              <div className={`${isDark ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'} rounded-xl p-4 border`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Karma Belohnung:
                  </span>
                  <span className="text-2xl font-bold text-purple-500">
                    +{calculateKarmaReward()}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  Basiert auf Art, Schwierigkeit und Zeitaufwand
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tags & Skills
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Relevante Skills/Themen (max. 5)
                </label>
                <div className="space-y-2">
                  {jobData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Tag className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="z.B. React, JavaScript, Mentoring"
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                        />
                      </div>
                      {jobData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {jobData.tags.length < 5 && (
                  <button
                    type="button"
                    onClick={addTag}
                    className={`mt-2 flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${
                      isDark 
                        ? 'border-slate-600 text-gray-400 hover:border-slate-500 hover:text-gray-300' 
                        : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Tag hinzufügen</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Zusätzliche Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Voraussetzungen
                </label>
                <textarea
                  rows={3}
                  value={jobData.requirements}
                  onChange={(e) => updateJobData('requirements', e.target.value)}
                  placeholder="Welche Kenntnisse oder Erfahrungen sind hilfreich..."
                  className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Erwartete Ergebnisse
                </label>
                <textarea
                  rows={3}
                  value={jobData.deliverables}
                  onChange={(e) => updateJobData('deliverables', e.target.value)}
                  placeholder="Was soll am Ende erreicht werden..."
                  className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                />
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Wird erstellt...' : 'Karma Job erstellen'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateKarmaJobPage;