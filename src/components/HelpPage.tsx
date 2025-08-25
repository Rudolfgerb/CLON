import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface HelpPageProps {
  isDark: boolean;
  onBack: () => void;
}

const faqs = [
  {
    question: 'Wie erstelle ich ein neues Konto?',
    answer: 'Klicke auf Registrieren und folge den Anweisungen. Du benötigst nur eine E-Mail-Adresse.'
  },
  {
    question: 'Wie kann ich einen Job anbieten?',
    answer: 'Unter Jobs kannst du neue Inserate erstellen und verwalten.'
  },
  {
    question: 'Wer kann meine Daten sehen?',
    answer: 'Nur verifizierte Nutzer mit denen du interagierst haben Zugriff auf deine Daten.'
  }
];

const HelpPage: React.FC<HelpPageProps> = ({ isDark, onBack }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Hilfe & FAQ</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Antworten auf häufige Fragen</p>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border`}
              >
                <button
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.question}</span>
                  {open ? <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /> : <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />}
                </button>
                {open && (
                  <p className={`px-4 pb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.answer}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Noch Fragen?</p>
          <a
            href="mailto:support@example.com"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30"
          >
            Kontaktiere uns
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

