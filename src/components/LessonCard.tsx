import React from 'react';
import { Share2, Star } from 'lucide-react';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    difficulty_level: string;
    estimated_duration: number;
    completions: number;
    avg_rating: number;
  };
  isDark: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, isDark }) => {
  const shareLesson = () => {
    const url = `${window.location.origin}/lessons/${lesson.id}`;
    if (navigator.share) {
      navigator.share({ title: lesson.title, url }).catch(() => {});
    } else {
      const text = encodeURIComponent(lesson.title);
      const shareUrl = encodeURIComponent(url);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
    }
  };

  return (
    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</h3>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{lesson.description}</p>
      <div className="flex items-center space-x-4 text-sm mb-3">
        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{lesson.difficulty_level}</span>
        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{lesson.estimated_duration} Min.</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-4">
        <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {lesson.completions} Nutzer haben diese Lektion abgeschlossen
        </span>
        <span className="flex items-center text-yellow-500">
          <Star className="w-4 h-4 mr-1" />
          {lesson.avg_rating ? lesson.avg_rating.toFixed(1) : '0.0'}
        </span>
      </div>
      <button
        onClick={shareLesson}
        className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
      >
        <Share2 className="w-4 h-4" />
        <span>Teilen</span>
      </button>
    </div>
  );
};

export default LessonCard;
