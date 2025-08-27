import React, { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Home, Briefcase, Plus, GraduationCap, MoreHorizontal, User, Euro, Star, Sun, Moon } from 'lucide-react';
import AuthPage from './components/AuthPage';
import JobsPage from './components/JobsPage';
import CampusPage from './components/CampusPage';
import MoreMenu from './components/MoreMenu';
import CreateJobPage from './components/CreateJobPage';
import SuccessPage from './components/SuccessPage';
import AdminAuth from './components/AdminAuth';
import AdminDashboard from './components/AdminDashboard';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  karma: number;
  level: number;
  premium: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check for Stripe success/cancel params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      setShowSuccess(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (!data) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || 'Mutuus User',
            karma: 100,
            level: 1,
            premium: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
        setUserProfile(newProfile);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  }, [user]);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  // Check for admin access
  if (showAdmin) {
    return (
      <AdminAuth user={user} isDark={isDark}>
        <AdminDashboard
          userProfile={userProfile}
          isDark={isDark}
          onExitAdmin={() => setShowAdmin(false)}
        />
      </AdminAuth>
    );
  }

  if (showSuccess) {
    return (
      <SuccessPage 
        isDark={isDark} 
        onContinue={() => {
          setShowSuccess(false);
          setActiveTab('home');
          // Reload user profile to get updated premium status
          if (user) loadUserProfile(user.id);
        }} 
      />
    );
  }

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs' },
    { id: 'add', icon: Plus, label: 'Add', isCenter: true },
    { id: 'campus', icon: GraduationCap, label: 'Campus' },
    { id: 'more', icon: MoreHorizontal, label: 'Mehr' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return <JobsPage isDark={isDark} user={user} userProfile={userProfile} />;
      case 'campus':
        return <CampusPage isDark={isDark} />;
      case 'more':
        return <MoreMenu isDark={isDark} user={user} userProfile={userProfile} onToggleTheme={() => setIsDark(!isDark)} onShowAdmin={() => setShowAdmin(true)} />;
      case 'add':
        return <CreateJobPage isDark={isDark} user={user} onBack={() => setActiveTab('home')} />;
      default:
        return (
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="px-6 py-6">
              {/* Welcome Section */}
              <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Willkommen zurück, {userProfile?.full_name || 'User'}!
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Bereit für neue Herausforderungen?
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">12</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Meine Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">€250</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Verdienst</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{userProfile?.karma || 0}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Karma</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    setActiveTab('add');
                    setJobCreationType('cash');
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300"
                >
                  <Euro className="w-8 h-8 mb-3" />
                  <div className="text-left">
                    <div className="font-bold text-lg">Cash Jobs</div>
                    <div className="text-sm opacity-90">Geld verdienen</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setActiveTab('add');
                    setJobCreationType('karma');
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300"
                >
                  <Star className="w-8 h-8 mb-3" />
                  <div className="text-left">
                    <div className="font-bold text-lg">Karma Jobs</div>
                    <div className="text-sm opacity-90">Community helfen</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} transition-colors duration-500`}>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {userProfile?.full_name || 'Mutuus User'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Karma: {userProfile?.karma || 0} Punkte
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`font-bold text-lg text-green-500`}>€250</span>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-gray-200 text-gray-700'} hover:scale-110 transition-all duration-300`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isDark ? 'bg-slate-800/95 backdrop-blur-xl border-slate-700' : 'bg-white/95 backdrop-blur-xl border-gray-200'} border-t`}>
          <div className="flex items-center justify-around py-2 px-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                  item.isCenter
                    ? `w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-110 ${
                        activeTab === item.id ? 'scale-105 shadow-xl' : ''
                      }`
                    : `w-16 h-16 ${
                        activeTab === item.id
                          ? `${isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600'} scale-110`
                          : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:scale-105`
                      }`
                }`}
              >
                <item.icon className={`${item.isCenter ? 'w-10 h-10' : 'w-8 h-8'} transition-transform duration-300`} />
                {!item.isCenter && (
                  <span className={`text-sm mt-1 font-medium ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;