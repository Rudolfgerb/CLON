import React, { useState, useEffect } from 'react';
import { X, Euro, Star, Save, ChevronLeft, ChevronRight, Upload, Calendar, Clock, Image, Trash2, CheckCircle, AlertTriangle, Target, FileText, Settings } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { calculateJobCommission } from '../lib/stripe';

interface Profile {
  id: string;
  premium: boolean;
}

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
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (jobType) {
      setSelectedJobType(jobType);
    }
  }, [jobType]);

  useEffect(() => {
    // Load user profile for commission calculation
    const loadProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, premium')
          .eq('id', user.id)
          .single();
        
        setUserProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user.id]);

  const [jobData, setJobData] = useState({
    // Schritt 1: Grundlagen
    title: '',
    description: '',
    category: 'programming',
    priority: 'medium',
    media: [] as File[],
    titleImageIndex: 0,
    
    // Schritt 2: Details & Anforderungen
    location: 'remote',
    difficulty: 'medium',
    tags: '',
    requirements: '',
    deliverables: '',
    expectedDuration: '8',
    timeCommitment: 'part_time',
    
    // Schritt 3: Bezahlung & Deadline
    deadlineDate: '',
    deadlineTime: '',
    
    // Bezahlung
    budgetType: 'fixed', // 'fixed' or 'hourly'
    cashAmount: '',
    hourlyRate: '',
    karmaAmount: '100',
    
    // Zusätzliche Bezahlung (optional)
    additionalKarma: '',
    additionalCash: '',
    offerBothPayments: false,
    
    // Erweiterte Optionen
    maxApplicants: '10',
    autoAccept: false,
    requirePortfolio: false
  });

  const categories = [
    { id: 'programming', label: 'Programmierung', icon: '💻' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'writing', label: 'Textarbeit', icon: '✍️' },
    { id: 'translation', label: 'Übersetzung', icon: '🌐' },
    { id: 'marketing', label: 'Marketing', icon: '📈' },
    { id: 'other', label: 'Andere', icon: '📋' }
  ];

  const difficulties = [
    { id: 'easy', label: 'Einfach', color: 'text-green-500', description: 'Grundkenntnisse ausreichend' },
    { id: 'medium', label: 'Mittel', color: 'text-yellow-500', description: 'Solide Erfahrung erforderlich' },
    { id: 'hard', label: 'Schwer', color: 'text-red-500', description: 'Expertenwissen benötigt' }
  ];

  const timeCommitments = [
    { id: 'part_time', label: 'Teilzeit', description: 'Weniger als 20h/Woche' },
    { id: 'full_time', label: 'Vollzeit', description: '40h/Woche oder mehr' },
    { id: 'flexible', label: 'Flexibel', description: 'Nach Vereinbarung' }
  ];

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setJobData(prev => ({ 
      ...prev, 
      media: [...prev.media, ...files],
      titleImageIndex: prev.media.length === 0 ? 0 : prev.titleImageIndex
    }));
  };

  const removeMedia = (index: number) => {
    setJobData(prev => {
      const newMedia = prev.media.filter((_, i) => i !== index);
      let newTitleIndex = prev.titleImageIndex;
      
      if (index === prev.titleImageIndex && newMedia.length > 0) {
        newTitleIndex = 0;
      } else if (index < prev.titleImageIndex) {
        newTitleIndex = prev.titleImageIndex - 1;
      } else if (newMedia.length === 0) {
        newTitleIndex = 0;
      }
      
      return {
        ...prev,
        media: newMedia,
        titleImageIndex: newTitleIndex
      };
    });
  };

  const setTitleImage = (index: number) => {
    setJobData(prev => ({ ...prev, titleImageIndex: index }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return jobData.title.trim() && 
               jobData.description.trim() && 
               jobData.category;
      case 2:
        return jobData.deliverables.trim() && 
               jobData.expectedDuration;
      case 3:
        return jobData.deadlineDate && 
               jobData.deadlineTime && 
               (selectedJobType === 'karma' 
                 ? jobData.karmaAmount 
                 : (jobData.budgetType === 'fixed' ? jobData.cashAmount : jobData.hourlyRate));
      default:
        return false;
    }
  };

  const getEstimatedCommission = () => {
    if (selectedJobType !== 'cash' || !userProfile) return null;
    
    const amount = jobData.budgetType === 'fixed' 
      ? parseFloat(jobData.cashAmount)
      : parseFloat(jobData.hourlyRate) * parseFloat(jobData.expectedDuration);
    
    if (isNaN(amount) || amount <= 0) return null;
    
    return calculateJobCommission(amount, userProfile.premium);
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setLoading(true);
    setError('');

    try {
      const tagsArray = jobData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const deadline = new Date(`${jobData.deadlineDate}T${jobData.deadlineTime}`);
      
      // Calculate amounts based on job type and budget type
      let cashAmount = 0;
      let karmaAmount = 0;
      
      if (selectedJobType === 'cash') {
        cashAmount = jobData.budgetType === 'fixed' 
          ? parseFloat(jobData.cashAmount)
          : parseFloat(jobData.hourlyRate) * parseFloat(jobData.expectedDuration);
      } else {
        karmaAmount = parseInt(jobData.karmaAmount);
      }
      
      const jobPayload = {
        title: jobData.title,
        description: jobData.description,
        category: jobData.category,
        difficulty_level: jobData.difficulty,
        budget_type: jobData.budgetType,
        budget_amount: cashAmount || karmaAmount,
        payment_type: selectedJobType,
        cash_amount: cashAmount,
        karma_amount: karmaAmount,
        additional_karma: jobData.additionalKarma ? parseInt(jobData.additionalKarma) : 0,
        additional_cash: jobData.additionalCash ? parseFloat(jobData.additionalCash) : 0,
        tags: tagsArray,
        requirements: jobData.requirements ? [jobData.requirements] : [],
        deliverables: jobData.deliverables,
        expected_duration: parseInt(jobData.expectedDuration),
        time_commitment: jobData.timeCommitment,
        deadline: deadline.toISOString(),
        status: 'open',
        visibility: 'public',
        creator_id: user.id
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
            {/* Job Type Selection */}
            <div>
              <label className={`block text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Job-Typ auswählen *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedJobType('cash')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedJobType === 'cash'
                      ? 'border-green-500 bg-green-500/10'
                      : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Euro className={`w-8 h-8 mb-3 ${selectedJobType === 'cash' ? 'text-green-500' : 'text-gray-500'}`} />
                  <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cash Job</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bezahlung in Euro für professionelle Arbeit
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedJobType('karma')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedJobType === 'karma'
                      ? 'border-purple-500 bg-purple-500/10'
                      : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Star className={`w-8 h-8 mb-3 ${selectedJobType === 'karma' ? 'text-purple-500' : 'text-gray-500'}`} />
                  <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Karma Job</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Community-Hilfe mit Karma-Belohnung
                  </p>
                </button>
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
                placeholder="z.B. React Komponente erstellen, Logo Design, Texte übersetzen"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Kategorie *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setJobData(prev => ({ ...prev, category: category.id }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      jobData.category === category.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {category.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Detaillierte Beschreibung *
              </label>
              <textarea
                rows={6}
                value={jobData.description}
                onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreiben Sie detailliert was gemacht werden soll, welche Kenntnisse erforderlich sind und was Sie sich vorstellen..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {jobData.description.length}/500 Zeichen empfohlen
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Priorität
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', label: 'Niedrig', color: 'text-green-500', description: 'Zeit bis zur Deadline' },
                  { id: 'medium', label: 'Normal', color: 'text-yellow-500', description: 'Durchschnittliche Dringlichkeit' },
                  { id: 'high', label: 'Hoch', color: 'text-red-500', description: 'Schnelle Bearbeitung gewünscht' }
                ].map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setJobData(prev => ({ ...prev, priority: priority.id }))}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      jobData.priority === priority.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`font-bold ${priority.color} mb-1`}>{priority.label}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {priority.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Medien hinzufügen (optional)
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center ${
                isDark ? 'border-slate-600 bg-slate-700/30' : 'border-gray-300 bg-gray-50'
              }`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Bilder, Mockups oder Referenzdateien hochladen
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.sketch,.fig"
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
                      <div className="flex items-center space-x-3">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded ${isDark ? 'bg-slate-600' : 'bg-gray-200'} flex items-center justify-center`}>
                            <FileText className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeMedia(index)}
                        className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
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
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Job-Details festlegen
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Definieren Sie Anforderungen und Lieferobjekte
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Geschätzte Dauer (Stunden) *
                </label>
                <input
                  type="number"
                  value={jobData.expectedDuration}
                  onChange={(e) => setJobData(prev => ({ ...prev, expectedDuration: e.target.value }))}
                  placeholder="8"
                  min="1"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                  required
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
                    <div className={`font-bold ${diff.color} mb-1`}>{diff.label}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {diff.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Zeitaufwand
              </label>
              <div className="space-y-2">
                {timeCommitments.map((commitment) => (
                  <label key={commitment.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="timeCommitment"
                      value={commitment.id}
                      checked={jobData.timeCommitment === commitment.id}
                      onChange={(e) => setJobData(prev => ({ ...prev, timeCommitment: e.target.value }))}
                      className="text-blue-600"
                    />
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {commitment.label}
                      </span>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {commitment.description}
                      </p>
                    </div>
                  </label>
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
                placeholder="React, TypeScript, CSS, UI/UX, Logo, Design"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Helfen Sie anderen Ihre Arbeit zu finden
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Anforderungen an den Bewerber
              </label>
              <textarea
                rows={4}
                value={jobData.requirements}
                onChange={(e) => setJobData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Welche Fähigkeiten, Erfahrungen oder Tools werden benötigt?"
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
                rows={4}
                value={jobData.deliverables}
                onChange={(e) => setJobData(prev => ({ ...prev, deliverables: e.target.value }))}
                placeholder="Beschreiben Sie genau was am Ende geliefert werden soll (z.B. fertiger Code, PSD-Datei, übersetzter Text)..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>

            {/* Advanced Options */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'} space-y-4`}>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Erweiterte Optionen
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max. Bewerber
                  </label>
                  <input
                    type="number"
                    value={jobData.maxApplicants}
                    onChange={(e) => setJobData(prev => ({ ...prev, maxApplicants: e.target.value }))}
                    min="1"
                    max="50"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jobData.requirePortfolio}
                    onChange={(e) => setJobData(prev => ({ ...prev, requirePortfolio: e.target.checked }))}
                    className="text-blue-600 rounded"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Portfolio-URL erforderlich
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Settings className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Deadline & Bezahlung
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Legen Sie Frist und Vergütung fest
              </p>
            </div>

            {/* Deadline */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Deadline festlegen
              </h4>
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

            {/* Payment Section */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedJobType === 'cash' ? 'Bezahlung festlegen' : 'Karma-Belohnung'}
              </h4>
              
              {selectedJobType === 'cash' ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Vergütungsart *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setJobData(prev => ({ ...prev, budgetType: 'fixed' }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          jobData.budgetType === 'fixed'
                            ? 'border-green-500 bg-green-500/20'
                            : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Festpreis</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Einmaliger Betrag
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setJobData(prev => ({ ...prev, budgetType: 'hourly' }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          jobData.budgetType === 'hourly'
                            ? 'border-green-500 bg-green-500/20'
                            : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Stundensatz</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pro Stunde
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {jobData.budgetType === 'fixed' ? 'Festpreis (€) *' : 'Stundensatz (€) *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={jobData.budgetType === 'fixed' ? jobData.cashAmount : jobData.hourlyRate}
                      onChange={(e) => setJobData(prev => ({ 
                        ...prev, 
                        [jobData.budgetType === 'fixed' ? 'cashAmount' : 'hourlyRate']: e.target.value 
                      }))}
                      placeholder={jobData.budgetType === 'fixed' ? '150.00' : '25.00'}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      required
                    />
                  </div>

                  {/* Commission Preview */}
                  {getEstimatedCommission() && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calculator className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Provisionsvorschau
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Gesamtbetrag:</span>
                          <span>€{getEstimatedCommission()!.grossAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            Ihre Provision ({getEstimatedCommission()!.commissionRate}%):
                          </span>
                          <span className="text-green-500">€{getEstimatedCommission()!.commission.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Auszahlung an Freelancer:</span>
                          <span className="text-blue-500">€{getEstimatedCommission()!.netAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Karma-Belohnung *
                  </label>
                  <input
                    type="number"
                    value={jobData.karmaAmount}
                    onChange={(e) => setJobData(prev => ({ ...prev, karmaAmount: e.target.value }))}
                    placeholder="100"
                    min="10"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    required
                  />
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Mindestens 10 Karma-Punkte
                  </div>
                </div>
              )}
            </div>

            {/* Additional Payment Options */}
            <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Zusätzliche Belohnung (optional)
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedJobType === 'cash' 
                      ? 'Zusätzliche Karma-Punkte für besonders gute Arbeit' 
                      : 'Kleine Geldbelohnung zusätzlich zum Karma'
                    }
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={jobData.offerBothPayments}
                    onChange={(e) => setJobData(prev => ({ ...prev, offerBothPayments: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {jobData.offerBothPayments && (
                <div className="pt-4 border-t border-gray-300 dark:border-slate-600">
                  {selectedJobType === 'cash' ? (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bonus Karma-Punkte
                      </label>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
                        <input
                          type="number"
                          value={jobData.additionalKarma}
                          onChange={(e) => setJobData(prev => ({ ...prev, additionalKarma: e.target.value }))}
                          placeholder="50"
                          min="0"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Zusätzliches Geld (€)
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                        <input
                          type="number"
                          step="0.01"
                          value={jobData.additionalCash}
                          onChange={(e) => setJobData(prev => ({ ...prev, additionalCash: e.target.value }))}
                          placeholder="25.00"
                          min="0"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-4 border`}>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Job-Zusammenfassung
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Titel:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{jobData.title || 'Nicht gesetzt'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Kategorie:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {categories.find(c => c.id === jobData.category)?.label || 'Nicht gesetzt'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Typ:</span>
                  <span className={`font-medium ${selectedJobType === 'cash' ? 'text-green-500' : 'text-purple-500'}`}>
                    {selectedJobType === 'cash' ? 'Cash Job' : 'Karma Job'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Vergütung:</span>
                  <span className={`font-medium ${selectedJobType === 'cash' ? 'text-green-500' : 'text-purple-500'}`}>
                    {selectedJobType === 'cash' 
                      ? (jobData.budgetType === 'fixed' 
                          ? jobData.cashAmount ? `€${jobData.cashAmount}` : 'Nicht gesetzt'
                          : jobData.hourlyRate ? `€${jobData.hourlyRate}/h (≈€${(parseFloat(jobData.hourlyRate) * parseFloat(jobData.expectedDuration)).toFixed(2)})` : 'Nicht gesetzt'
                        )
                      : jobData.karmaAmount ? `${jobData.karmaAmount} Karma` : 'Nicht gesetzt'
                    }
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
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Dauer:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {jobData.expectedDuration} Stunden
                  </span>
                </div>
                {jobData.offerBothPayments && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Zusätzlich:</span>
                    <span className={`font-medium ${selectedJobType === 'cash' ? 'text-purple-500' : 'text-green-500'}`}>
                      {selectedJobType === 'cash' 
                        ? jobData.additionalKarma ? `+${jobData.additionalKarma} Karma` : 'Kein Bonus'
                        : jobData.additionalCash ? `+€${jobData.additionalCash}` : 'Kein Bonus'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: 'Grundlagen', description: 'Titel, Beschreibung & Kategorie' },
    { number: 2, title: 'Details', description: 'Anforderungen & Lieferobjekte' },
    { number: 3, title: 'Abschluss', description: 'Deadline & Bezahlung' }
  ];

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
          {renderStepContent()}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-200 text-sm">{success}</p>
            </div>
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
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold ${
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