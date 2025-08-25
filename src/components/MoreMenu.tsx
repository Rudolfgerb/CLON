/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  User,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Bell,
  Shield,
  FileText,
  Star,
  Crown,
  Euro,
  Gift,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { products, getProductByPriceId } from '../stripe-config';
import ProfileForm, { ProfileData } from './ProfileForm';
import KarmaExchange from './KarmaExchange';
import NotificationSettingsPage from './NotificationSettingsPage';
import HelpPage from './HelpPage';
import LegalPage from './LegalPage';

interface MoreMenuProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ isDark, onToggleTheme }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showKarmaStore, setShowKarmaStore] = useState(false);
  const [showKarmaExchange, setShowKarmaExchange] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    bio: '',
    twitter: '',
    instagram: '',
    website: '',
    avatar_url: ''
  });

  useEffect(() => {
    loadUserData();
    
    // Listen for navigation events
    const handleNavigateToProfile = () => {
      setShowProfile(true);
    };
    
    const handleNavigateToPayments = () => {
      setShowPayments(true);
    };

    window.addEventListener('navigateToProfile', handleNavigateToProfile);
    window.addEventListener('navigateToPayments', handleNavigateToPayments);
    
    return () => {
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
      window.removeEventListener('navigateToPayments', handleNavigateToPayments);
    };
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        setProfileData({
          full_name: profile.full_name || '',
          email: profile.email || user.email || '',
          bio: profile.bio || '',
          twitter: profile.twitter || '',
          instagram: profile.instagram || '',
          website: profile.website || '',
          avatar_url: profile.avatar_url || ''
        });
      }

      // Load subscription data
      const { data: subscriptionData } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          email: profileData.email,
          bio: profileData.bio,
          twitter: profileData.twitter,
          instagram: profileData.instagram,
          website: profileData.website,
          avatar_url: profileData.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess('Profil erfolgreich aktualisiert!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload user data
      await loadUserData();
    } catch (error: any) {
      setError(error.message || 'Fehler beim Aktualisieren des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    setCheckoutLoading(priceId);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Nicht angemeldet');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout fehlgeschlagen');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Fehler beim Checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return null;
    
    const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
    
    return {
      isActive: subscription.subscription_status === 'active',
      productName: product?.name || 'Unbekanntes Produkt',
      endDate: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      willCancel: subscription.cancel_at_period_end
    };
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Lädt...
        </div>
      </div>
    );
  }

  // Profile Page
  if (showProfile) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Profil bearbeiten
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ihre persönlichen Informationen
                </p>
              </div>
            </div>
          </div>

          <ProfileForm
            isDark={isDark}
            profileData={profileData}
            setProfileData={setProfileData}
            loading={loading}
            onSubmit={handleProfileUpdate}
            error={error}
            success={success}
            userId={user?.id || ''}
          />
        </div>
      </div>
    );
  }

  // Payments Page
  if (showPayments) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPayments(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Zahlungen & Abos
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Verwalten Sie Ihre Abonnements
                </p>
              </div>
            </div>
          </div>

          {/* Current Subscription Status */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Aktueller Status
            </h2>
            
            {subscriptionStatus?.isActive ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {subscriptionStatus.productName}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {subscriptionStatus.willCancel 
                        ? `Läuft ab am ${subscriptionStatus.endDate?.toLocaleDateString('de-DE')}`
                        : `Verlängert sich am ${subscriptionStatus.endDate?.toLocaleDateString('de-DE')}`
                      }
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                  Aktiv
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kein aktives Abonnement
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Upgraden Sie zu Premium für erweiterte Features
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowPremium(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Crown className="w-8 h-8 mb-3 relative z-10" />
              <div className="text-left relative z-10">
                <div className="font-bold text-lg">Premium</div>
                <div className="text-sm opacity-90">Upgrade jetzt</div>
              </div>
            </button>

            <button
              onClick={() => setShowKarmaStore(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Star className="w-8 h-8 mb-3 relative z-10" />
              <div className="text-left relative z-10">
                <div className="font-bold text-lg">Karma Shop</div>
                <div className="text-sm opacity-90">Punkte kaufen</div>
              </div>
            </button>

            <button
              onClick={() => setShowKarmaExchange(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Euro className="w-8 h-8 mb-3 relative z-10" />
              <div className="text-left relative z-10">
                <div className="font-bold text-lg">Karma auszahlen</div>
                <div className="text-sm opacity-90">Karma in €</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium Upgrade Page
  if (showPremium) {
    const premiumProduct = products.find(p => p.mode === 'subscription');
    
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPremium(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Premium Upgrade
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Erweiterte Features freischalten
                </p>
              </div>
            </div>
          </div>

          {premiumProduct && (
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {premiumProduct.name}
                </h2>
                <p className={`text-lg font-bold text-orange-500 mb-4`}>
                  19,99 €/Monat
                </p>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {premiumProduct.description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {[
                  'Weniger Provision (5 %)',
                  'Keine Auszahlungsgebühr',
                  'Zugang zu Level 5 Jobs (ab 1.000 €)',
                  'Unbegrenzte Job-Posts',
                  'Priority Support',
                  'Erweiterte Analytics',
                  'Sichtbarer Premium-Status mit Gold-Badge'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={() => handleCheckout(premiumProduct.priceId, premiumProduct.mode)}
                disabled={checkoutLoading === premiumProduct.priceId || subscriptionStatus?.isActive}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {checkoutLoading === premiumProduct.priceId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Wird geladen...</span>
                  </>
                ) : subscriptionStatus?.isActive ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Bereits Premium</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Jetzt upgraden</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Karma Store Page
  if (showKarmaStore) {
    const karmaProduct = products.find(p => p.mode === 'payment');
    
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowKarmaStore(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Karma Shop
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Karma-Punkte kaufen
                </p>
              </div>
            </div>
          </div>

          {karmaProduct && (
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {karmaProduct.name}
                </h2>
                <p className={`text-lg font-bold text-purple-500 mb-4`}>
                  2,99 €
                </p>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {karmaProduct.description}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={() => handleCheckout(karmaProduct.priceId, karmaProduct.mode)}
                disabled={checkoutLoading === karmaProduct.priceId}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {checkoutLoading === karmaProduct.priceId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Wird geladen...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>Jetzt kaufen</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Karma Exchange Page
  if (showKarmaExchange) {
    return (
      <KarmaExchange
        isDark={isDark}
        userId={user?.id || ''}
        onClose={() => setShowKarmaExchange(false)}
      />
    );
  }

  if (showNotificationSettings) {
    return (
      <NotificationSettingsPage
        isDark={isDark}
        onBack={() => setShowNotificationSettings(false)}
      />
    );
  }

  if (showHelp) {
    return (
      <HelpPage
        isDark={isDark}
        onBack={() => setShowHelp(false)}
      />
    );
  }

  if (showLegal) {
    return (
      <LegalPage
        isDark={isDark}
        onBack={() => setShowLegal(false)}
      />
    );
  }

  // Main Menu
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
      label: 'Zahlungen & Abos',
      description: subscriptionStatus?.isActive ? subscriptionStatus.productName : 'Kein aktives Abo',
      onClick: () => setShowPayments(true),
      color: 'text-green-500',
      badge: subscriptionStatus?.isActive ? 'Premium' : null
    },
    {
      icon: isDark ? Sun : Moon,
      label: isDark ? 'Heller Modus' : 'Dunkler Modus',
      description: 'Design anpassen',
      onClick: onToggleTheme,
      color: 'text-yellow-500'
    },
    {
      icon: Bell,
      label: 'Benachrichtigungen',
      description: 'Push-Einstellungen',
      onClick: () => setShowNotificationSettings(true),
      color: 'text-purple-500'
    },
    {
      icon: Shield,
      label: 'Datenschutz',
      description: 'Privatsphäre-Einstellungen',
      onClick: () => {},
      color: 'text-indigo-500'
    },
    {
      icon: HelpCircle,
      label: 'Hilfe & Support',
      description: 'FAQ und Kontakt',
      onClick: () => setShowHelp(true),
      color: 'text-orange-500'
    },
    {
      icon: FileText,
      label: 'AGB & Datenschutz',
      description: 'Rechtliche Informationen',
      onClick: () => setShowLegal(true),
      color: 'text-gray-500'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Weitere Optionen
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Einstellungen und Verwaltung
          </p>
        </div>

        {/* User Info Card */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative`}>
              {subscriptionStatus?.isActive && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {userProfile?.full_name || 'Mutuus User'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userProfile?.email || user?.email}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile?.karma || 0} Karma
                  </span>
                </div>
                {subscriptionStatus?.isActive && (
                  <div className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Premium</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full ${isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="text-left">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:translate-x-1 transition-transform duration-300`} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-red-500/30 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
};

export default MoreMenu;