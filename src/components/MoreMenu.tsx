import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  Shield, 
  Mail, 
  Settings, 
  ChevronRight, 
  ArrowLeft,
  Edit,
  Camera,
  Save,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Clock,
  Check,
  X,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  Phone,
  Globe,
  Lock
} from 'lucide-react';

interface MoreMenuProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

type PageType = 'main' | 'profile' | 'payments' | 'notifications' | 'help' | 'privacy' | 'contact';

const MoreMenu: React.FC<MoreMenuProps> = ({ isDark, onToggleTheme }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [profileData, setProfileData] = useState({
    name: 'Max Mustermann',
    email: 'max@example.com',
    phone: '+49 123 456789',
    bio: 'Frontend Developer mit 5 Jahren Erfahrung',
    location: 'Berlin, Deutschland',
    website: 'https://maxmustermann.dev'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    pushJobs: true,
    pushApplications: true,
    pushPayments: true,
    emailNewsletter: false,
    emailUpdates: true,
    quietHoursEnabled: true,
    quietStart: '22:00',
    quietEnd: '08:00'
  });
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: 'general',
    message: '',
    email: profileData.email
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showActivity: false,
    dataCollection: true
  });

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profil bearbeiten', description: 'Name, E-Mail, Bio ändern' },
    { id: 'payments', icon: CreditCard, label: 'Zahlungsmethoden', description: 'Karten und Guthaben verwalten' },
    { id: 'notifications', icon: Bell, label: 'Benachrichtigungen', description: 'Push und E-Mail Einstellungen' },
    { id: 'help', icon: HelpCircle, label: 'Hilfe & FAQ', description: 'Häufige Fragen und Support' },
    { id: 'privacy', icon: Shield, label: 'Datenschutz', description: 'Privatsphäre und Sicherheit' },
    { id: 'contact', icon: Mail, label: 'Kontakt', description: 'Support kontaktieren' },
  ];

  const paymentMethods = [
    { id: 1, type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'paypal', email: 'max@example.com', isDefault: false }
  ];

  const faqItems = [
    {
      question: 'Wie erstelle ich einen Job?',
      answer: 'Klicke auf das Plus-Symbol in der Navigation und wähle zwischen Cash Job oder Karma Job. Fülle alle erforderlichen Felder aus und veröffentliche deinen Job.'
    },
    {
      question: 'Wann erhalte ich meine Bezahlung?',
      answer: 'Bei Cash Jobs wird die Zahlung sofort nach Abschluss des Jobs freigegeben. Das Geld ist innerhalb von 1-2 Werktagen auf deinem Konto.'
    },
    {
      question: 'Was sind Karma-Punkte?',
      answer: 'Karma-Punkte sind unser Belohnungssystem für Community-Beiträge. Du erhältst sie für abgeschlossene Karma Jobs und kannst sie für Premium-Features einsetzen.'
    },
    {
      question: 'Wie kann ich mein Profil verbessern?',
      answer: 'Vervollständige dein Profil, sammle positive Bewertungen und baue dein Portfolio auf. Je mehr Karma du hast, desto vertrauensvoller wirkst du.'
    },
    {
      question: 'Was passiert bei Problemen mit einem Job?',
      answer: 'Kontaktiere unseren Support über das Kontaktformular. Wir helfen bei Streitigkeiten und sorgen für faire Lösungen.'
    }
  ];

  const updateProfileData = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateNotificationSetting = (setting: string, value: boolean | string) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  };

  const updatePrivacySetting = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  const renderMainMenu = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Einstellungen
        </h1>
        <Settings className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
      </div>

      {/* User Info Card */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {profileData.name}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {profileData.email}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-green-500 font-semibold">€247.50</span>
              <span className="text-purple-500 font-semibold">1,247 Karma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as PageType)}
            className={`w-full ${isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] group`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.label}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:translate-x-1 transition-transform duration-300`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderProfilePage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentPage('main')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Profil bearbeiten
        </h1>
      </div>

      {/* Profile Picture */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Profilbild
        </h2>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Camera className="w-4 h-4" />
              <span>Foto ändern</span>
            </button>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              JPG, PNG oder GIF. Max. 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Persönliche Informationen
        </h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Vollständiger Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => updateProfileData('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              E-Mail Adresse
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => updateProfileData('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Telefonnummer
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => updateProfileData('phone', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Bio
            </label>
            <textarea
              rows={3}
              value={profileData.bio}
              onChange={(e) => updateProfileData('bio', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              placeholder="Erzähle etwas über dich..."
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Standort
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => updateProfileData('location', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Website
            </label>
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => updateProfileData('website', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2">
        <Save className="w-5 h-5" />
        <span>Änderungen speichern</span>
      </button>
    </div>
  );

  const renderPaymentsPage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentPage('main')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Zahlungsmethoden
        </h1>
      </div>

      {/* Balance */}
      <div className={`${isDark ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30' : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'} rounded-2xl p-6 border`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Verfügbares Guthaben
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Bereit zur Auszahlung
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-500">€247.50</div>
            <button className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
              Auszahlen
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Zahlungsmethoden
        </h2>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border flex items-center justify-between`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-8 ${method.type === 'visa' ? 'bg-blue-600' : 'bg-yellow-500'} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">
                    {method.type === 'visa' ? 'VISA' : 'PP'}
                  </span>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {method.type === 'visa' ? `•••• ${method.last4}` : method.email}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {method.type === 'visa' ? `Läuft ab ${method.expiry}` : 'PayPal Account'}
                    {method.isDefault && ' • Standard'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-200'} transition-colors`}>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Payment Method */}
        <button className={`w-full mt-4 ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'} border-2 border-dashed rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] group`}>
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Plus className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Neue Zahlungsmethode hinzufügen
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderNotificationsPage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentPage('main')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Benachrichtigungen
        </h1>
      </div>

      {/* Push Notifications */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Push-Benachrichtigungen
        </h2>
        <div className="space-y-4">
          {[
            { key: 'pushJobs', label: 'Neue Jobs', description: 'Benachrichtigung bei passenden Jobs' },
            { key: 'pushApplications', label: 'Bewerbungen', description: 'Updates zu deinen Bewerbungen' },
            { key: 'pushPayments', label: 'Zahlungen', description: 'Zahlungsbestätigungen und Auszahlungen' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.label}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => updateNotificationSetting(item.key, !notificationSettings[item.key as keyof typeof notificationSettings])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-blue-500' : isDark ? 'bg-slate-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[item.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          E-Mail Benachrichtigungen
        </h2>
        <div className="space-y-4">
          {[
            { key: 'emailNewsletter', label: 'Newsletter', description: 'Wöchentliche Updates und Tipps' },
            { key: 'emailUpdates', label: 'Wichtige Updates', description: 'Sicherheit und Kontoinformationen' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.label}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => updateNotificationSetting(item.key, !notificationSettings[item.key as keyof typeof notificationSettings])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-blue-500' : isDark ? 'bg-slate-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[item.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Ruhezeiten
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ruhezeiten aktivieren
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Keine Benachrichtigungen während der Ruhezeiten
              </p>
            </div>
            <button
              onClick={() => updateNotificationSetting('quietHoursEnabled', !notificationSettings.quietHoursEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.quietHoursEnabled ? 'bg-blue-500' : isDark ? 'bg-slate-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {notificationSettings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Von
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietStart}
                  onChange={(e) => updateNotificationSetting('quietStart', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bis
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietEnd}
                  onChange={(e) => updateNotificationSetting('quietEnd', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHelpPage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentPage('main')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Hilfe & FAQ
        </h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          type="text"
          placeholder="Hilfe durchsuchen..."
          className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-colors ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700 text-white placeholder-gray-400' 
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
        />
      </div>

      {/* Quick Help */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Schnelle Hilfe
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
            <Plus className={`w-6 h-6 mb-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Job erstellen
            </h3>
          </button>
          <button className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
            <CreditCard className={`w-6 h-6 mb-2 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Zahlungen
            </h3>
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Häufige Fragen
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div key={index} className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl border overflow-hidden`}>
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-opacity-80 transition-colors"
              >
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.question}
                </h3>
                {expandedFAQ === index ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>
              {expandedFAQ === index && (
                <div className="px-4 pb-4">
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} rounded-2xl p-6 border`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Weitere Hilfe benötigt?
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Unser Support-Team hilft gerne weiter
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('contact')}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Kontakt
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrivacyPage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentPage('main')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Datenschutz & Sicherheit
        </h1>
      </div>

      {/* Security Overview */}
      <div className={`${isDark ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30' : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'} rounded-2xl p-6 border`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Deine Daten sind sicher
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              256-bit SSL Verschlüsselung • DSGVO-konform
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">100%</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verschlüsselt</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">DSGVO</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Konform</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">24/7</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Überwacht</div>
          </div>
        </div>
      </div>

      {/* Data Categories */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Deine Daten
        </h2>
        <div className="space-y-4">
          {[
            { category: 'Profildaten', description: 'Name, E-Mail, Telefon', icon: User },
            { category: 'Aktivitätsdaten', description: 'Jobs, Bewerbungen, Bewertungen', icon: Clock },
            { category: 'Zahlungsdaten', description: 'Transaktionen, Auszahlungen', icon: CreditCard }
          ].map((item, index) => (
            <div key={index} className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border flex items-center space-x-4`}>
              <div className={`w-10 h-10 ${isDark ? 'bg-slate-600' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.category}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </div>
              <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                Verwalten
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Controls */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Privatsphäre-Einstellungen
        </h2>
        <div className="space-y-4">
          {[
            { key: 'profileVisible', label: 'Profil öffentlich sichtbar', description: 'Andere können dein Profil sehen' },
            { key: 'showActivity', label: 'Aktivität anzeigen', description: 'Zeige abgeschlossene Jobs und Bewertungen' },
            { key: 'dataCollection', label: 'Datensammlung für Verbesserungen', description: 'Hilf uns, die App zu verbessern' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.label}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => updatePrivacySetting(item.key, !privacySettings[item.key as keyof typeof privacySettings])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings[item.key as keyof typeof privacySettings] ? 'bg-blue-500' : isDark ? 'bg-slate-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings[item.key as keyof typeof privacySettings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Rights */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Deine Rechte
        </h2>
        <div className="space-y-3">
          <button className={`w-full p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] text-left ${isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
            <div className="flex items-center space-x-3">
              <Download className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Daten exportieren
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Lade alle deine Daten herunter
                </p>
              </div>
            </div>
          </button>
          <button className={`w-full p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] text-left ${isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Konto löschen
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Alle Daten permanent entfernen
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContactPage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentPage('main')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Kontakt & Support
        </h1>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${isDark ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} rounded-2xl p-6 border`}>
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Live Chat
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sofortige Hilfe von unserem Team
          </p>
          <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Chat starten
          </button>
        </div>

        <div className={`${isDark ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'} rounded-2xl p-6 border`}>
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            E-Mail Support
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Detaillierte Hilfe per E-Mail
          </p>
          <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
            E-Mail senden
          </button>
        </div>
      </div>

      {/* Support Hours */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Support-Zeiten
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Mo - Fr: 9:00 - 18:00
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Werktags
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sa: 10:00 - 16:00
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Samstag
              </p>
            </div>
          </div>
        </div>
        <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            ⚡ Durchschnittliche Antwortzeit: 2-4 Stunden
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Nachricht senden
        </h2>
        <form className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Betreff
            </label>
            <select
              value={contactForm.subject}
              onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            >
              <option value="general">Allgemeine Frage</option>
              <option value="technical">Technisches Problem</option>
              <option value="payment">Zahlungsproblem</option>
              <option value="account">Konto-Problem</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              E-Mail Adresse
            </label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nachricht
            </label>
            <textarea
              rows={5}
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              placeholder="Beschreibe dein Anliegen so detailliert wie möglich..."
              className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>Nachricht senden</span>
          </button>
        </form>
      </div>

      {/* Additional Contact Info */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Weitere Kontaktmöglichkeiten
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Phone className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              +49 30 12345678
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              support@cleanwork.de
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              www.cleanwork.de/hilfe
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return renderProfilePage();
      case 'payments':
        return renderPaymentsPage();
      case 'notifications':
        return renderNotificationsPage();
      case 'help':
        return renderHelpPage();
      case 'privacy':
        return renderPrivacyPage();
      case 'contact':
        return renderContactPage();
      default:
        return renderMainMenu();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default MoreMenu;