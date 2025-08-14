import React, { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Home, Briefcase, Plus, GraduationCap, MoreHorizontal, User, Bell, Euro, Code, BookOpen, Star, ArrowRight, Moon, Sun } from 'lucide-react';
import JobsPage from './components/JobsPage';
import CampusPage from './components/CampusPage';
import MoreMenu from './components/MoreMenu';
import AuthPage from './components/AuthPage';
import CreateCashJobPage from './components/CreateCashJobPage';
import NotificationsPage from './components/NotificationsPage';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCashJob, setShowCreateCashJob] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock data

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Load user profile when user logs in
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleAuthSuccess = () => {
    // User state will be updated automatically by the auth listener
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    );
  }

  // Temporarily disabled for development
  // if (!user) {
  //   return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  // }

  const stats = [
    { label: 'Meine Jobs', value: '12', color: 'text-blue-400' },
    { label: 'Verdienst', value: '€847', color: 'text-green-400' },
    { label: 'Karma', value: '1,247', color: 'text-purple-400' },
  ];

  const activities = [
    {
      title: 'React Projekt',
      subtitle: '€120 • Abgeschlossen',
      time: 'Heute',
      karma: '+50 Karma',
      icon: Code,
      color: 'bg-blue-500',
    },
    {
      title: 'JavaScript Tutorial',
      subtitle: 'Campus Lektion',
      time: 'Gestern',
      karma: '+25 Karma',
      icon: BookOpen,
      color: 'bg-purple-500',
    },
  ];

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs' },
    { id: 'add', icon: Plus, label: 'Add', isCenter: true },
    { id: 'campus', icon: GraduationCap, label: 'Campus' },
    { id: 'more', icon: MoreHorizontal, label: 'Weitere' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return <JobsPage isDark={isDark} onShowNotifications={() => setShowNotifications(true)} />;
      case 'campus':
        return <CampusPage isDark={isDark} />;
      case 'more':
        return <MoreMenu isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />;
      case 'add':
        if (showCreateCashJob) {
          return <CreateCashJobPage isDark={isDark} onBack={() => setShowCreateCashJob(false)} />;
        }
        return (
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="px-6 py-6">
              <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Job erstellen
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
                Wähle den Typ deines Jobs aus
              </p>

              <div className="space-y-6">
                {/* Cash Job Option */}
                <button 
                  onClick={() => setShowCreateCashJob(true)}
                  className="group w-full relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Euro className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">€€€</div>
                        <div className="text-sm opacity-90">Geld verdienen</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Cash Job</h3>
                    <p className="text-lg opacity-90 mb-4">
                      Erstelle einen bezahlten Job und verdiene echtes Geld
                    </p>
                    <div className="flex items-center space-x-4 text-sm opacity-80">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        Sofortige Bezahlung
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        Professionelle Projekte
                      </div>
                    </div>
                  </div>
                </button>

                {/* Karma Job Option */}
                <button className="group w-full relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">⭐⭐⭐</div>
                        <div className="text-sm opacity-90">Karma sammeln</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Karma Job</h3>
                    <p className="text-lg opacity-90 mb-4">
                      Sammle Karma-Punkte und baue deine Reputation auf
                    </p>
                    <div className="flex items-center space-x-4 text-sm opacity-80">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        Community Hilfe
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        Skill Building
                      </div>
                    </div>
                  </div>
                </button>

                {/* Info Section */}
                <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Was ist der Unterschied?
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Euro className="w-3 h-3 text-green-500" />
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Cash Jobs</p>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Bezahlte Projekte für professionelle Entwicklung und sofortiges Einkommen
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-3 h-3 text-purple-500" />
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Karma Jobs</p>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Community-basierte Aufgaben zum Lernen und Reputation aufbauen
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            {/* Welcome Back Section */}
            <div className="px-6 py-4">
              <div className={`${isDark ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} rounded-2xl p-6 border transition-all duration-500 hover:scale-[1.02] transform`}>
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>Willkommen zurück!</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 transition-colors duration-500`}>Bereit für neue Herausforderungen?</p>
                
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-2xl font-bold ${stat.color} transition-colors duration-500`}>{stat.value}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} transition-colors duration-500`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-4">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>Schnellaktionen</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    setActiveTab('jobs');
                    // Small delay to ensure tab is active before setting filter
                    setTimeout(() => {
                      const event = new CustomEvent('setJobFilter', { detail: 'cash' });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Euro className="w-8 h-8 mb-3 relative z-10" />
                  <div className="text-left relative z-10">
                    <div className="font-bold text-lg">Cash Jobs</div>
                    <div className="text-sm opacity-90">Geld verdienen</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setActiveTab('jobs');
                    // Small delay to ensure tab is active before setting filter
                    setTimeout(() => {
                      // This will be handled by JobsPage component
                      const event = new CustomEvent('setJobFilter', { detail: 'karma' });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Star className="w-8 h-8 mb-3 relative z-10" />
                  <div className="text-left relative z-10">
                    <div className="font-bold text-lg">Karma Jobs</div>
                    <div className="text-sm opacity-90">Punkte sammeln</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="px-6 py-4 pb-32">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>Letzte Aktivitäten</h3>
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className={`${isDark ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${activity.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <activity.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>{activity.title}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>{activity.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>{activity.time}</p>
                        <p className="text-sm text-green-400 font-medium">{activity.karma}</p>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:translate-x-1 transition-transform duration-300`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} transition-colors duration-500`}>
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center transition-colors duration-500`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>
                {userProfile?.full_name || 'CleanWork'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>
                Karma: {userProfile?.karma || 0} Punkte
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`font-bold text-lg ${isDark ? 'text-green-400' : 'text-green-600'} transition-colors duration-500`}>€247</span>
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-full hover:bg-slate-700/50 transition-colors"
            >
              <Bell className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>
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
      {showNotifications ? (
        <NotificationsPage 
          isDark={isDark} 
          onBack={() => setShowNotifications(false)} 
        />
      ) : (
        renderContent()
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isDark ? 'bg-slate-800/95 backdrop-blur-xl border-slate-700' : 'bg-white/95 backdrop-blur-xl border-gray-200'} border-t transition-all duration-500`}>
          <div className="flex items-center justify-around py-2 px-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                  item.isCenter
                    ? `w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 ${
                        activeTab === item.id ? 'scale-105 shadow-xl shadow-blue-500/30' : ''
                      }`
                    : `w-12 h-12 ${
                        activeTab === item.id
                          ? `${isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600'} scale-110 shadow-lg`
                          : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:scale-105`
                      }`
                }`}
              >
                {activeTab === item.id && !item.isCenter && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl animate-pulse"></div>
                )}
                {item.isCenter && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
                )}
                <item.icon className={`${item.isCenter ? 'w-8 h-8' : 'w-6 h-6'} relative z-10 transition-transform duration-300`} />
                {!item.isCenter && (
                  <span className={`text-xs mt-1 relative z-10 transition-all duration-300 ${
                    activeTab === item.id ? 'opacity-100 font-medium' : 'opacity-70'
                  }`}>
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