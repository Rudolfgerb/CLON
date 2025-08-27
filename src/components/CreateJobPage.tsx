import React, { useState, useEffect } from 'react';
import { X, Euro, Star, Save, ChevronLeft, ChevronRight, Upload, Calendar, Clock } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface CreateJobPageProps {
  isDark: boolean;
  user: User;
  jobType: 'cash' | 'karma' | null;
  onBack: () => void;
}

const CreateJobPage: React.FC<CreateJobPageProps> = ({ isDark, user, jobType, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedJobType, setSelectedJobType] = useState<'cash' | 'karma'>(jobType || 'cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (jobType) {
      setSelectedJobType(jobType);
    }
  }, [jobType]);

  const [jobData, setJobData] = useState({
    // Schritt 1: Grundlagen
    title: '',
    description: '',
    media: [] as File[],
    
    // Schritt 2: Details
    category: 'development',
    location: 'remote',
    difficulty: 'easy',
    tags: '',
    requirements: '',
    deliverables: '',
    
    // Schritt 3: Deadline & Bezahlung
    deadlineDate: '',
    deadlineTime: '',
    hourlyRate: '',
    fixedAmount: '',
    karmaReward: '100',
    estimatedHours: '1'
  });

  const categories = [
    { id: 'development', label: 'Entwicklung' },
    { id: 'design', label: 'Design' },
    { id: 'writing', label: 'Texte' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'data', label: 'Datenanalyse' },
    { id: 'consulting', label: 'Beratung' },
    { id: 'translation', label: 'Übersetzung' },
    { id: 'other', label: 'Sonstiges' }
  ];

  const difficulties = [
    { id: 'easy', label: 'Einfach', color: 'text-green-500' },
    { id: 'medium', label: 'Mittel', color: 'text-yellow-500' },
    { id: 'hard', label: 'Schwer', color: 'text-red-500' }
  ];

  const steps = [
    { number: 1, title: 'Grundlagen', description: 'Titel, Beschreibung & Medien' },
    { number: 2, title: 'Details', description: 'Kategorie, Anforderungen & Lieferobjekte' },
    { number: 3, title: 'Abschluss', description: 'Deadline & Bezahlung' }
  ];

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setJobData(prev => ({ ...prev, media: [...prev.media, ...files] }));
  };

  const removeMedia = (index: number) => {
    setJobData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return jobData.title.trim() && jobData.description.trim();
      case 2:
        return jobData.category && jobData.deliverables.trim();
      case 3:
        return jobData.deadlineDate && jobData.deadlineTime && 
               (selectedJobType === 'karma' ? jobData.karmaReward : 
                (jobData.hourlyRate || jobData.fixedAmount));
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setLoading(true);
    setError('');

    try {
      const tagsArray = jobData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const deadline = new Date(`${jobData.deadlineDate}T${jobData.deadlineTime}`);
      
      const jobPayload = {
        title: jobData.title,
        description: jobData.description,
        category: jobData.category,
        location: jobData.location,
        job_type: selectedJobType,
        hourly_rate: selectedJobType === 'cash' && jobData.hourlyRate ? parseFloat(jobData.hourlyRate) : null,
        fixed_amount: selectedJobType === 'cash' && jobData.fixedAmount ? parseFloat(jobData.fixedAmount) : null,
        karma_reward: selectedJobType === 'karma' ? parseInt(jobData.karmaReward) : null,
        estimated_hours: parseInt(jobData.estimatedHours),
        difficulty: jobData.difficulty,
        tags: tagsArray,
        requirements: jobData.requirements,
        deliverables: jobData.deliverables,
        deadline: deadline.toISOString(),
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Job Type Display */}
            <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-4 border`}>
              <div className="flex items-center space-x-3">
                {selectedJobType === 'cash' ? (
                  <Euro className="w-6 h-6 text-green-500" />
                ) : (
                  <Star className="w-6 h-6 text-purple-500" />
                )}
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedJobType === 'cash' ? 'Cash Job' : 'Karma Job'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedJobType === 'cash' ? 'Bezahlte Arbeit' : 'Community Hilfe'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Job Titel *
              </label>
              <input
                type="text"
                value={jobData.title}
                onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. React Komponente erstellen"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Detaillierte Beschreibung *
              </label>
              <textarea
                rows={5}
                value={jobData.description}
                onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreiben Sie detailliert was gemacht werden soll..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Medien hinzufügen (optional)
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center ${
                isDark ? 'border-slate-600 bg-slate-700/30' : 'border-gray-300 bg-gray-50'
              }`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Bilder, Dokumente oder Dateien hochladen
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:scale-105 transition-transform inline-flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Dateien auswählen</span>
                </label>
              </div>
              
              {jobData.media.length > 0 && (
                <div className="mt-4 space-y-2">
                  {jobData.media.map((file, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeMedia(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Kategorie *
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
                  placeholder="Remote, Berlin, Hybrid..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Schwierigkeit
              </label>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setJobData(prev => ({ ...prev, difficulty: diff.id }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      jobData.difficulty === diff.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`font-bold ${diff.color}`}>{diff.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Tags (kommagetrennt)
              </label>
              <input
                type="text"
                value={jobData.tags}
                onChange={(e) => setJobData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="React, TypeScript, CSS, UI/UX"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
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
                placeholder="Welche Fähigkeiten oder Erfahrungen werden benötigt?"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Was soll geliefert werden? *
              </label>
              <textarea
                rows={3}
                value={jobData.deliverables}
                onChange={(e) => setJobData(prev => ({ ...prev, deliverables: e.target.value }))}
                placeholder="Beschreiben Sie genau was am Ende geliefert werden soll..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Deadline */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Deadline
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Datum *
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="date"
                      value={jobData.deadlineDate}
                      onChange={(e) => setJobData(prev => ({ ...prev, deadlineDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Uhrzeit *
                  </label>
                  <div className="relative">
                    <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="time"
                      value={jobData.deadlineTime}
                      onChange={(e) => setJobData(prev => ({ ...prev, deadlineTime: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bezahlung */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedJobType === 'cash' ? 'Bezahlung' : 'Karma Belohnung'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedJobType === 'cash' ? (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Stundensatz (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={jobData.hourlyRate}
                        onChange={(e) => setJobData(prev => ({ ...prev, hourlyRate: e.target.value, fixedAmount: '' }))}
                        placeholder="25.00"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Oder Festpreis (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={jobData.fixedAmount}
                        onChange={(e) => setJobData(prev => ({ ...prev, fixedAmount: e.target.value, hourlyRate: '' }))}
                        placeholder="150.00"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Karma Punkte *
                    </label>
                    <input
                      type="number"
                      value={jobData.karmaReward}
                      onChange={(e) => setJobData(prev => ({ ...prev, karmaReward: e.target.value }))}
                      placeholder="100"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Geschätzte Stunden *
                  </label>
                  <input
                    type="number"
                    value={jobData.estimatedHours}
                    onChange={(e) => setJobData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="8"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {selectedJobType === 'cash' && (
                <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border`}>
                  <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    💡 <strong>Tipp:</strong> Verwenden Sie entweder Stundensatz ODER Festpreis. 
                    Bei Stundensatz wird automatisch mit den geschätzten Stunden multipliziert.
                  </p>
                </div>
              )}
            </div>

            {/* Zusammenfassung */}
            <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-4 border`}>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Zusammenfassung
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Titel:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{jobData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Kategorie:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {categories.find(c => c.id === jobData.category)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Deadline:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {jobData.deadlineDate && jobData.deadlineTime 
                      ? new Date(`${jobData.deadlineDate}T${jobData.deadlineTime}`).toLocaleString('de-DE')
                      : 'Nicht gesetzt'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Bezahlung:</span>
                  <span className={`font-medium ${selectedJobType === 'cash' ? 'text-green-500' : 'text-purple-500'}`}>
                    {selectedJobType === 'cash' 
                      ? (jobData.fixedAmount 
                          ? `€${jobData.fixedAmount}` 
                          : jobData.hourlyRate 
                            ? `€${jobData.hourlyRate}/h`
                            : 'Nicht gesetzt'
                        )
                      : `${jobData.karmaReward} Karma`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
                Schritt {currentStep} von 3
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.number
                      ? selectedJobType === 'cash'
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white'
                      : isDark ? 'bg-slate-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? isDark ? 'text-white' : 'text-gray-900'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number
                      ? selectedJobType === 'cash' ? 'bg-green-500' : 'bg-purple-500'
                      : isDark ? 'bg-slate-700' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
          <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {steps[currentStep - 1].title}
          </h2>
          
          {renderStepContent()}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
            <p className="text-green-200 text-sm">{success}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium ${
                canProceed()
                  ? selectedJobType === 'cash'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105'
                  : 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
              } transition-all`}
            >
              <span>Weiter</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className={`flex items-center space-x-2 px-6 py-4 rounded-xl font-semibold ${
                canProceed() && !loading
                  ? selectedJobType === 'cash'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105'
                  : 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
              } transition-all`}
            >
              <Save className="w-5 h-5" />
              <span>
                {loading 
                  ? 'Wird erstellt...' 
                  : `${selectedJobType === 'cash' ? 'Cash' : 'Karma'} Job erstellen`
                }
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;