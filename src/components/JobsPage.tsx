import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, Euro, Star, Briefcase, Users, TrendingUp, X, Send, User, Mail, FileText, AlertCircle } from 'lucide-react';

interface JobsPageProps {
  isDark: boolean;
  onShowNotifications?: () => void;
}

const JobsPage: React.FC<JobsPageProps> = ({ isDark, onShowNotifications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [unreadApplications, setUnreadApplications] = useState<Set<string>>(new Set(['1'])); // Mock: Job 1 has unread applications
  const [applicationData, setApplicationData] = useState({
    message: '',
    hourlyRate: '',
    estimatedHours: '',
    experience: '',
    portfolio: ''
  });
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState('');

  // Listen for filter changes from dashboard
  useEffect(() => {
    const handleSetJobFilter = (event: CustomEvent) => {
      setSelectedFilter(event.detail);
    };

    window.addEventListener('setJobFilter', handleSetJobFilter as EventListener);
    
    return () => {
      window.removeEventListener('setJobFilter', handleSetJobFilter as EventListener);
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

  const jobs = [
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

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    // Pre-fill hourly rate if it's a cash job
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

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationLoading(true);
    setApplicationError('');

    try {
      // Validate required fields
      if (!applicationData.message.trim()) {
        throw new Error('Bewerbungsnachricht ist erforderlich');
      }
      if (selectedJob?.type === 'cash' && !applicationData.hourlyRate) {
        throw new Error('Stundensatz ist erforderlich');
      }

      // Create application in database
      const applicationPayload = {
        job_id: selectedJob.id,
        applicant_id: 'temp-user-id', // TODO: Replace with actual user ID
        message: applicationData.message.trim(),
        hourly_rate: selectedJob.type === 'cash' ? parseFloat(applicationData.hourlyRate) : null,
        estimated_hours: applicationData.estimatedHours ? parseInt(applicationData.estimatedHours) : null,
        experience: applicationData.experience.trim(),
        portfolio: applicationData.portfolio.trim(),
        status: 'pending'
      };

      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert(applicationPayload)
        .select()
        .single();

      if (applicationError) {
        throw applicationError;
      }

      // Create notification for job creator
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedJob.created_by || 'temp-creator-id', // TODO: Get from job
          type: 'new_application',
          title: 'Neue Bewerbung erhalten',
          message: `${applicationData.message.substring(0, 100)}...`,
          data: {
            job_id: selectedJob.id,
            job_title: selectedJob.title,
            application_id: application.id,
            applicant_name: 'Bewerber', // TODO: Get from user profile
            hourly_rate: applicationData.hourlyRate
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the application if notification fails
      }
      
      setApplicationSuccess('Bewerbung erfolgreich gesendet!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        closeApplicationModal();
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting application:', error);
      setApplicationError(error.message || 'Fehler beim Senden der Bewerbung');
    } finally {
      setApplicationLoading(false);
    }
  };

  const updateApplicationData = (field: string, value: string) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-32">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Jobs finden
        </h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Jobs durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 focus:scale-[1.02] ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-gray-400 focus:border-blue-500' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {jobCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedFilter(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                selectedFilter === category.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : isDark
                    ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${category.hasUnread ? 'animate-pulse ring-2 ring-orange-500/50' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <span>{category.label} ({category.count})</span>
                {category.hasUnread && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <Briefcase className="w-6 h-6 text-blue-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>48</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verfügbar</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <Users className="w-6 h-6 text-green-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>13</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Beworben</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <TrendingUp className="w-6 h-6 text-purple-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>87%</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Erfolgsrate</div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-6 grid grid-cols-2 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => handleJobClick(job)}
            className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer relative overflow-hidden ${
              job.id === 1 ? 'ring-2 ring-green-500/30 shadow-green-500/20' : ''
            }`}
          >
            {job.urgent && (
              <div className="absolute top-3 right-3">
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium animate-pulse">
                  Dringend
                </span>
              </div>
            )}

            {/* New Cash Job Badge */}
            {job.id === 1 && (
              <div className="absolute top-3 left-3">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                  Neu erstellt
                </span>
              </div>
            )}

            <div className="mb-3">
              <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                {job.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                {job.company}
              </p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MapPin className="w-3 h-3 mr-1" />
                  {job.location}
                </div>
                <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {job.duration}
                </div>
                {job.expiresAt && (
                  <div className={`flex items-center text-red-400 text-xs`}>
                    <Clock className="w-3 h-3 mr-1" />
                    Läuft ab: {job.expiresAt}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                {job.type === 'cash' ? (
                  <div className="flex items-center bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                    <Euro className="w-3 h-3 mr-1" />
                    {job.payment}
                  </div>
                ) : (
                  <div className="flex items-center bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3 mr-1" />
                    {job.karma}
                  </div>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  job.difficulty === 'Einfach' 
                    ? 'bg-green-500/20 text-green-400'
                    : job.difficulty === 'Mittel'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {job.difficulty}
                </span>
              </div>
            </div>

            {/* Additional info for cash jobs */}
            {job.type === 'cash' && job.totalPayment && (
              <div className="mb-2">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Gesamtbetrag: <span className="text-green-400 font-medium">{job.totalPayment}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {job.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`text-xs px-1.5 py-0.5 rounded-md ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        ))}
      </div>
    </div>

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl p-6 w-full max-w-2xl border shadow-2xl max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Auf Job bewerben
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedJob.title} • {selectedJob.company}
                </p>
              </div>
              <button
                onClick={closeApplicationModal}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>

            {/* Job Summary */}
            <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-4 border mb-6`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedJob.title}
                </h3>
                {selectedJob.type === 'cash' ? (
                  <div className="flex items-center bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    <Euro className="w-4 h-4 mr-1" />
                    {selectedJob.payment}
                  </div>
                ) : (
                  <div className="flex items-center bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 mr-1" />
                    {selectedJob.karma}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedJob.location}
                </div>
                <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedJob.duration}
                </div>
              </div>

              {selectedJob.totalPayment && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Gesamtbetrag:
                    </span>
                    <span className="text-xl font-bold text-green-500">
                      {selectedJob.totalPayment}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Application Form */}
            <form onSubmit={handleApplicationSubmit} className="space-y-6">
              {/* Personal Message */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bewerbungsnachricht <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className={`absolute left-4 top-4 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <textarea
                    rows={4}
                    value={applicationData.message}
                    onChange={(e) => updateApplicationData('message', e.target.value)}
                    placeholder="Warum sind Sie der richtige Kandidat für diesen Job?"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    required
                  />
                </div>
              </div>

              {/* Cash Job Specific Fields */}
              {selectedJob.type === 'cash' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ihr Stundensatz (€) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Euro className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="number"
                        min="1"
                        step="0.50"
                        value={applicationData.hourlyRate}
                        onChange={(e) => updateApplicationData('hourlyRate', e.target.value)}
                        placeholder="35.00"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Geschätzte Stunden
                    </label>
                    <div className="relative">
                      <Clock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={applicationData.estimatedHours}
                        onChange={(e) => updateApplicationData('estimatedHours', e.target.value)}
                        placeholder="4"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Relevante Erfahrung
                </label>
                <div className="relative">
                  <User className={`absolute left-4 top-4 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <textarea
                    rows={3}
                    value={applicationData.experience}
                    onChange={(e) => updateApplicationData('experience', e.target.value)}
                    placeholder="Beschreiben Sie Ihre Erfahrung mit den benötigten Skills..."
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  />
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Portfolio/Links
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="url"
                    value={applicationData.portfolio}
                    onChange={(e) => updateApplicationData('portfolio', e.target.value)}
                    placeholder="https://github.com/username oder Portfolio-Link"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {applicationError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{applicationError}</p>
                </div>
              )}

              {applicationSuccess && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-green-200 text-sm">{applicationSuccess}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={closeApplicationModal}
                  className={`flex-1 px-6 py-4 rounded-xl border font-semibold transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={applicationLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{applicationLoading ? 'Wird gesendet...' : 'Bewerbung senden'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default JobsPage;