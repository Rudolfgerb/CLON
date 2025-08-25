import React from 'react';
import { X, Mail, Info } from 'lucide-react';

interface HelpPageProps {
  isDark: boolean;
  onBack: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ isDark, onBack }) => {
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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Hilfe & Support</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wir unterstützen dich gerne</p>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border space-y-4`}>
          <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            In unserem <span className="font-semibold">FAQ</span> findest du Antworten auf häufige Fragen.
            Solltest du keine Lösung finden, kontaktiere uns gerne direkt.
          </p>

          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <a
              href="mailto:support@mutuus.de"
              className="text-blue-500 hover:underline"
            >
              support@mutuus.de
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-blue-500" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Besuche auch unser Forum für Austausch mit der Community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
