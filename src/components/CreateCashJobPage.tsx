import React, { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, 
  Euro, 
  Clock, 
  MapPin, 
  Briefcase, 
  FileText, 
  Tag, 
  Calendar,
  AlertCircle,
  Save,
  Plus,
  Minus
} from 'lucide-react';

interface CreateCashJobPageProps {
  isDark: boolean;
  onBack: () => void;
  user: any;
}

const CreateCashJobPage: React.FC<CreateCashJobPageProps> = ({ isDark, onBack, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Form state
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: 'development',
    location: 'remote',
    customLocation: '',
    paymentType: 'hourly', // 'hourly' or 'fixed'
    hourlyRate: '',
    fixedAmount: '',
    estimatedHours: 1,
    maxDuration: { type: 'hours', value: 24 },
    difficulty: 'easy',
    tags: [''],
    requirements: '',
    deliverables: ''
  });

  const categories = [
    { id: 'development', label: 'Entwicklung', icon: '💻' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'writing', label: 'Texte', icon: '✍️' },
    { id: 'marketing', label: 'Marketing', icon: '📈' },
    { id: 'data', label: 'Daten', icon: '📊' },
    { id: 'other', label: 'Sonstiges', icon: '🔧' }
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

  // Track form changes
  useEffect(() => {
    const hasChanges = 
      jobData.title.trim() !== '' ||
      jobData.description.trim() !== '' ||
      jobData.hourlyRate !== '' ||
      jobData.fixedAmount !== '' ||
      jobData.requirements.trim() !== '' ||
      jobData.deliverables.trim() !== '' ||
      jobData.tags.some(tag => tag.trim() !== '');
    
    setHasUnsavedChanges(hasChanges);
  }, [jobData]);

  // Prevent browser back/refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowExitWarning(true);
    } else {
      onBack();
    }
  };

  const confirmExit = () => {
    setShowExitWarning(false);
    onBack();
  };

  const cancelExit = () => {
    setShowExitWarning(false);
  };

  const calculateTotalPayment = () => {
    if (jobData.paymentType === 'fixed') {
      return parseFloat(jobData.fixedAmount) || 0;
    } else {
      const rate = parseFloat(jobData.hourlyRate) || 0;
      const hours = jobData.estimatedHours || 0;
      return (rate * hours).toFixed(2);
    }
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
      // Check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('Sie müssen angemeldet sein, um einen Job zu erstellen');
      }

      // Validate required fields
      if (!jobData.title.trim()) {
        throw new Error('Titel ist erforderlich');
      }
      if (!jobData.description.trim()) {
        throw new Error('Beschreibung ist erforderlich');
      }
      if (jobData.paymentType === 'hourly') {
        if (!jobData.hourlyRate || parseFloat(jobData.hourlyRate) <= 0) {
          throw new Error('Stundensatz muss größer als 0 sein');
        }
      } else {
        if (!jobData.fixedAmount || parseFloat(jobData.fixedAmount) <= 0) {
          throw new Error('Gesamtbetrag muss größer als 0 sein');
        }
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
        hourly_rate: jobData.paymentType === 'hourly' ? parseFloat(jobData.hourlyRate) : null,
        estimated_hours: jobData.paymentType === 'hourly' ? jobData.estimatedHours : null,
        fixed_amount: jobData.paymentType === 'fixed' ? parseFloat(jobData.fixedAmount) : null,
        total_payment: parseFloat(calculateTotalPayment()),
        difficulty: jobData.difficulty,
        tags: jobData.tags.filter(tag => tag.trim() !== ''),
        requirements: jobData.requirements.trim(),
        deliverables: jobData.deliverables.trim(),
        expires_at: expirationDate.toISOString(),
        status: 'active',
        job_type: 'cash',
        created_by: currentUser.id
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

      setSuccess('Cash Job erfolgreich erstellt!');
      
      // Reset form after 2 seconds and go back
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating job:', error);
      setError(error.message || 'Fehler beim Erstellen des Jobs');
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <>
      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl p-6 w-full max-w-md border shadow-2xl`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ungespeicherte Änderungen
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren? Alle Änderungen gehen verloren.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelExit}
                className={`flex-1 px-4 py-3 rounded-xl border font-semibold transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-red-500/30"
              >
                Trotzdem verlassen
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cash Job erstellen
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Micro-Jobs für schnelle Bezahlung
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-500">
            <Euro className="w-5 h-5" />
            <span className="font-semibold">€{calculateTotalPayment()}</span>
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            )}
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
                  Job-Titel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={jobData.title}
                    onChange={(e) => updateJobData('title', e.target.value)}
                    placeholder="z.B. React Komponente erstellen"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
                    placeholder="Detaillierte Beschreibung des Jobs..."
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment & Duration */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bezahlung & Dauer
            </h2>
            
            <div className="space-y-4">
              {/* Payment Type Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bezahlungsart
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateJobData('paymentType', 'hourly')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      jobData.paymentType === 'hourly'
                        ? 'border-green-500 bg-green-500/20'
                        : isDark
                          ? 'border-slate-600 hover:border-slate-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <Clock className={`w-6 h-6 mx-auto mb-2 ${
                        jobData.paymentType === 'hourly' ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Stundenlohn
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        €/Stunde × Stunden
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateJobData('paymentType', 'fixed')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      jobData.paymentType === 'fixed'
                        ? 'border-green-500 bg-green-500/20'
                        : isDark
                          ? 'border-slate-600 hover:border-slate-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <Euro className={`w-6 h-6 mx-auto mb-2 ${
                        jobData.paymentType === 'fixed' ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Festpreis
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Gesamtbetrag
                      </p>
                    </div>
                  </button>
                </div>
              </div>
              {/* Payment Input Fields */}
              {jobData.paymentType === 'hourly' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Stundensatz (€) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Euro className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="number"
                        min="1"
                        step="0.50"
                        value={jobData.hourlyRate}
                        onChange={(e) => updateJobData('hourlyRate', e.target.value)}
                        placeholder="25.00"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Geschätzte Stunden
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
                        max="24"
                        value={jobData.estimatedHours}
                        onChange={(e) => updateJobData('estimatedHours', Math.max(1, parseInt(e.target.value) || 1))}
                        className={`flex-1 px-4 py-3 rounded-xl border transition-colors text-center ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() => updateJobData('estimatedHours', Math.min(24, jobData.estimatedHours + 1))}
                        className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Gesamtbetrag (€) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Euro className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      min="1"
                      step="0.50"
                      value={jobData.fixedAmount}
                      onChange={(e) => updateJobData('fixedAmount', e.target.value)}
                      placeholder="150.00"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                      required
                    />
                  </div>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fester Betrag für das gesamte Projekt
                  </p>
                </div>
              )}

              {/* Duration Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job läuft ab nach
                </label>
                <div className="flex space-x-2">
                  <select
                    value={jobData.maxDuration.type}
                    onChange={(e) => updateJobData('maxDuration', { 
                      ...jobData.maxDuration, 
                      type: e.target.value,
                      value: e.target.value === 'hours' ? 24 : 7
                    })}
                    className={`px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    <option value="hours">Stunden</option>
                    <option value="days">Tagen</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    max={jobData.maxDuration.type === 'hours' ? 24 : 10}
                    value={jobData.maxDuration.value}
                    onChange={(e) => updateJobData('maxDuration', { 
                      ...jobData.maxDuration, 
                      value: parseInt(e.target.value) || 1 
                    })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  />
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Job wird automatisch gelöscht am: {calculateExpirationDate()}
                </p>
              </div>

              {/* Total Payment Display */}
              <div className={`${isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'} rounded-xl p-4 border`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Gesamtbetrag:
                  </span>
                  <span className="text-2xl font-bold text-green-500">
                    €{calculateTotalPayment()}
                  </span>
                </div>
                {jobData.paymentType === 'hourly' && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                    {jobData.estimatedHours}h × €{jobData.hourlyRate || '0'}/h
                  </p>
                )}
                {jobData.paymentType === 'fixed' && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                    Festpreis für das gesamte Projekt
                  </p>
                )}
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
                  Benötigte Skills (max. 5)
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
                          placeholder="z.B. React, TypeScript, CSS"
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
                  Anforderungen
                </label>
                <textarea
                  rows={3}
                  value={jobData.requirements}
                  onChange={(e) => updateJobData('requirements', e.target.value)}
                  placeholder="Spezielle Anforderungen oder Qualifikationen..."
                  className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
                  placeholder="Was soll am Ende geliefert werden..."
                  className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Wird erstellt...' : 'Cash Job erstellen'}</span>
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default CreateCashJobPage;