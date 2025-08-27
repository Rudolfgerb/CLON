import React, { useState } from 'react';
import { User, CreditCard, HelpCircle, LogOut, Settings, Star, Crown, X, Zap, Calculator, Shield } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import PremiumModal from './PremiumModal';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface Profile {
  id: string;
  full_name?: string;
  bio?: string;
  website?: string;
  premium?: boolean;
}

interface MoreMenuProps {
  isDark: boolean;
  user: SupabaseUser;
  userProfile: Profile | null;
  onToggleTheme: () => void;
  onShowAdmin: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ isDark, user, userProfile, onToggleTheme, onShowAdmin }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
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
    } catch (error) {
      const err = error as { message?: string };
      setMessage('Fehler: ' + (err.message || 'Unbekannt'));
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
      label: userProfile?.premium ? 'Premium Aktiv' : 'Premium Upgrade',
      description: userProfile?.premium ? 'Nur 5% Gebühren' : 'Weniger Gebühren zahlen',
      onClick: () => setShowPremium(true),
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
      icon: Shield,
      label: 'Admin Panel',
      description: 'Verwaltungsbereich',
      onClick: onShowAdmin,
      color: 'text-red-500',
      adminOnly: true
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
    <>
      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        isDark={isDark}
      />
      
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
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                userProfile?.premium 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-500'
              }`}>
                <User className="w-8 h-8 text-white" />
                {userProfile?.premium && <Crown className="w-4 h-4 text-white absolute translate-x-6 -translate-y-6" />}
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
                  {userProfile?.premium && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => setShowPremium(true)}
              className={`group relative overflow-hidden rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300 ${
                userProfile?.premium 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}
            >
              <Crown className="w-8 h-8 mb-3" />
              <div className="text-left">
                <div className="font-bold text-lg">
                  {userProfile?.premium ? 'Premium Aktiv' : STRIPE_PRODUCTS.premium.name}
                </div>
                <div className="text-sm opacity-90">
                  {userProfile?.premium ? 'Nur 5% Provision' : STRIPE_PRODUCTS.premium.price + STRIPE_PRODUCTS.premium.period}
                </div>
              </div>
              {userProfile?.premium && (
                <div className="absolute top-2 right-2 bg-white/20 rounded-full px-2 py-1">
                  <span className="text-xs font-bold">AKTIV</span>
                </div>
              )}
            </button>

            <button 
              onClick={() => setShowPremium(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300"
            >
              <Zap className="w-8 h-8 mb-3" />
              <div className="text-left">
                <div className="font-bold text-lg">{STRIPE_PRODUCTS.karma_1000.name}</div>
                <div className="text-sm opacity-90">{STRIPE_PRODUCTS.karma_1000.karma} für {STRIPE_PRODUCTS.karma_1000.price}</div>
              </div>
            </button>
          </div>

          {/* Commission Info */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border mb-6`}>
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-5 h-5 text-blue-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Deine Gebühren
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${userProfile?.premium ? 'text-green-500' : 'text-red-500'}`}>
                  {userProfile?.premium ? '5%' : '9.8%'}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Provision pro Job
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {userProfile?.premium ? '€4.75' : '€9.31'}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Bei 95€ Job
                </div>
              </div>
            </div>
            {!userProfile?.premium && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowPremium(true)}
                  className="text-yellow-500 text-sm font-medium hover:text-yellow-400"
                >
                  Premium holen und sparen →
                </button>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-3 mb-8">
            {menuItems.filter(item => !item.adminOnly || (userProfile?.role === 'admin' || userProfile?.role === 'super_admin')).map((item, index) => (
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
    </>
  );
};

export default MoreMenu;