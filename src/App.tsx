import React, { useState } from 'react';
import { useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Home, Briefcase, Plus, GraduationCap, MoreHorizontal, User, Bell, Euro, Code, BookOpen, Star, ArrowRight, Moon, Sun } from 'lucide-react';
import JobsPage from './components/JobsPage';
import CampusPage from './components/CampusPage';
import MoreMenu from './components/MoreMenu';
import AuthPage from './components/AuthPage';
import CreateCashJobPage from './components/CreateCashJobPage';
import CreateKarmaJobPage from './components/CreateKarmaJobPage';
import NotificationsPage from './components/NotificationsPage';
import GameNotificationSystem from './components/GameNotificationSystem';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCashJob, setShowCreateCashJob] = useState(false);
  const [showCreateKarmaJob, setShowCreateKarmaJob] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock data
  const [gameNotifications, setGameNotifications] = useState<any[]>([]);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(7);
  const [karmaPoints, setKarmaPoints] = useState(1247);
  const [totalEarnings, setTotalEarnings] = useState(847);

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

  // Gamification System
  useEffect(() => {
    // Simulate random achievements and notifications
    const achievementTimer = setInterval(() => {
      const achievements = [
        { type: 'achievement', title: '🏆 Neuer Erfolg!', message: 'Speed Demon freigeschaltet!', color: 'from-yellow-500 to-orange-500' },
        { type: 'karma', title: '⭐ Karma erhalten!', message: '+25 Karma für abgeschlossenen Job', color: 'from-purple-500 to-pink-500' },
        { type: 'streak', title: '🔥 Streak verlängert!', message: `${dailyStreak} Tage in Folge aktiv!`, color: 'from-red-500 to-orange-500' },
        { type: 'level', title: '📈 Level Up!', message: 'Du bist jetzt Level 12!', color: 'from-blue-500 to-cyan-500' },
        { type: 'bonus', title: '💰 Bonus erhalten!', message: '+€50 Aktivitätsbonus!', color: 'from-green-500 to-emerald-500' }
      ];
      
      if (Math.random() > 0.7) { // 30% chance every interval
        const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
        setGameNotifications(prev => [...prev, { ...randomAchievement, id: Date.now() }]);
      }
    }, 15000); // Every 15 seconds

    // Daily reminder system
    const reminderTimer = setInterval(() => {
      const reminders = [
        { type: 'reminder', title: '📚 Lernzeit!', message: 'Schau dir neue Campus-Kurse an', color: 'from-indigo-500 to-purple-500' },
        { type: 'reminder', title: '💼 Job-Check!', message: 'Neue passende Jobs verfügbar', color: 'from-blue-500 to-indigo-500' },
        { type: 'reminder', title: '⏰ Tägliche Aufgabe!', message: 'Vervollständige dein Tagesziel', color: 'from-orange-500 to-red-500' }
      ];
      
      if (Math.random() > 0.8) { // 20% chance
        const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];
        setGameNotifications(prev => [...prev, { ...randomReminder, id: Date.now() }]);
      }
    }, 25000); // Every 25 seconds

    return () => {
      clearInterval(achievementTimer);
      clearInterval(reminderTimer);
    };
  }, [dailyStreak]);

  const removeGameNotification = useCallback((id: number) => {
    setGameNotifications(prev => prev.filter(notif => notif.id !== id));
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
    { label: 'Verdienst', value: `€${totalEarnings}`, color: 'text-green-400' },
    { label: 'Karma', value: karmaPoints.toLocaleString(), color: 'text-purple-400' },
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
        if (showCreateKarmaJob) {
          return <CreateKarmaJobPage isDark={isDark} onBack={() => setShowCreateKarmaJob(false)} />;
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
                <button 
                  onClick={() => setShowCreateKarmaJob(true)}
                  className="group w-full relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30"
                >
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
            {/* Daily Streak Banner */}
            <div className="px-6 py-2">
              <div className={`${isDark ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'} rounded-2xl p-4 border relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl animate-bounce">🔥</div>
                    <div>
                      <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dailyStreak} Tage Streak!
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                        Bleib dran für Bonus-Karma!
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">+{dailyStreak * 5}</div>
                    <div className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Bonus Karma</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Back Section */}
            <div className="px-6 py-4">
              <div className={`${isDark ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} rounded-2xl p-6 border transition-all duration-500 hover:scale-[1.02] transform relative overflow-hidden`}>
                {/* Pulsing notification dot */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full"></div>
                
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>Willkommen zurück!</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 transition-colors duration-500`}>Bereit für neue Herausforderungen?</p>
                
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center relative">
                      {index === 2 && ( // Karma stat gets special treatment
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      )}
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
                  className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25 animate-pulse"
                >
                  {/* Notification badge */}
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                    3
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Euro className="w-8 h-8 mb-3 relative z-10" />
                  <div className="text-left relative z-10">
                    <div className="font-bold text-lg">Cash Jobs</div>
                    <div className="text-sm opacity-90">3 neue Jobs!</div>
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
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-orange-300 animate-ping opacity-30"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Star className="w-8 h-8 mb-3 relative z-10" />
                  <div className="text-left relative z-10">
                    <div className="font-bold text-lg">Karma Jobs</div>
                    <div className="text-sm opacity-90">+50 Bonus heute!</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="px-6 py-4 pb-32">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>Letzte Aktivitäten</h3>
                <button
                  onClick={() => setShowActivityDetails(true)}
                  className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors relative`}
                >
                  <span className="relative z-10">Alle anzeigen</span>
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg animate-pulse"></div>
                </button>
              </div>
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className={`${isDark ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer relative overflow-hidden ${index === 0 ? 'ring-2 ring-green-500/50 animate-pulse' : ''}`}>
                    {index === 0 && (
                      <>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
                      </>
                    )}
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
                        <p className={`text-sm font-medium ${index === 0 ? 'text-green-400 animate-pulse' : 'text-green-400'}`}>{activity.karma}</p>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:translate-x-1 transition-transform duration-300`} />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Achievement Teaser */}
              <div className={`mt-6 ${isDark ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} rounded-2xl p-4 border relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="text-3xl animate-bounce">🏆</div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Nächster Erfolg: Speed Demon
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                      Noch 2 schnelle Jobs bis zum Erfolg!
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <div className="text-purple-500 font-bold">2/3</div>
                  </div>
                </div>
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
            <button
              onClick={() => {
                setActiveTab('more');
                // Small delay to ensure tab is active before navigating to profile
                setTimeout(() => {
                  const event = new CustomEvent('navigateToProfile');
                  window.dispatchEvent(event);
                }, 100);
              }}
              className={`w-10 h-10 rounded-full ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer relative`}
            >
              {/* Profile update notification */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
              <User className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>
                {userProfile?.full_name || 'CleanWork'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>
                Karma: {karmaPoints} Punkte (+25 heute!)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setActiveTab('more');
                // Small delay to ensure tab is active before navigating to payments
                setTimeout(() => {
                  // This will be handled by MoreMenu component
                  const event = new CustomEvent('navigateToPayments');
                  window.dispatchEvent(event);
                }, 100);
              }}
              className={`font-bold text-lg ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'} transition-all duration-300 hover:scale-110 cursor-pointer relative`}
            >
              <span className="relative z-10">€{totalEarnings}</span>
              <div className="absolute inset-0 bg-green-500/20 rounded-lg animate-pulse"></div>
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-full hover:bg-slate-700/50 transition-colors animate-pulse"
            >
              <Bell className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifications}
                </span>
              )}
              {/* Additional notification ring */}
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-30"></div>
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

      {/* Game Notification System */}
      <GameNotificationSystem 
        notifications={gameNotifications}
        onRemove={removeGameNotification}
        isDark={isDark}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isDark ? 'bg-slate-800/95 backdrop-blur-xl border-slate-700' : 'bg-white/95 backdrop-blur-xl border-gray-200'} border-t transition-all duration-500 relative`}>
          {/* Notification glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent animate-pulse"></div>
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
                {/* Special notifications for specific tabs */}
                {item.id === 'jobs' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                )}
                {item.id === 'campus' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                )}
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