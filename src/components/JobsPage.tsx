import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, Euro, Star, Briefcase, Users, TrendingUp } from 'lucide-react';

interface JobsPageProps {
  isDark: boolean;
}

const JobsPage: React.FC<JobsPageProps> = ({ isDark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const jobCategories = [
    { id: 'all', label: 'Alle', count: 47 },
    { id: 'cash', label: 'Cash Jobs', count: 24 },
    { id: 'karma', label: 'Karma Jobs', count: 24 },
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
    const matchesFilter = selectedFilter === 'all' || job.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
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
              }`}
            >
              {category.label} ({category.count})
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
  );
};

export default JobsPage;