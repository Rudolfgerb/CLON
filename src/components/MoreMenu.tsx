import React, { useState } from 'react';
import { User, CreditCard, HelpCircle, LogOut, Settings, Star, Crown, Euro, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MoreMenuProps {
  isDark: boolean;
  user: any;
  userProfile: any;
  onToggleTheme: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ isDark, user, userProfile, onToggleTheme }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: userProfile?.full_name || '',
    bio: userProfile?.bio || '',
    website: userProfile?.website || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;
      setMessage('Profil erfolgreich aktualisiert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Fehler: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showProfile) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Profil bearbeiten
              </h1>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl ${message.includes('Fehler') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Wird gespeichert...' : 'Profil speichern'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: User,
      label: 'Profil bearbeiten',
      description: 'Persönliche Informationen',
      onClick: () => setShowProfile(true),
      color: 'text-blue-500'
    },
    {
      icon: CreditCard,
      label: 'Premium Upgrade',
      description: 'Erweiterte Features',
      onClick: () => {},
      color: 'text-yellow-500'
    },
    {
      icon: Settings,
      label: 'Design wechseln',
      description: isDark ? 'Heller Modus' : 'Dunkler Modus',
      onClick: onToggleTheme,
      color: 'text-purple-500'
    },
    {
      icon: HelpCircle,
      label: 'Hilfe & Support',
      description: 'FAQ und Kontakt',
      onClick: () => {},
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mehr</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Einstellungen und Verwaltung
          </p>
        </div>

        {/* User Info */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {userProfile?.full_name || 'Mutuus User'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userProfile?.email || user?.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {userProfile?.karma || 0} Karma
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300">
            <Crown className="w-8 h-8 mb-3" />
            <div className="text-left">
              <div className="font-bold text-lg">Premium</div>
              <div className="text-sm opacity-90">Upgrade jetzt</div>
            </div>
          </button>

          <button className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300">
            <Euro className="w-8 h-8 mb-3" />
            <div className="text-left">
              <div className="font-bold text-lg">Auszahlung</div>
              <div className="text-sm opacity-90">Geld abheben</div>
            </div>
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full ${isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-2xl p-4 border transition-all duration-300`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-left flex-1">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
};

export default MoreMenu;