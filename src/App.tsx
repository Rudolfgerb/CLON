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
  const [gameNotifications, setGameNotifications] = useState<any[]>([]);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  
  // Real data states
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [karmaPoints, setKarmaPoints] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [profileNeedsUpdate, setProfileNeedsUpdate] = useState(false);
  const [todayKarmaEarned, setTodayKarmaEarned] = useState(0);
  const [hasActiveJobs, setHasActiveJobs] = useState(false);
  const [completedJobsToday, setCompletedJobsToday] = useState(0);

  // Notification-specific states for blinking control
  const [notificationStates, setNotificationStates] = useState({
    newJobs: false,
    newApplications: false,
    karmaEarned: false,
    profileIncomplete: false,
    friendInvites: false,
    achievements: false,
    campusUpdates: false
  });
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    // Listen for notification read events
    const handleNotificationRead = () => {
      if (user) {
        loadNotifications(user.id);
      }
    };

    window.addEventListener('notificationRead', handleNotificationRead);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('notificationRead', handleNotificationRead);
    };
  }, []);

  // Load real user data
  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      await loadUserProfile(userId);
      
      // Load notifications
      await loadNotifications(userId);
      
      // Load jobs data
      await loadJobsData(userId);
      
      // Load applications
      await loadApplicationsData(userId);
      
      // Check profile completeness
      checkProfileCompleteness(userId);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      setUnreadNotifications(data?.length || 0);
      
      // Update notification states based on actual notifications
      const states = {
        newJobs: false,
        newApplications: false,
        karmaEarned: false,
        profileIncomplete: false,
        friendInvites: false,
        achievements: false,
        campusUpdates: false
      };
      
      data?.forEach(notification => {
        switch (notification.type) {
          case 'new_job':
            states.newJobs = true;
            break;
          case 'new_application':
            states.newApplications = true;
            break;
          case 'karma_earned':
            states.karmaEarned = true;
            break;
          case 'profile_incomplete':
            states.profileIncomplete = true;
            break;
          case 'friend_invite':
            states.friendInvites = true;
            break;
          case 'achievement':
            states.achievements = true;
            break;
          case 'campus_update':
            states.campusUpdates = true;
            break;
        }
      });
      
      setNotificationStates(states);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadJobsData = async (userId: string) => {
    try {
      // Load new jobs (created in last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: newJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .gte('created_at', yesterday.toISOString());

      if (jobsError) throw jobsError;
      setNewJobsCount(newJobs?.length || 0);
      
      // Create notification for new jobs if there are any
      if (newJobs && newJobs.length > 0 && !notificationStates.newJobs) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'new_job',
            title: `${newJobs.length} neue Jobs verfügbar`,
            message: 'Entdecke neue Verdienstmöglichkeiten',
            data: { job_count: newJobs.length }
          });
        
        if (!notificationError) {
          setNotificationStates(prev => ({ ...prev, newJobs: true }));
        }
      }
      
      // Load user's active jobs
      const { data: activeJobs, error: activeError } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by', userId)
        .eq('status', 'active');

      if (activeError) throw activeError;
      setHasActiveJobs((activeJobs?.length || 0) > 0);
      
    } catch (error) {
      console.error('Error loading jobs data:', error);
    }
  };

  const loadApplicationsData = async (userId: string) => {
    try {
      // Load new applications for user's jobs
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner(created_by)
        `)
        .eq('jobs.created_by', userId)
        .eq('read', false);

      if (error) throw error;
      setNewApplicationsCount(applications?.length || 0);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const checkProfileCompleteness = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name,email')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      // Check if profile needs updates (missing name or default values)
      const needsUpdate = !profile?.full_name || 
                         profile.full_name === 'CleanWork' || 
                         profile.full_name.trim() === '';
      
      setProfileNeedsUpdate(needsUpdate);
      
      // Create notification if profile is incomplete
      if (needsUpdate && !notificationStates.profileIncomplete) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'profile_incomplete',
            title: 'Profil vervollständigen',
            message: 'Vervollständige dein Profil für bessere Job-Chancen',
            data: { action: 'complete_profile' }
          });
        
        if (!notificationError) {
          setNotificationStates(prev => ({ ...prev, profileIncomplete: true }));
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  // Real gamification triggers
  useEffect(() => {
    // Only show notifications based on real events
    if (user) {
      // Check for achievements based on real data
      checkForAchievements();
      
      // Set up periodic data refresh (every 60 seconds to avoid rate limits)
      const refreshTimer = setInterval(() => {
        loadUserData(user.id);
      }, 60000);

      return () => clearInterval(refreshTimer);
    }
  }, [user, completedJobsToday, karmaPoints, dailyStreak]);

  const checkForAchievements = () => {
    // Streak achievement
    if (dailyStreak > 0 && dailyStreak % 7 === 0) {
      // Create notification for streak achievement
      if (user && !notificationStates.achievements) {
        const insertNotification = async () => {
          const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'achievement',
            title: '🔥 Streak Milestone erreicht!',
            message: `${dailyStreak} Tage in Folge aktiv!`,
            data: { achievement_type: 'streak', streak_days: dailyStreak }
          });
          
          if (!error) {
            setNotificationStates(prev => ({ ...prev, achievements: true }));
          }
        };
        insertNotification();
      }
      
      addGameNotification({
        type: 'streak',
        title: '🔥 Streak Milestone!',
        message: `${dailyStreak} Tage in Folge aktiv!`,
        color: 'from-red-500 to-orange-500'
      });
    }
    
    // Karma milestones
    if (todayKarmaEarned >= 100) {
      // Create notification for karma milestone
      if (user && !notificationStates.karmaEarned) {
        const insertNotification = async () => {
          const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'karma_earned',
            title: '⭐ Karma Master!',
            message: `+${todayKarmaEarned} Karma heute verdient!`,
            data: { karma_earned: todayKarmaEarned }
          });
          
          if (!error) {
            setNotificationStates(prev => ({ ...prev, karmaEarned: true }));
          }
        };
        insertNotification();
      }
      
      addGameNotification({
        type: 'karma',
        title: '⭐ Karma Master!',
        message: `+${todayKarmaEarned} Karma heute verdient!`,
        color: 'from-purple-500 to-pink-500'
      });
    }
    
    // Job completion achievements
    if (completedJobsToday >= 3) {
      // Create notification for productivity achievement
      if (user && !notificationStates.achievements) {
        const insertNotification = async () => {
          const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'achievement',
            title: '🏆 Produktivitäts-Champion!',
            message: `${completedJobsToday} Jobs heute abgeschlossen!`,
            data: { achievement_type: 'productivity', jobs_completed: completedJobsToday }
          });
          
          if (!error) {
            setNotificationStates(prev => ({ ...prev, achievements: true }));
          }
        };
        insertNotification();
      }
      
      addGameNotification({
        type: 'achievement',
        title: '🏆 Produktivitäts-Champion!',
        message: `${completedJobsToday} Jobs heute abgeschlossen!`,
        color: 'from-yellow-500 to-orange-500'
      });
    }
  };

  const addGameNotification = (notification: any) => {
    const newNotification = { ...notification, id: Date.now() };
    setGameNotifications(prev => [...prev, newNotification]);
  };

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
      setKarmaPoints(data?.karma || 0);
      setDailyStreak(data?.login_streak || 0);
      
      // Calculate today's karma (mock calculation)
      const today = new Date().toDateString();
      const lastLogin = data?.last_login ? new Date(data.last_login).toDateString() : null;
      if (lastLogin === today) {
        setTodayKarmaEarned(25); // Mock: 25 karma earned today
      }
      
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

  // Enable authentication
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

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
            {/* Daily Streak Banner - Only show if user has a streak */}
            {dailyStreak > 0 && (
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
            )}

            {/* Welcome Back Section */}
            <div className="px-6 py-4">
              <div className={`${isDark ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} rounded-2xl p-6 border transition-all duration-500 hover:scale-[1.02] transform relative overflow-hidden`}>
                {/* Show notification dot only if there are real updates */}
                {(newApplicationsCount > 0 || completedJobsToday > 0) && (
                  <>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full"></div>
                  </>
                )}
                
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>Willkommen zurück!</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 transition-colors duration-500`}>Bereit für neue Herausforderungen?</p>
                
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center relative">
                      {index === 2 && todayKarmaEarned > 0 && ( // Only show if karma was earned today
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
                  className={`group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25 ${notificationStates.newJobs ? 'animate-pulse' : ''}`}
                >
                  {/* Notification badge - only show if there are new jobs */}
                  {notificationStates.newJobs && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                      {newJobsCount}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Euro className="w-8 h-8 mb-3 relative z-10" />
                  <div className="text-left relative z-10">
                    <div className="font-bold text-lg">Cash Jobs</div>
                    <div className="text-sm opacity-90">
                      {notificationStates.newJobs ? `${newJobsCount} neue Jobs!` : 'Verfügbare Jobs'}
                    </div>
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
                  className={`group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25 ${notificationStates.karmaEarned ? 'ring-2 ring-orange-300 animate-pulse' : ''}`}
                >
                  {/* Pulsing ring effect - only if karma was earned today */}
                  {notificationStates.karmaEarned && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-orange-300 animate-ping opacity-30"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Star className="w-8 h-8 mb-3 relative z-10" />
                  <div className="text-left relative z-10">
                    <div className="font-bold text-lg">Karma Jobs</div>
                    <div className="text-sm opacity-90">
                      {notificationStates.karmaEarned ? `+${todayKarmaEarned} heute verdient!` : 'Karma sammeln'}
                    </div>
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
                  className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}
                >
                  Alle anzeigen
                </button>
              </div>
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className={`${isDark ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer relative overflow-hidden ${index === 0 && completedJobsToday > 0 ? 'ring-2 ring-green-500/50 animate-pulse' : ''}`}>
                    {index === 0 && completedJobsToday > 0 && (
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
                        <p className={`text-sm font-medium ${index === 0 && completedJobsToday > 0 ? 'text-green-400 animate-pulse' : 'text-green-400'}`}>{activity.karma}</p>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:translate-x-1 transition-transform duration-300`} />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Achievement Teaser - Only show if close to achievement */}
              {completedJobsToday >= 1 && completedJobsToday < 3 && (
                <div className={`mt-6 ${isDark ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} rounded-2xl p-4 border relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="text-3xl animate-bounce">🏆</div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Nächster Erfolg: Produktivitäts-Champion
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                        Noch {3 - completedJobsToday} Jobs bis zum Erfolg!
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <div className="text-purple-500 font-bold">{completedJobsToday}/3</div>
                    </div>
                  </div>
                </div>
              )}
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
              {/* Profile update notification - only if profile needs update */}
              {notificationStates.profileIncomplete && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
              )}
              <User className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>
                {userProfile?.full_name || 'CleanWork'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>
                Karma: {karmaPoints} Punkte {todayKarmaEarned > 0 ? `(+${todayKarmaEarned} heute!)` : ''}
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
              className={`font-bold text-lg ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'} transition-all duration-300 hover:scale-110 cursor-pointer`}
            >
              €{totalEarnings}
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-full hover:bg-slate-700/50 transition-colors"
            >
              <Bell className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`} />
              {unreadNotifications > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                  {/* Additional notification ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-30"></div>
                </>
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

      {/* Game Notification System */}
      <GameNotificationSystem 
        notifications={gameNotifications}
        onRemove={removeGameNotification}
        isDark={isDark}
      />

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
                {/* Special notifications for specific tabs - only show if there's real data */}
                {item.id === 'jobs' && notificationStates.newJobs && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                )}
                {item.id === 'campus' && notificationStates.campusUpdates && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
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