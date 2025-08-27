import { supabase } from './supabase';

export interface NotificationTemplate {
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'normal' | 'high';
  data?: Record<string, any>;
}

export class NotificationService {
  // Send notification via edge function
  static async send(recipientId: string, eventType: string, data: Record<string, any> = {}) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notification-service`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: eventType,
            recipient_id: recipientId,
            data
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Notification failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  // Notification templates for different events
  static getNotificationTemplate(eventType: string, data: any): NotificationTemplate {
    const templates: Record<string, NotificationTemplate> = {
      APPLICATION_RECEIVED: {
        title: 'Neue Bewerbung',
        message: `${data.applicant_name} hat sich für "${data.job_title}" beworben`,
        type: 'application_received',
        priority: 'high'
      },
      APPLICATION_ACCEPTED: {
        title: 'Bewerbung angenommen!',
        message: `Ihre Bewerbung für "${data.job_title}" wurde angenommen`,
        type: 'application_accepted',
        priority: 'high'
      },
      APPLICATION_REJECTED: {
        title: 'Bewerbung abgelehnt',
        message: `Ihre Bewerbung für "${data.job_title}" wurde leider abgelehnt`,
        type: 'application_rejected',
        priority: 'normal'
      },
      JOB_COMPLETED: {
        title: 'Job abgeschlossen',
        message: `Der Job "${data.job_title}" wurde erfolgreich abgeschlossen`,
        type: 'job_completed',
        priority: 'high'
      },
      PAYMENT_RECEIVED: {
        title: 'Zahlung erhalten',
        message: `€${data.amount} wurde Ihrem Konto gutgeschrieben`,
        type: 'payment_received',
        priority: 'high'
      },
      KARMA_EARNED: {
        title: 'Karma Punkte erhalten',
        message: `Sie haben ${data.karma_amount} Karma Punkte verdient!`,
        type: 'karma_earned',
        priority: 'low'
      }
    };

    return templates[eventType] || {
      title: 'Neue Benachrichtigung',
      message: 'Sie haben eine neue Benachrichtigung erhalten',
      type: 'general',
      priority: 'normal'
    };
  }
}