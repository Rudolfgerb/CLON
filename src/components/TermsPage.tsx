import React from 'react';
import { X } from 'lucide-react';

interface TermsPageProps {
  isDark: boolean;
  onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ isDark, onBack }) => {
  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6 max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={onBack}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AGB & Datenschutz</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rechtliche Informationen</p>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border space-y-6`}>
          <div>
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Allgemeine Geschäftsbedingungen</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm leading-relaxed`}>
              Diese Seite dient als Platzhalter für die vollständigen AGB. Hier werden zukünftig die Bedingungen zur Nutzung der Plattform stehen.
            </p>
          </div>
          <div>
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Datenschutzerklärung</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm leading-relaxed`}>
              Informationen zur Verarbeitung personenbezogener Daten werden hier bereitgestellt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
