import React, { useState } from 'react';
import { 
  Settings, Database, Mail, Shield, Globe, 
  Save, RefreshCw, AlertTriangle, CheckCircle
} from 'lucide-react';

interface AdminSettingsProps {
  isDark: boolean;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState({
    siteName: 'Mutuus',
    siteDescription: 'Karma Exchange Platform',
    commissionRate: '9.8',
    premiumCommissionRate: '5.0',
    minimumPayout: '25.00',
    karmaToEuroRate: '0.003',
    emailNotifications: true,
    maintenanceMode: false
  });

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: Settings },
    { id: 'payments', label: 'Zahlungen', icon: Database },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Mail },
    { id: 'security', label: 'Sicherheit', icon: Shield },
    { id: 'system', label: 'System', icon: Globe }
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would save settings to your database
      // await supabase.from('app_settings').upsert(settings);
      
      setMessage('Einstellungen erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const err = error as { message?: string };
      setMessage('Fehler beim Speichern: ' + (err.message || 'Unbekannt'));
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Seiten Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Beschreibung
              </label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Standard Provision (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, commissionRate: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Premium Provision (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.premiumCommissionRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, premiumCommissionRate: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mindest Auszahlung (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.minimumPayout}
                  onChange={(e) => setSettings(prev => ({ ...prev, minimumPayout: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Karma zu Euro Rate
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={settings.karmaToEuroRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, karmaToEuroRate: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Wartungsmodus
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sperrt die App für normale Benutzer
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.maintenanceMode && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    Wartungsmodus ist aktiviert. Nur Administratoren können die App verwenden.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Tab content for {activeTab}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
          System Einstellungen
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Plattform konfigurieren und verwalten
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : isDark
                ? 'text-gray-300 hover:bg-slate-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <form onSubmit={handleSave}>
          {renderTabContent()}

          {message && (
            <div className={`mt-6 p-4 rounded-xl ${
              message.includes('Fehler') 
                ? 'bg-red-500/20 border border-red-500/30 text-red-200' 
                : 'bg-green-500/20 border border-green-500/30 text-green-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.includes('Fehler') ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{message}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Wird gespeichert...' : 'Einstellungen speichern'}</span>
            </button>
            
            <button
              type="button"
              className={`px-6 py-3 rounded-xl font-semibold border ${
                isDark 
                  ? 'border-slate-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              } flex items-center space-x-2`}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Zurücksetzen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;