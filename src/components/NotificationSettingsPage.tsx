import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationSettingsPageProps {
  isDark: boolean;
  onBack: () => void;
}

const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({ isDark, onBack }) => {
  const [settings, setSettings] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    marketing: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Benachrichtigungen</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Push-Einstellungen verwalten</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'jobAlerts', label: 'Neue Jobs', description: 'Informiere mich über neue Jobangebote in meiner Nähe.' },
            { key: 'applicationUpdates', label: 'Bewerbungs-Updates', description: 'Benachrichtige mich über Statusänderungen meiner Bewerbungen.' },
            { key: 'marketing', label: 'Marketing', description: 'Sende mir Tipps, Angebote und Neuigkeiten.' }
          ].map(item => (
            <div
              key={item.key}
              className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border flex items-center justify-between`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center`}>
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(item.key as keyof typeof settings)}
                className={`w-14 h-8 rounded-full transition-colors duration-300 relative focus:outline-none ${
                  settings[item.key as keyof typeof settings]
                    ? 'bg-green-500'
                    : isDark
                      ? 'bg-slate-600'
                      : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    settings[item.key as keyof typeof settings] ? 'translate-x-6' : ''
                  }`}
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

