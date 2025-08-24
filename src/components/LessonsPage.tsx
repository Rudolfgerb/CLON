import React, { useEffect, useState } from 'react';
import LessonCard from './LessonCard';

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration: number;
  completions: number;
  avg_rating: number;
}

const LessonsPage: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((err) => console.error('Failed to load lessons', err));
  }, []);

  return (
    <div className={`flex-1 overflow-y-auto pb-32 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="px-6 py-6 space-y-4">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} isDark={isDark} />
        ))}
      </div>
    </div>
  );
};

export default LessonsPage;
