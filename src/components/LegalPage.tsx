import React from 'react';
import { X } from 'lucide-react';

interface LegalPageProps {
  isDark: boolean;
  onBack: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ isDark, onBack }) => {
  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6 max-w-2xl mx-auto">
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

        <div className="space-y-6">
          <section className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border`}>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Allgemeine Geschäftsbedingungen</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Die folgenden Bedingungen regeln die Nutzung dieser Plattform. Mit der Registrierung stimmst du diesen Bedingungen zu. Inhalte sind Platzhalter und sollten durch gültige rechtliche Texte ersetzt werden.</p>
          </section>

          <section className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border`}>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Datenschutzerklärung</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Wir gehen verantwortungsvoll mit deinen Daten um und verwenden sie nur gemäß unserer Datenschutzerklärung. Auch dieser Text dient als Platzhalter.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;

