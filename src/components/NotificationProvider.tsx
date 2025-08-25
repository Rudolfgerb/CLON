import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Notification } from '../lib/supabase';

interface NotificationFlags {
  newJobs: boolean;
  newApplications: boolean;
  karmaEarned: boolean;
  profileIncomplete: boolean;
  friendInvites: boolean;
  achievements: boolean;
  campusUpdates: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  notificationStates: NotificationFlags;
  setNotificationStates: React.Dispatch<React.SetStateAction<NotificationFlags>>;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const defaultFlags: NotificationFlags = {
  newJobs: false,
  newApplications: false,
  karmaEarned: false,
  profileIncomplete: false,
  friendInvites: false,
  achievements: false,
  campusUpdates: false
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationStates, setNotificationStates] = useState<NotificationFlags>(defaultFlags);

  const refresh = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }
    setNotifications(data || []);
    const flags = { ...defaultFlags };
    data?.forEach(n => {
      switch (n.type) {
        case 'new_job':
          flags.newJobs = true;
          break;
        case 'new_application':
          flags.newApplications = true;
          break;
        case 'karma_earned':
          flags.karmaEarned = true;
          break;
        case 'profile_incomplete':
          flags.profileIncomplete = true;
          break;
        case 'friend_invite':
          flags.friendInvites = true;
          break;
        case 'achievement':
          flags.achievements = true;
          break;
        case 'campus_update':
          flags.campusUpdates = true;
          break;
      }
    });
    setNotificationStates(flags);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    fetchUser();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    refresh();
    if (!userId) return;
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, notificationStates, setNotificationStates, refresh, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

