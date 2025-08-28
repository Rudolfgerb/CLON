import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface WizardStepProps {
  title: string;
  description?: string;
  stepNumber: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  onCancel?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  canProceed?: boolean;
  loading?: boolean;
  isDark?: boolean;
}

const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  stepNumber,
  totalSteps,
  children,
  onNext,
  onPrev,
  onCancel,
  nextLabel = 'Weiter',
  prevLabel = 'Zurück',
  canProceed = true,
  loading = false,
  isDark = false
}) => {
  const isFirstStep = stepNumber === 1;
  const isLastStep = stepNumber === totalSteps;

  return (
    <div className="wizard-step">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          {description && (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {description}
            </p>
          )}
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
            Schritt {stepNumber} von {totalSteps}
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const isActive = step === stepNumber;
            const isCompleted = step < stepNumber;
            
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCompleted || isActive
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-slate-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${
                      isCompleted || isActive
                        ? isDark ? 'text-white' : 'text-gray-900'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Schritt {step}
                    </div>
                  </div>
                </div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted
                      ? 'bg-blue-500'
                      : isDark ? 'bg-slate-700' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="wizard-content mb-8">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-slate-600">
        <div>
          {!isFirstStep && onPrev && (
            <button
              onClick={onPrev}
              disabled={loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium ${
                isDark 
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 transition-all`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{prevLabel}</span>
            </button>
          )}
        </div>

        <div>
          {onNext && (
            <button
              onClick={onNext}
              disabled={!canProceed || loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-white transition-all ${
                canProceed && !loading
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <span>
                {loading 
                  ? 'Lädt...' 
                  : isLastStep 
                    ? 'Abschließen' 
                    : nextLabel
                }
              </span>
              {!isLastStep && !loading && <ChevronRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardStep;