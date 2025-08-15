import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Euro, Star, Briefcase, Users, TrendingUp, X, Send, User, Mail, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Fixed import path

// Updated interfaces with proper types
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'cash' | 'karma';
  payment: string | null;
  karma: string | null;
  duration: string;
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  tags: string[];
  urgent: boolean;
  description?: string;
  totalPayment?: string;
  expiresAt?: string;
  requirements?: string;
  deliverables?: string;
  created_by?: string;
}

interface Application {
  id?: string;
  job_id: string;
  applicant_id: string;
  message: string;
  hourly_rate: number | null;
  estimated_hours: number | null;
  experience: string;
  portfolio: string;
  status: 'pending' | 'accepted' | 'rejected'; // Fixed typo
  read?: boolean; // Optional until column exists
}

// ... [rest of your props interface remains the same]

const JobsPage: React.FC<JobsPageProps> = ({ isDark, onShowNotifications, user }) => {
  // ... [your existing state declarations remain the same]

  // Fixed application submission handler
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationLoading(true);
    setApplicationError('');
    setApplicationSuccess('');

    if (!selectedJob || !user?.id) {
      setApplicationError('Invalid job or user data');
      setApplicationLoading(false);
      return;
    }

    try {
      // Validate required fields
      if (!applicationData.message.trim()) {
        throw new Error('Bewerbungsnachricht ist erforderlich');
      }

      // Prepare application data
      const applicationPayload: Application = {
        job_id: selectedJob.id.toString(),
        applicant_id: user.id,
        message: applicationData.message.trim(),
        hourly_rate: selectedJob.type === 'cash' && applicationData.hourlyRate 
          ? parseFloat(applicationData.hourlyRate) 
          : null,
        estimated_hours: applicationData.estimatedHours 
          ? parseInt(applicationData.estimatedHours) 
          : null,
        experience: applicationData.experience.trim(),
        portfolio: applicationData.portfolio.trim(),
        status: 'pending'
        // read: false - Only include after adding column
      };

      // Insert application with proper typing
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert(applicationPayload)
        .select()
        .single();

      if (applicationError) throw applicationError;
      if (!application) throw new Error('Application creation failed');

      // Create notification
      const notificationPayload = {
        user_id: selectedJob.created_by || '',
        type: 'new_application',
        title: 'Neue Bewerbung erhalten',
        message: `${applicationData.message.substring(0, 100)}...`,
        data: {
          job_id: selectedJob.id,
          job_title: selectedJob.title,
          application_id: application.id,
          applicant_name: user?.user_metadata?.full_name || 'Bewerber',
          hourly_rate: applicationData.hourlyRate
        },
        read: false
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationPayload);

      if (notificationError) {
        console.error('Notification creation failed:', notificationError);
      }

      setApplicationSuccess('Bewerbung erfolgreich gesendet!');
      setTimeout(closeApplicationModal, 2000);
    } catch (error: any) {
      console.error('Application submission error:', error);
      setApplicationError(error.message || 'Fehler beim Senden der Bewerbung');
    } finally {
      setApplicationLoading(false);
    }
  };

  // ... [rest of your component code remains the same]

  return (
    <>
      {/* Your existing JSX */}
    </>
  );
};

export default JobsPage;