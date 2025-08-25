import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Euro, Star, Briefcase, Users, TrendingUp, X, Send, User, Mail, FileText, AlertCircle, Calendar, Tag, ChevronRight, Heart, Bookmark, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CreateCashJobPage from './CreateCashJobPage';
import CreateKarmaJobPage from './CreateKarmaJobPage';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  job_type: 'cash' | 'karma';
  hourly_rate: number | null;
  estimated_hours: number | null;
  fixed_amount: number | null;
  total_payment: number | null;
  karma_reward: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  requirements: string | null;
  deliverables: string | null;
  status: string;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface JobsPageProps {
  isDark: boolean;
  user: any;
}

const JobsPage: React.FC<JobsPageProps> = ({ isDark, user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cash' | 'karma'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showCreateCashJob, setShowCreateCashJob] = useState(false);
  const [showCreateKarmaJob, setShowCreateKarmaJob] = useState(false);
  
  // Application form state
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

  const categories = [
    { id: 'all', label: 'Alle Kategorien', icon: '🔍' },
    { id: 'development', label: 'Entwicklung', icon: '💻' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'writing', label: 'Texte', icon: '✍️' },
    { id: 'marketing', label: 'Marketing', icon: '📈' },
    { id: 'data', label: 'Daten', icon: '📊' },
    { id: 'other', label: 'Sonstiges', icon: '🔧' }
  ];

  const difficulties = [
    { id: 'all', label: 'Alle Schwierigkeiten' },
    { id: 'easy', label: 'Einfach', color: 'text-green-500', bg: 'bg-green-500/20' },
    { id: 'medium', label: 'Mittel', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    { id: 'hard', label: 'Schwer', color: 'text-red-500', bg: 'bg-red-500/20' }
  ];

  // Listen for filter events from other components
  useEffect(() => {
    const handleSetJobFilter = (event: CustomEvent) => {
      setSelectedFilter(event.detail);
    };

    window.addEventListener('setJobFilter', handleSetJobFilter as EventListener);
    return () => {
      window.removeEventListener('setJobFilter', handleSetJobFilter as EventListener);
    };
  }, []);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedFilter, selectedCategory, selectedDifficulty]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // Load jobs - this will work for both authenticated and anonymous users
      // RLS policies will automatically filter based on user permissions
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!jobs_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(job => job.job_type === selectedFilter);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(job => job.difficulty === selectedDifficulty);
    }

    setFilteredJobs(filtered);
  };

  const formatPayment = (job: Job) => {
    if (job.job_type === 'cash') {
      if (job.fixed_amount) {
        return `€${job.fixed_amount}`;
      } else if (job.hourly_rate && job.estimated_hours) {
        return `€${job.hourly_rate}/h × ${job.estimated_hours}h = €${job.total_payment}`;
      } else if (job.hourly_rate) {
        return `€${job.hourly_rate}/h`;
      }
    } else {
      return `${job.karma_reward || 0} Karma`;
    }
    return 'Nicht angegeben';
  };

  const getDifficultyStyle = (difficulty: string) => {
    const diff = difficulties.find(d => d.id === difficulty);
    return diff ? { color: diff.color, bg: diff.bg } : { color: 'text-gray-500', bg: 'bg-gray-500/20' };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std`;
    return `vor ${Math.floor(diffInMinutes / 1440)} Tagen`;
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  const openApplicationModal = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    setApplicationData({
      message: '',
      hourlyRate: job.hourly_rate?.toString() || '',
      estimatedHours: job.estimated_hours?.toString() || '',
      experience: '',
      portfolio: ''
    });
    setApplicationError('');
    setApplicationSuccess('');
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
    setApplicationSuccess('');

    if (!selectedJob) {
      setApplicationError('Kein Job ausgewählt');
      setApplicationLoading(false);
      return;
    }

    try {
      // Check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('Sie müssen angemeldet sein, um sich zu bewerben');
      }

      // Check if user can apply to this job
      const { data: canApply, error: checkError } = await supabase
        .rpc('can_apply_to_job', { job_id: selectedJob.id });

      if (checkError) throw checkError;
      if (!canApply) {
        throw new Error('Sie können sich nicht auf diesen Job bewerben');
      }

      // Validate required fields
      if (!applicationData.message.trim()) {
        throw new Error('Bewerbungsnachricht ist erforderlich');
      }

      // Prepare application data
      const applicationPayload = {
        job_id: selectedJob.id,
        applicant_id: currentUser.id,
        message: applicationData.message.trim(),
        hourly_rate: selectedJob.job_type === 'cash' && applicationData.hourlyRate 
          ? parseFloat(applicationData.hourlyRate) 
          : null,
        estimated_hours: applicationData.estimatedHours 
          ? parseInt(applicationData.estimatedHours) 
          : null,
        experience: applicationData.experience.trim(),
        portfolio: applicationData.portfolio.trim(),
        status: 'pending'
      };

      // Insert application
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert(applicationPayload)
        .select()
        .single();

      if (applicationError) throw applicationError;
      if (!application) throw new Error('Application creation failed');

      setApplicationSuccess('Bewerbung erfolgreich gesendet!');
      setTimeout(closeApplicationModal, 2000);
    } catch (error: any) {
      console.error('Application submission error:', error);
      setApplicationError(error.message || 'Fehler beim Senden der Bewerbung');
    } finally {
      setApplicationLoading(false);
    }
  };

  const openCreateJobModal = () => {
    setShowCreateJobModal(true);
  };

  const closeCreateJobModal = () => {
    setShowCreateJobModal(false);
  };

  const openCreateCashJob = () => {
    setShowCreateJobModal(false);
    setShowCreateCashJob(true);
  };

  const openCreateKarmaJob = () => {
    setShowCreateJobModal(false);
    setShowCreateKarmaJob(true);
  };

  const closeCreateCashJob = () => {
    setShowCreateCashJob(false);
    loadJobs(); // Refresh jobs after creation
  };

  const closeCreateKarmaJob = () => {
    setShowCreateKarmaJob(false);
    loadJobs(); // Refresh jobs after creation
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Lädt Jobs...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-md border shadow-2xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Job erstellen
                </h2>
                <button
                  onClick={closeCreateJobModal}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                </button>
              </div>

              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 text-center`}>
                Wähle den Typ deines Jobs aus
              </p>

              <div className="space-y-4">
                {/* Cash Job Option */}
                <button 
                  onClick={openCreateCashJob}
                  className="group w-full relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Euro className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">€€€</div>
                        <div className="text-xs opacity-90">Geld verdienen</div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Cash Job</h3>
                    <p className="text-sm opacity-90 mb-3">
                      Erstelle einen bezahlten Job und verdiene echtes Geld
                    </p>
                    <div className="flex items-center space-x-3 text-xs opacity-80">
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></div>
                        Sofortige Bezahlung
                      </div>
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></div>
                        Professionell
                      </div>
                    </div>
                  </div>
                </button>

                {/* Karma Job Option */}
                <button 
                  onClick={openCreateKarmaJob}
                  className="group w-full relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">⭐⭐⭐</div>
                        <div className="text-xs opacity-90">Karma sammeln</div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Karma Job</h3>
                    <p className="text-sm opacity-90 mb-3">
                      Sammle Karma-Punkte und baue deine Reputation auf
                    </p>
                    <div className="flex items-center space-x-3 text-xs opacity-80">
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></div>
                        Community Hilfe
                      </div>
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></div>
                        Skill Building
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Info Section */}
              <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border mt-6`}>
                <h4 className={`font-semibold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Was ist der Unterschied?
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Euro className="w-2 h-2 text-green-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Cash Jobs</p>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Bezahlte Projekte für sofortiges Einkommen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-purple-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="w-2 h-2 text-purple-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Karma Jobs</p>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Community-Aufgaben zum Lernen und Reputation aufbauen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Cash Job Page */}
      {showCreateCashJob && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
          <CreateCashJobPage 
            isDark={isDark} 
            onBack={closeCreateCashJob} 
            user={user} 
          />
        </div>
      )}

      {/* Create Karma Job Page */}
      {showCreateKarmaJob && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
          <CreateKarmaJobPage 
            isDark={isDark} 
            onBack={closeCreateKarmaJob} 
            user={user} 
          />
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && !showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl`}>
            <div className="sticky top-0 bg-inherit rounded-t-3xl p-6 border-b border-inherit">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    selectedJob.job_type === 'cash' 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : 'bg-gradient-to-br from-purple-500 to-purple-600'
                  }`}>
                    {selectedJob.job_type === 'cash' ? (
                      <Euro className="w-6 h-6 text-white" />
                    ) : (
                      <Star className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.title}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatPayment(selectedJob)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeJobDetails}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <MapPin className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedJob.location}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedJob.estimated_hours ? `${selectedJob.estimated_hours}h` : 'Flexibel'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                    {categories.find(c => c.id === selectedJob.category)?.label || selectedJob.category}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyStyle(selectedJob.difficulty).bg} ${getDifficultyStyle(selectedJob.difficulty).color}`}>
                    {difficulties.find(d => d.id === selectedJob.difficulty)?.label || selectedJob.difficulty}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Beschreibung
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {selectedJob.description}
                </p>
              </div>

              {/* Tags */}
              {selectedJob.tags && selectedJob.tags.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Benötigte Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isDark 
                            ? 'bg-slate-700 text-slate-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Anforderungen
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {selectedJob.requirements}
                  </p>
                </div>
              )}

              {/* Deliverables */}
              {selectedJob.deliverables && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Erwartete Ergebnisse
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {selectedJob.deliverables}
                  </p>
                </div>
              )}

              {/* Expiration */}
              {selectedJob.expires_at && (
                <div className={`${isDark ? 'bg-orange-900/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'} rounded-xl p-4 border`}>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Job läuft ab
                      </p>
                      <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                        {new Date(selectedJob.expires_at).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <button
                onClick={() => openApplicationModal(selectedJob)}
                className={`w-full py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg flex items-center justify-center space-x-2 ${
                  selectedJob.job_type === 'cash'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>Jetzt bewerben</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl`}>
            <div className="sticky top-0 bg-inherit rounded-t-3xl p-6 border-b border-inherit">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Bewerbung senden
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedJob.title}
                  </p>
                </div>
                <button
                  onClick={closeApplicationModal}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                </button>
              </div>
            </div>

            <form onSubmit={handleApplicationSubmit} className="p-6 space-y-6">
              {/* Message */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bewerbungsnachricht <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className={`absolute left-4 top-4 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <textarea
                    rows={4}
                    value={applicationData.message}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, message: e.target.value }))}
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

              {/* Cash job specific fields */}
              {selectedJob.job_type === 'cash' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ihr Stundensatz (€)
                    </label>
                    <div className="relative">
                      <Euro className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="number"
                        min="1"
                        step="0.50"
                        value={applicationData.hourlyRate}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                        placeholder="25.00"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
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
                        value={applicationData.estimatedHours}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                        placeholder="8"
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
                    onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="Beschreiben Sie Ihre relevante Erfahrung für diesen Job..."
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
                  Portfolio/Website (optional)
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="url"
                    value={applicationData.portfolio}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, portfolio: e.target.value }))}
                    placeholder="https://ihr-portfolio.com"
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
              <button
                type="submit"
                disabled={applicationLoading}
                className={`w-full py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                  selectedJob.job_type === 'cash'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>{applicationLoading ? 'Wird gesendet...' : 'Bewerbung senden'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Jobs
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredJobs.length} verfügbare Jobs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openCreateJobModal}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-500/30 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Job erstellen</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <Filter className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Jobs durchsuchen..."
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-colors ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : isDark
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alle Jobs
            </button>
            <button
              onClick={() => setSelectedFilter('cash')}
              className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center space-x-2 ${
                selectedFilter === 'cash'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                  : isDark
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Euro className="w-4 h-4" />
              <span>Cash Jobs</span>
            </button>
            <button
              onClick={() => setSelectedFilter('karma')}
              className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center space-x-2 ${
                selectedFilter === 'karma'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : isDark
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Karma Jobs</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Filter
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Kategorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Schwierigkeit
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    {difficulties.map(diff => (
                      <option key={diff.id} value={diff.id}>
                        {diff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border text-center`}>
                <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Keine Jobs gefunden
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  Versuchen Sie andere Suchbegriffe oder Filter
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => openJobDetails(job)}
                  className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:shadow-lg group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        job.job_type === 'cash' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        {job.job_type === 'cash' ? (
                          <Euro className="w-6 h-6 text-white" />
                        ) : (
                          <Star className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'} mb-1 group-hover:text-blue-500 transition-colors`}>
                          {job.title}
                        </h3>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>
                          {job.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm mb-3">
                          <div className="flex items-center text-green-500">
                            {job.job_type === 'cash' ? (
                              <Euro className="w-4 h-4 mr-1" />
                            ) : (
                              <Star className="w-4 h-4 mr-1" />
                            )}
                            {formatPayment(job)}
                          </div>
                          <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="w-4 h-4 mr-1" />
                            {job.estimated_hours ? `${job.estimated_hours}h` : 'Flexibel'}
                          </div>
                        </div>

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  isDark 
                                    ? 'bg-slate-700 text-slate-300' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                            {job.tags.length > 3 && (
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                +{job.tags.length - 3} mehr
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(job.difficulty).bg} ${getDifficultyStyle(job.difficulty).color}`}>
                        {difficulties.find(d => d.id === job.difficulty)?.label || job.difficulty}
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTimeAgo(job.created_at)}
                      </span>
                      <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:translate-x-1 transition-transform duration-300`} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobsPage;