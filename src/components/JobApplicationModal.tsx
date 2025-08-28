import React, { useState } from 'react';
import { X, Send, Star, AlertTriangle, Crown, Calculator, ChevronLeft, ChevronRight, User, FileText, CheckCircle } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, JobPost } from '../lib/supabase';
import { calculateJobCommission } from '../lib/stripe';

interface Profile {
  id: string;
  karma: number;
  premium: boolean;
  full_name?: string;
  email?: string;
}

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  job: JobPost | null;
  user: SupabaseUser;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [applicationData, setApplicationData] = useState({
    // Step 1: Personal Info
    fullName: userProfile?.full_name || '',
    email: user?.email || '',
    phone: '',
    
    // Step 2: Application Details
    coverLetter: '',
    experience: '',
    portfolioUrl: '',
    proposedAmount: '',
    availability: '',
    
    // Step 3: Additional Info
    questions: [] as string[],
    terms: false
  });

  // Check if user has enough karma for karma jobs
  const hasEnoughKarma = job?.payment_type === 'karma' ? 
    (userProfile?.karma || 0) >= (job?.karma_amount || 0) : true;

  if (!isOpen || !job) return null;

  const updateField = (field: string, value: any) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const canProceedFromStep1 = () => {
    return applicationData.fullName.trim() && 
           applicationData.email.trim() && 
           applicationData.email.includes('@');
  };

  const canProceedFromStep2 = () => {
    return applicationData.coverLetter.trim().length >= 50;
  };

  const canSubmit = () => {
    return canProceedFromStep1() && 
           canProceedFromStep2() && 
           applicationData.terms &&
           hasEnoughKarma;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    
    setLoading(true);
    setError('');

    try {
      // Check karma for karma jobs
      if (job.payment_type === 'karma' && (userProfile?.karma || 0) < (job.karma_amount || 0)) {
        throw new Error('Nicht genügend Karma für diese Bewerbung');
      }

      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          applicant_id: user.id,
          cover_letter: applicationData.coverLetter,
          proposed_amount: applicationData.proposedAmount ? parseFloat(applicationData.proposedAmount) : null,
          estimated_time: null,
          status: 'pending'
        });

      if (error) throw error;
      
      onSuccess();
      onClose();
      
      // Reset form
      setApplicationData({
        fullName: userProfile?.full_name || '',
        email: user?.email || '',
        phone: '',
        coverLetter: '',
        experience: '',
        portfolioUrl: '',
        proposedAmount: '',
        availability: '',
        questions: [],
        terms: false
      });
      setCurrentStep(1);
    } catch (error) {
      const err = error as { message?: string };
      setError(err.message || 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Persönliche Informationen
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Bestätigen Sie Ihre Kontaktdaten
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Vollständiger Name *
              </label>
              <input
                type="text"
                value={applicationData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                E-Mail Adresse *
              </label>
              <input
                type="email"
                value={applicationData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Telefonnummer (optional)
              </label>
              <input
                type="tel"
                value={applicationData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Bewerbungsdetails
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Erzählen Sie uns von sich und Ihrer Motivation
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Anschreiben * (mindestens 50 Zeichen)
              </label>
              <textarea
                rows={5}
                value={applicationData.coverLetter}
                onChange={(e) => updateField('coverLetter', e.target.value)}
                placeholder="Warum sind Sie der richtige Kandidat für diesen Job? Beschreiben Sie Ihre Motivation und relevante Erfahrungen..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
                required
              />
              <div className={`text-xs mt-1 ${
                applicationData.coverLetter.length >= 50 ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {applicationData.coverLetter.length}/50 Zeichen (mindestens)
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Relevante Erfahrung
              </label>
              <textarea
                rows={3}
                value={applicationData.experience}
                onChange={(e) => updateField('experience', e.target.value)}
                placeholder="Beschreiben Sie Ihre relevante Berufserfahrung für diesen Job..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Portfolio URL (optional)
              </label>
              <input
                type="url"
                value={applicationData.portfolioUrl}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
                placeholder="https://ihr-portfolio.de"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {job.payment_type === 'cash' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ihr Stundensatz (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={applicationData.proposedAmount}
                  onChange={(e) => updateField('proposedAmount', e.target.value)}
                  placeholder="25.00"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Verfügbarkeit
              </label>
              <select
                value={applicationData.availability}
                onChange={(e) => updateField('availability', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">Bitte wählen</option>
                <option value="sofort">Sofort verfügbar</option>
                <option value="1-week">In 1 Woche</option>
                <option value="2-weeks">In 2 Wochen</option>
                <option value="1-month">In 1 Monat</option>
                <option value="flexible">Flexibel</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Bewerbung überprüfen
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Prüfen Sie Ihre Angaben vor dem Absenden
              </p>
            </div>

            {/* Job Summary */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border`}>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Bewerbung für: {job.title}
              </h4>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-500">
                  {job.payment_type === 'cash' ? <Calculator className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                  {job.payment_type === 'cash' ? `€${job.cash_amount?.toFixed(2)}` : `${job.karma_amount} Karma`}
                </div>
              </div>
            </div>

            {/* Review Sections */}
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Kontaktinformationen
                </h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {applicationData.fullName}</p>
                  <p><span className="font-medium">E-Mail:</span> {applicationData.email}</p>
                  {applicationData.phone && (
                    <p><span className="font-medium">Telefon:</span> {applicationData.phone}</p>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Anschreiben
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {applicationData.coverLetter}
                </p>
              </div>

              {applicationData.experience && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Erfahrung
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {applicationData.experience}
                  </p>
                </div>
              )}

              {applicationData.proposedAmount && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Vorgeschlagener Stundensatz
                  </h4>
                  <p className="text-green-500 font-bold">€{applicationData.proposedAmount}</p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={applicationData.terms}
                onChange={(e) => updateField('terms', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="terms" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Ich bestätige, dass alle Angaben wahrheitsgemäß sind und stimme den{' '}
                <span className="text-blue-500 hover:text-blue-400 cursor-pointer">
                  Nutzungsbedingungen
                </span>{' '}
                zu.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: 'Kontakt', description: 'Persönliche Daten' },
    { number: 2, title: 'Details', description: 'Anschreiben & Erfahrung' },
    { number: 3, title: 'Prüfung', description: 'Überprüfung & Absenden' }
  ];

  const jobAmount = job.cash_amount || 0;
  const commission = job.payment_type === 'cash' && job.cash_amount ? 
    calculateJobCommission(job.cash_amount, userProfile?.premium || false) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border shadow-2xl`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
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

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.number
                      ? job.payment_type === 'cash'
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white'
                      : isDark ? 'bg-slate-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number}
                  </div>
                  <div className="mt-1 text-center">
                    <p className={`text-xs font-medium ${
                      currentStep >= step.number
                        ? isDark ? 'text-white' : 'text-gray-900'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.number
                      ? job.payment_type === 'cash' ? 'bg-green-500' : 'bg-purple-500'
                      : isDark ? 'bg-slate-700' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Payment Info for Cash Jobs */}
        {job.payment_type === 'cash' && commission && (
          <div className={`p-4 border-b ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Zahlungsübersicht
              </span>
              {userProfile?.premium && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Bruttobetrag:</span>
                <span>€{commission.grossAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Provision ({commission.commissionRate}%):
                </span>
                <span className="text-red-500">-€{commission.commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-green-500">
                <span>Sie erhalten:</span>
                <span>€{commission.netAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Karma Job Info */}
        {job.payment_type === 'karma' && (
          <div className={`p-4 border-b ${isDark ? 'border-slate-700 bg-purple-500/10' : 'border-gray-200 bg-purple-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Karma Job
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-500">
                  {job.karma_amount} Karma
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
                    Nicht genügend Karma! Du benötigst {(job.karma_amount || 0) - (userProfile?.karma || 0)} mehr Karma.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={currentStep === 1 ? onClose : prevStep}
              disabled={loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium ${
                isDark 
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {currentStep === 1 ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Abbrechen</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </>
              )}
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1()) ||
                  (currentStep === 2 && !canProceedFromStep2())
                }
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-medium text-white transition-all ${
                  (currentStep === 1 && canProceedFromStep1()) || 
                  (currentStep === 2 && canProceedFromStep2())
                    ? job.payment_type === 'cash'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-105'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Weiter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canSubmit()}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-medium text-white transition-all ${
                  canSubmit() && !loading
                    ? job.payment_type === 'cash'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-105'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {loading 
                    ? 'Wird gesendet...' 
                    : !hasEnoughKarma
                    ? 'Nicht genügend Karma'
                    : 'Bewerbung senden'
                  }
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;