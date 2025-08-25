import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NotificationSettingsPageProps {
  isDark: boolean;
  onBack: () => void;
}

const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({ isDark, onBack }) => {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    marketing: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const options = [
    { key: 'email', label: 'E-Mail Benachrichtigungen' },
    { key: 'push', label: 'Push Benachrichtigungen' },
    { key: 'marketing', label: 'Marketing Nachrichten' },
  ] as const;

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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Benachrichtigungen</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Push-Einstellungen</p>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border space-y-4`}>
          {options.map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{option.label}</span>
              <button
                onClick={() => toggle(option.key)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settings[option.key] ? 'bg-blue-500' : isDark ? 'bg-slate-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${settings[option.key] ? 'translate-x-4' : ''}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
