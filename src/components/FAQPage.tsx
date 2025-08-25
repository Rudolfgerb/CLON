import React from 'react';
import { X } from 'lucide-react';

interface FAQPageProps {
  isDark: boolean;
  onBack: () => void;
}

const faqs = [
  {
    q: 'Wie erstelle ich einen Job?',
    a: 'Navigiere zum Job-Bereich und klicke auf "Neuen Job erstellen".',
  },
  {
    q: 'Wie verdiene ich Karma Punkte?',
    a: 'Karma erhältst du durch abgeschlossene Aufträge und Aktivität in der Community.',
  },
  {
    q: 'Ist die Nutzung kostenlos?',
    a: 'Die Grundfunktionen sind kostenlos. Premium bietet zusätzliche Vorteile.',
  },
];

const FAQPage: React.FC<FAQPageProps> = ({ isDark, onBack }) => {
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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>FAQ</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Häufig gestellte Fragen</p>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}`}>
          {faqs.map((faq, idx) => (
            <details key={idx} className="p-4">
              <summary className={`cursor-pointer font-medium ${isDark ? 'text-white' : 'text-gray-900'} focus:outline-none`}>
                {faq.q}
              </summary>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
