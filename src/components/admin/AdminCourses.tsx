import React, { useState } from 'react';
import { 
  GraduationCap, Search, Plus, BookOpen, Star, 
  Edit, Trash2, Eye, Clock, Users
} from 'lucide-react';

interface AdminCoursesProps {
  isDark: boolean;
}

const AdminCourses: React.FC<AdminCoursesProps> = ({ isDark }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const categoryFilter = 'all';

  // Mock course data
  const courses = [
    {
      id: '1',
      title: 'React Grundlagen',
      description: 'Lerne die Basics von React',
      category: 'Entwicklung',
      lessons: 8,
      students: 1250,
      rating: 4.8,
      price: 49,
      status: 'active',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      title: 'UI/UX Design Prinzipien',
      description: 'Moderne Interface Designs',
      category: 'Design',
      lessons: 6,
      students: 890,
      rating: 4.5,
      price: 59,
      status: 'active',
      created_at: '2024-01-10'
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
              Kurs Verwaltung
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredCourses.length} Kurse verfügbar
            </p>
          </div>

          <div className="flex space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Kurse suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
              <span>Neuer Kurs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden hover:scale-105 transition-transform duration-300`}
          >
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {course.title}
                </h3>
                <span className="bg-green-500/20 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                  {course.status}
                </span>
              </div>
              
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                {course.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {course.lessons} Lektionen
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {course.students} Teilnehmer
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {course.rating}/5
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    €{course.price}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>Anzeigen</span>
                </button>
                <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourses;