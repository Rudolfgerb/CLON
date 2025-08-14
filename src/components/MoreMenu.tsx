import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  Shield, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  Trash2
} from 'lucide-react';

interface MoreMenuProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ isDark, onToggleTheme }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const menuSections = [
    {
      title: 'Konto',
      items: [
        { 
          icon: User, 
          label: 'Profil bearbeiten', 
          description: 'Persönliche Informationen',
          action: () => setShowProfile(true),
          color: 'text-blue-500'
        },
        { 
          icon: CreditCard, 
          label: 'Zahlungsmethoden', 
          description: 'Karten und Konten verwalten',
          action: () => {},
          color: 'text-green-500'
        },
        { 
          icon: Bell, 
          label: 'Benachrichtigungen', 
          description: 'Push und E-Mail Einstellungen',
          action: () => {},
          color: 'text-orange-500'
        },
      ]
    },
    {
      title: 'App',
      items: [
        { 
          icon: Settings, 
          label: 'Einstellungen', 
          description: 'App Konfiguration',
          action: () => setShowSettings(true),
          color: 'text-gray-500'
        },
        { 
          icon: isDark ? Sun : Moon, 
          label: isDark ? 'Heller Modus' : 'Dunkler Modus', 
          description: 'Design anpassen',
          action: onToggleTheme,
          color: isDark ? 'text-yellow-500' : 'text-purple-500'
        },
        { 
          icon: Globe, 
          label: 'Sprache', 
          description: 'Deutsch',
          action: () => {},
          color: 'text-indigo-500'
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          icon: HelpCircle, 
          label: 'Hilfe & FAQ', 
          description: 'Häufige Fragen',
          action: () => {},
          color: 'text-cyan-500'
        },
        { 
          icon: Shield, 
          label: 'Datenschutz', 
          description: 'Privatsphäre Einstellungen',
          action: () => {},
          color: 'text-emerald-500'
        },
        { 
          icon: Mail, 
          label: 'Kontakt', 
          description: 'Support Team erreichen',
          action: () => {},
          color: 'text-pink-500'
        },
      ]
    }
  ];

  if (showProfile) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setShowProfile(false)}
              className={`mr-4 p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ChevronRight className={`w-5 h-5 rotate-180 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Profil bearbeiten
            </h1>
          </div>

          {/* Profile Picture */}
          <div className="flex items-center space-x-4 mb-8">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center`}>
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Max Mustermann</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>max@example.com</p>
              <button className="text-blue-500 text-sm font-medium mt-1">Foto ändern</button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Vollständiger Name
              </label>
              <input
                type="text"
                defaultValue="Max Mustermann"
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                E-Mail Adresse
              </label>
              <input
                type="email"
                defaultValue="max@example.com"
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Telefonnummer
              </label>
              <input
                type="tel"
                defaultValue="+49 123 456789"
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Bio
              </label>
              <textarea
                rows={3}
                defaultValue="Leidenschaftlicher Entwickler mit Fokus auf React und TypeScript."
                className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
            </div>

            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30">
              Änderungen speichern
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setShowSettings(false)}
              className={`mr-4 p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ChevronRight className={`w-5 h-5 rotate-180 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Einstellungen
            </h1>
          </div>

          <div className="space-y-6">
            {/* Privacy Settings */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Privatsphäre
              </h2>
              <div className="space-y-3">
                <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-4 border flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Profil öffentlich</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Andere können dein Profil sehen</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-4 border flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-green-500" />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Zwei-Faktor-Authentifizierung</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Zusätzliche Sicherheit für dein Konto</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* App Settings */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                App Einstellungen
              </h2>
              <div className="space-y-3">
                <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-4 border flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Push Benachrichtigungen</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Erhalte Updates über neue Jobs</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 text-red-500`}>
                Gefahrenbereich
              </h2>
              <div className="space-y-3">
                <button className={`w-full ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-xl p-4 flex items-center space-x-3 hover:scale-[1.02] transition-transform duration-300`}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium text-red-500">Konto löschen</p>
                    <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>Alle Daten werden permanent gelöscht</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Weitere Optionen
        </h1>

        {/* User Profile Card */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6 hover:scale-[1.02] transition-transform duration-300`}>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center`}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Max Mustermann</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>max@example.com</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-green-400 text-sm font-medium">€847 verdient</span>
                <span className="text-purple-400 text-sm font-medium">1,247 Karma</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className={`w-full ${isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="text-left">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.label}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} group-hover:translate-x-1 transition-transform duration-300`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div className="pt-4">
            <button className={`w-full ${isDark ? 'bg-red-900/20 border-red-800 hover:bg-red-900/30' : 'bg-red-50 border-red-200 hover:bg-red-100'} border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] group`}>
              <div className="flex items-center justify-center space-x-3">
                <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium text-red-500">Abmelden</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreMenu;