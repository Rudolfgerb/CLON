import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Euro, Star, Briefcase, Users, TrendingUp, X, Send, User, Mail, FileText, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';

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
  status: 'pending' | 'accepted' | 'rejected';
  read?: boolean;
}

interface JobsPageProps {
  isDark: boolean;
  onShowNotifications?: () => void;
  user?: any;
}

const JobsPage: React.FC<JobsPageProps> = ({ isDark, onShowNotifications, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [unreadApplications, setUnreadApplications] = useState<Set<string>>(new Set(['1']));
  const [applicationData, setApplicationData] = useState<Omit<Application, 'job_id' | 'applicant_id' | 'status'>>({
    message: '',
    hourlyRate: '',
    estimatedHours: '',
    experience: '',
    portfolio: ''
  });
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState('');

  useEffect(() => {
    const handleJobFilter = (event: CustomEvent) => {
      const filter = event.detail;
      console.log('Received job filter event:', filter);
      setSelectedFilter(filter);
    };

    window.addEventListener('setJobFilter', handleJobFilter as EventListener);

    return () => {
      window.removeEventListener('setJobFilter', handleJobFilter as EventListener);
    };
  }, []);

  // Mock data for own created jobs
  const ownJobs = [
    {
      id: 1,
      title: 'React Login-Komponente erstellen',
      description: 'Benötige eine moderne Login-Komponente mit Validierung und schönem Design.',
      type: 'cash',
      payment: '€35/h',
      totalPayment: '€140',
      estimatedHours: 4,
      location: 'Remote',
      difficulty: 'Mittel',
      tags: ['React', 'TypeScript', 'CSS'],
      status: 'active',
      applicationsCount: 3,
      hasNewApplications: unreadApplications.has('1'),
      expiresAt: 'Heute 18:00',
      createdAt: 'Vor 2 Stunden'
    },
    {
      id: 2,
      title: 'Vue.js Dashboard erstellen',
      description: 'Einfaches Admin-Dashboard mit Vue.js und Tailwind CSS.',
      type: 'cash',
      payment: '€40/h',
      totalPayment: '€200',
      estimatedHours: 5,
      location: 'Remote',
      difficulty: 'Mittel',
      tags: ['Vue.js', 'Tailwind', 'JavaScript'],
      status: 'active',
      applicationsCount: 1,
      hasNewApplications: unreadApplications.has('2'),
      expiresAt: 'Morgen 14:00',
      createdAt: 'Gestern'
    }
  ];

  const jobCategories = [
    { id: 'all', label: 'Alle', count: 47 },
    { id: 'cash', label: 'Cash Jobs', count: 24 },
    { id: 'karma', label: 'Karma Jobs', count: 24 },
    { id: 'listings', label: 'Jobinserate', count: ownJobs.length, hasUnread: unreadApplications.size > 0 },
  ];

  const jobs: Job[] = [
    {
      id: 1,
      title: 'React Login-Komponente erstellen',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'cash',
      payment: '€35/h',
      karma: null,
      duration: '3-4 Stunden',
      difficulty: 'Mittel',
      tags: ['React', 'TypeScript', 'CSS'],
      urgent: true,
      description: 'Benötige eine moderne Login-Komponente mit Validierung und schönem Design.',
      totalPayment: '€140',
      expiresAt: 'Heute 18:00',
      requirements: 'React Erfahrung, TypeScript Kenntnisse',
      deliverables: 'Funktionsfähige Komponente + Code'
    },
    {
      id: 2,
      title: 'React Developer',
      company: 'TechStart GmbH',
      location: 'München',
      type: 'cash',
      payment: '€45/h',
      karma: null,
      duration: '2-3 Wochen',
      difficulty: 'Mittel',
      tags: ['React', 'TypeScript', 'Remote'],
      urgent: true,
    },
    {
      id: 3,
      title: 'UI/UX Design Review',
      company: 'Design Studio',
      location: 'Berlin',
      type: 'karma',
      payment: null,
      karma: '+150 Karma',
      duration: '1 Woche',
      difficulty: 'Einfach',
      tags: ['Design', 'Figma', 'Review'],
      urgent: false,
    },
    {
      id: 4,
      title: 'Python Backend API',
      company: 'DataCorp',
      location: 'Hamburg',
      type: 'cash',
      payment: '€50/h',
      karma: null,
      duration: '1 Monat',
      difficulty: 'Schwer',
      tags: ['Python', 'FastAPI', 'PostgreSQL'],
      urgent: false,
    },
    {
      id: 5,
      title: 'Code Review Session',
      company: 'Community',
      location: 'Online',
      type: 'karma',
      payment: null,
      karma: '+75 Karma',
      duration: '2 Stunden',
      difficulty: 'Mittel',
      tags: ['Code Review', 'Mentoring'],
      urgent: false,
    },
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || job.type === selectedFilter || selectedFilter === 'listings';
    return matchesSearch && matchesFilter;
  });

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    if (job.type === 'cash' && job.payment) {
      const rate = job.payment.replace('€', '').replace('/h', '');
      setApplicationData(prev => ({ ...prev, hourlyRate: rate }));
    }
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    setApplicationData({
      message: '',
      hourlyRate: '',
      estimatedHours: '',
      experience: '',
      portfolio: ''
    });
    setApplicationError('');
    setApplicationSuccess('');
  };

  const updateApplicationData = (field: keyof typeof applicationData, value: string) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationLoading(true);
    setApplicationError('');
    setApplicationSuccess('');

    try {
      if (!selectedJob) throw new Error('No job selected');
      if (!applicationData.message.trim()) throw new Error('Bewerbungsnachricht ist erforderlich');
      if (selectedJob.type === 'cash' && !applicationData.hourlyRate) {
        throw new Error('Stundensatz ist erforderlich');
      }

      // Create application payload
      const applicationPayload: Application = {
        job_id: selectedJob.id.toString(),
        applicant_id: user?.id || 'temp-user-id',
        message: applicationData.message.trim(),
        hourly_rate: selectedJob.type === 'cash' ? parseFloat(applicationData.hourlyRate) : null,
        estimated_hours: applicationData.estimatedHours ? parseInt(applicationData.estimatedHours) : null,
        experience: applicationData.experience.trim(),
        portfolio: applicationData.portfolio.trim(),
        status: 'pending',
        read: false // Mark as unread by default
      };

      // Insert application
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert(applicationPayload)
        .select()
        .single();

      if (applicationError) throw applicationError;
      if (!application) throw new Error('Application creation failed');

      // Create notification
      const notificationPayload = {
        user_id: selectedJob.created_by || 'temp-creator-id',
        type: 'new_application',
        title: 'Neue Bewerbung erhalten',
        message: `${applicationData.message.substring(0, 100)}...`,
        data: {
          job_id: selectedJob.id,
          job_title: selectedJob.title,
          application_id: application.id,
          applicant_name: user?.user_metadata?.full_name || 'Bewerber',
          hourly_rate: applicationData.hourlyRate
        }
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationPayload);

      if (notificationError) console.error('Notification error:', notificationError);

      setApplicationSuccess('Bewerbung erfolgreich gesendet!');
      setTimeout(closeApplicationModal, 2000);
    } catch (error: any) {
      console.error('Application error:', error);
      setApplicationError(error.message || 'Fehler beim Senden der Bewerbung');
    } finally {
      setApplicationLoading(false);
    }
  };

  // ... [rest of your JSX remains exactly the same]
  // The JSX portion of your code doesn't need changes as it's already well structured

  return (
    <>
      {/* Your existing JSX */}
      {/* This part remains exactly the same as in your original code */}
    </>
  );
};

export default JobsPage;