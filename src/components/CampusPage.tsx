import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Star, Clock, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  thumbnail: string;
  color: string;
  karma_reward: number;
  lessons_count: number;
  completed_count: number;
}

interface CampusPageProps {
  isDark: boolean;
}

const CampusPage: React.FC<CampusPageProps> = ({ isDark }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Alle Kurse', icon: '📚' },
    { id: 'development', label: 'Entwicklung', icon: '💻' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'marketing', label: 'Marketing', icon: '📈' }
  ];

  // Mock courses data
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'React Grundlagen',
      description: 'Lerne die Basics von React und erstelle deine erste App',
      category: 'development',
      difficulty: 'Anfänger',
      thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-blue-500 to-blue-600',
      karma_reward: 150,
      lessons_count: 8,
      completed_count: 1250
    },
    {
      id: '2',
      title: 'UI/UX Design Prinzipien',
      description: 'Grundlagen des modernen Interface Designs',
      category: 'design',
      difficulty: 'Anfänger',
      thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-purple-500 to-purple-600',
      karma_reward: 120,
      lessons_count: 6,
      completed_count: 890
    },
    {
      id: '3',
      title: 'TypeScript Masterclass',
      description: 'Erweiterte TypeScript Konzepte für Profis',
      category: 'development',
      difficulty: 'Fortgeschritten',
      thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-indigo-500 to-indigo-600',
      karma_reward: 200,
      lessons_count: 12,
      completed_count: 567
    },
    {
      id: '4',
      title: 'Digital Marketing Basics',
      description: 'Grundlagen des digitalen Marketings',
      category: 'marketing',
      difficulty: 'Anfänger',
      thumbnail: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-green-500 to-green-600',
      karma_reward: 100,
      lessons_count: 5,
      completed_count: 723
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCourses = courses.filter(course => 
    selectedCategory === 'all' || course.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'anfänger': return 'text-green-500 bg-green-500/20';
      case 'fortgeschritten': return 'text-yellow-500 bg-yellow-500/20';
      case 'experte': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Lädt Kurse...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Campus</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Lerne neue Skills und sammle Karma
          </p>
        </div>

        {/* Stats */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">5</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Abgeschlossen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">3</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>In Bearbeitung</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">750</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Karma verdient</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : isDark
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
            >
              <div className="flex">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-24 h-24 object-cover"
                />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {course.title}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </div>
                  </div>
                  
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-purple-500">
                        <Star className="w-4 h-4 mr-1" />
                        {course.karma_reward} Karma
                      </div>
                      <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.lessons_count} Lektionen
                      </div>
                      <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {course.completed_count}
                      </div>
                    </div>
                    
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Starten</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusPage;