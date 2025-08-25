import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Play, CheckCircle, Clock, Star, Trophy, Target, Zap, Plus, Upload, Code, X, Save, Image, AlertCircle, MessageCircle, Send } from 'lucide-react';

interface CampusPageProps {
  isDark: boolean;
}

interface LessonViewer {
  courseId: number;
  lessonIndex: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  hasMedia: boolean;
  hasCode: boolean;
  codeContent?: string;
  mediaFiles?: File[];
}

const CampusPage: React.FC<CampusPageProps> = ({ isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [viewingLesson, setViewingLesson] = useState<LessonViewer | null>(null);
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});
  const [userKarma, setUserKarma] = useState(1247);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson>({
    id: '',
    title: '',
    description: '',
    hasMedia: false,
    hasCode: false,
    codeContent: '',
    mediaFiles: []
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showCreateBubble, setShowCreateBubble] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [bubbleForm, setBubbleForm] = useState({ title: '', category: 'help', description: '' });
  const [onlineUsers] = useState(42);

  // Mock data for bubbles
  const bubbles = [
    {
      id: 1,
      title: "React Hooks Hilfe gesucht",
      category: "help",
      createdBy: "Anna Schmidt",
      participants: [
        { name: "Anna Schmidt", color: "#3B82F6" },
        { name: "Tom Weber", color: "#10B981" },
        { name: "Lisa Müller", color: "#F59E0B" },
        { name: "Du", color: "#8B5CF6" }
      ],
      lastActivity: "vor 2 Min",
      hasNewMessages: true,
      creatorOnline: true
    },
    {
      id: 2,
      title: "JavaScript Best Practices",
      category: "discussion",
      createdBy: "Tom Weber",
      participants: [
        { name: "Tom Weber", color: "#10B981" },
        { name: "Max Mustermann", color: "#EF4444" },
        { name: "Sarah Klein", color: "#F59E0B" },
        { name: "Du", color: "#8B5CF6" }
      ],
      lastActivity: "vor 5 Min",
      hasNewMessages: false,
      creatorOnline: false
    },
    {
      id: 3,
      title: "Gemeinsames Todo-App Projekt",
      category: "project",
      createdBy: "Du",
      participants: [
        { name: "Du", color: "#8B5CF6" },
        { name: "Lisa Müller", color: "#F59E0B" },
        { name: "Peter Schmidt", color: "#3B82F6" }
      ],
      lastActivity: "vor 8 Min",
      hasNewMessages: true,
      creatorOnline: true
    }
  ];

  // Mock chat messages
  const chatMessages = [
    {
      id: 1,
      sender: "Anna Schmidt",
      text: "Hey! Kann mir jemand mit useEffect helfen? Ich verstehe nicht, warum mein Effect in einer Endlosschleife läuft.",
      time: "14:32"
    },
    {
      id: 2,
      sender: "Du",
      text: "Hi Anna! Das passiert oft, wenn du vergisst, ein Dependency Array anzugeben. Kannst du deinen Code zeigen?",
      time: "14:33"
    },
    {
      id: 3,
      sender: "Tom Weber",
      text: "Genau! Ohne Dependency Array läuft useEffect nach jedem Render. Füge [] hinzu für einmaliges Ausführen.",
      time: "14:34"
    },
    {
      id: 4,
      sender: "Anna Schmidt",
      text: "Ah verstehe! Danke euch beiden. Das hat geholfen! 🙏",
      time: "14:35"
    }
  ];

  const handleCreateBubble = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally create the bubble in the database
    console.log('Creating bubble:', bubbleForm);
    setShowCreateBubble(false);
    setBubbleForm({ title: '', category: 'help', description: '' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Here you would normally send the message to the database
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const handleBubblePop = (bubbleId: number) => {
    console.log('Popping bubble:', bubbleId);
    setSelectedBubble(null);
  };

  const handleLeaveBubble = (bubbleId: number) => {
    console.log('Leaving bubble:', bubbleId);
    setSelectedBubble(null);
  };

  const categories = [
    { id: 'all', label: 'Alle Kurse', icon: BookOpen },
    { id: 'frontend', label: 'Frontend', icon: Zap },
    { id: 'backend', label: 'Backend', icon: Target },
    { id: 'design', label: 'Design', icon: Star },
  ];

  const addNewLesson = () => {
    setLessons([...lessons, { ...currentLesson, id: Date.now().toString() }]);
    setCurrentLesson({
      id: '',
      title: '',
      description: '',
      hasMedia: false,
      hasCode: false,
      codeContent: '',
      mediaFiles: []
    });
  };

  const addAnotherLessonField = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: '',
      description: '',
      hasMedia: false,
      hasCode: false,
      codeContent: '',
      mediaFiles: []
    };
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = (id: string, field: keyof Lesson, value: any) => {
    setLessons(lessons.map(lesson => 
      lesson.id === id ? { ...lesson, [field]: value } : lesson
    ));
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const handleMediaUpload = (files: FileList | null, lessonId?: string) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    
    if (lessonId) {
      // Update specific lesson
      updateLesson(lessonId, 'mediaFiles', fileArray);
    } else {
      // Update current lesson
      setCurrentLesson({...currentLesson, mediaFiles: fileArray});
    }
  };

  const triggerMediaUpload = (lessonId?: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,audio/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleMediaUpload(target.files, lessonId);
    };
    input.click();
  };

  const completeLesson = (courseId: number, lessonIndex: number, karmaReward: number) => {
    const progressKey = `${courseId}-${lessonIndex}`;
    if (!userProgress[progressKey]) {
      setUserProgress(prev => ({...prev, [progressKey]: true}));
      setUserKarma(prev => prev + karmaReward);
      
      // Show completion animation/notification here
      console.log(`Lektion abgeschlossen! +${karmaReward} Karma erhalten`);
    }
  };

  const isLessonCompleted = (courseId: number, lessonIndex: number) => {
    return userProgress[`${courseId}-${lessonIndex}`] || false;
  };

  const courses = [
    {
      id: 1,
      title: 'React Grundlagen',
      description: 'Lerne die Basics von React und erstelle deine erste App',
      category: 'frontend',
      progress: 75,
      duration: '4 Stunden',
      karma: 200,
      difficulty: 'Anfänger',
      lessons: 12,
      completed: 9,
      thumbnail: '🚀',
      color: 'from-blue-500 to-blue-600',
      courseLessons: [
        {
          title: 'Was ist React?',
          content: 'React ist eine JavaScript-Bibliothek zur Erstellung von Benutzeroberflächen. Sie wurde von Facebook entwickelt und ist heute eine der beliebtesten Frontend-Technologien.',
          codeExample: `import React from 'react';

function App() {
  return (
    <div>
      <h1>Hallo React!</h1>
      <p>Meine erste React-Komponente</p>
    </div>
  );
}

export default App;`,
          karmaReward: 25
        },
        {
          title: 'JSX Grundlagen',
          content: 'JSX ist eine Syntax-Erweiterung für JavaScript, die es ermöglicht, HTML-ähnlichen Code in JavaScript zu schreiben.',
          codeExample: `const element = <h1>Hallo Welt!</h1>;

const name = 'Max';
const greeting = <h1>Hallo, {name}!</h1>;`,
          karmaReward: 30
        }
      ]
    },
    {
      id: 2,
      title: 'TypeScript Masterclass',
      description: 'Erweitere deine JavaScript Skills mit TypeScript',
      category: 'frontend',
      progress: 30,
      duration: '6 Stunden',
      karma: 350,
      difficulty: 'Fortgeschritten',
      lessons: 18,
      completed: 5,
      thumbnail: '⚡',
      color: 'from-purple-500 to-purple-600',
      courseLessons: [
        {
          title: 'TypeScript Einführung',
          content: 'TypeScript ist eine typisierte Obermenge von JavaScript, die zu reinem JavaScript kompiliert wird.',
          codeExample: `interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'Max',
  age: 25
};`,
          karmaReward: 35
        }
      ]
    },
    {
      id: 3,
      title: 'Node.js & Express',
      description: 'Backend Entwicklung mit Node.js und Express Framework',
      category: 'backend',
      progress: 0,
      duration: '8 Stunden',
      karma: 400,
      difficulty: 'Mittel',
      lessons: 24,
      completed: 0,
      thumbnail: '🔧',
      color: 'from-green-500 to-green-600',
      courseLessons: []
    },
    {
      id: 4,
      title: 'UI/UX Design Prinzipien',
      description: 'Grundlagen des modernen Interface Designs',
      category: 'design',
      progress: 100,
      duration: '3 Stunden',
      karma: 150,
      difficulty: 'Anfänger',
      lessons: 8,
      completed: 8,
      thumbnail: '🎨',
      color: 'from-orange-500 to-orange-600',
      courseLessons: []
    },
  ];

  const achievements = [
    { title: 'Erste Schritte', description: 'Ersten Kurs abgeschlossen', icon: Trophy, earned: true, rarity: 'common' },
    { title: 'Streak Master', description: '7 Tage in Folge gelernt', icon: Zap, earned: true, rarity: 'rare' },
    { title: 'Karma Sammler', description: '1000 Karma Punkte erreicht', icon: Star, earned: false, rarity: 'epic' },
  ];

  // Render Achievements Page
  if (showAchievements) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAchievements(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Erfolge & Achievements
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sammle Erfolge und zeige deine Leistungen
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-yellow-500">
              <Trophy className="w-6 h-6" />
              <span className="font-semibold">12/25</span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className={`${isDark ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} rounded-2xl p-6 border mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Dein Fortschritt
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  12 von 25 Erfolgen freigeschaltet
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-500">48%</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Abgeschlossen
                </div>
              </div>
            </div>
            <div className={`w-full h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: '48%' }}></div>
            </div>
          </div>

          {/* Achievement Categories */}
          <div className="space-y-6">
            {/* Work Achievements */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🚀 Arbeits-Erfolge
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { 
                    title: 'Topspeed ⚡', 
                    description: 'Auftrag angenommen, der weniger als 30min inseriert war', 
                    icon: Zap, 
                    earned: true, 
                    rarity: 'rare',
                    earnedDate: 'Vor 2 Tagen'
                  },
                  { 
                    title: 'Fleißiges Bienchen 🐝', 
                    description: 'Länger als 3 Stunden an einem Tag in der App verbracht', 
                    icon: Clock, 
                    earned: true, 
                    rarity: 'common',
                    earnedDate: 'Gestern'
                  },
                  { 
                    title: 'Faulpelz 😴', 
                    description: 'Job-Termin nicht eingehalten', 
                    icon: AlertCircle, 
                    earned: false, 
                    rarity: 'shame',
                    earnedDate: null
                  },
                  { 
                    title: 'Perfektionist ✨', 
                    description: '10 Jobs mit 5-Sterne Bewertung abgeschlossen', 
                    icon: Star, 
                    earned: false, 
                    rarity: 'epic',
                    earnedDate: null
                  }
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
                      achievement.earned ? 'ring-2 ring-yellow-500/30 shadow-lg shadow-yellow-500/20' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        achievement.earned 
                          ? achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : achievement.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : achievement.rarity === 'shame' ? 'bg-gradient-to-br from-red-500 to-orange-500'
                            : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                          : isDark ? 'bg-slate-700' : 'bg-gray-200'
                      }`}>
                        <achievement.icon className={`w-8 h-8 ${achievement.earned ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {achievement.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400'
                            : achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400'
                            : achievement.rarity === 'shame' ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {achievement.rarity === 'epic' ? 'EPISCH' 
                             : achievement.rarity === 'rare' ? 'SELTEN'
                             : achievement.rarity === 'shame' ? 'SCHANDE'
                             : 'HÄUFIG'}
                          </span>
                        </div>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.earnedDate && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Erhalten: {achievement.earnedDate}
                          </p>
                        )}
                        {!achievement.earned && (
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Noch nicht freigeschaltet
                          </p>
                        )}
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Achievements */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📚 Lern-Erfolge
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { 
                    title: 'Wissensdurst 🧠', 
                    description: '5 Campus-Kurse in einer Woche abgeschlossen', 
                    icon: BookOpen, 
                    earned: true, 
                    rarity: 'rare',
                    earnedDate: 'Vor 1 Woche'
                  },
                  { 
                    title: 'Code-Ninja 🥷', 
                    description: '50 Code-Beispiele erfolgreich ausgeführt', 
                    icon: Code, 
                    earned: false, 
                    rarity: 'epic',
                    earnedDate: null
                  }
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
                      achievement.earned ? 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        achievement.earned 
                          ? achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : isDark ? 'bg-slate-700' : 'bg-gray-200'
                      }`}>
                        <achievement.icon className={`w-8 h-8 ${achievement.earned ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {achievement.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {achievement.rarity === 'epic' ? 'EPISCH' : 'SELTEN'}
                          </span>
                        </div>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.earnedDate && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Erhalten: {achievement.earnedDate}
                          </p>
                        )}
                        {!achievement.earned && (
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Noch nicht freigeschaltet
                          </p>
                        )}
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const filteredCourses = courses.filter(course => 
    selectedCategory === 'all' || course.category === selectedCategory
  );

  // Lesson Viewer Component
  if (viewingLesson) {
    const course = courses.find(c => c.id === viewingLesson.courseId);
    const lesson = course?.courseLessons[viewingLesson.lessonIndex];
    
    if (!course || !lesson) {
      setViewingLesson(null);
      return null;
    }

    const isCompleted = isLessonCompleted(viewingLesson.courseId, viewingLesson.lessonIndex);

    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setViewingLesson(null)}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {course.title}
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">+{lesson.karmaReward} Karma</span>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {lesson.title}
              </h1>
              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">Abgeschlossen</span>
                </div>
              )}
            </div>

            <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {lesson.content}
            </p>

            {/* Code Example */}
            {lesson.codeExample && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Code-Beispiel
                </h3>
                <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-900 border-gray-700'} rounded-xl p-4 border overflow-x-auto`}>
                  <pre className="text-sm">
                    <code className="text-green-400 font-mono whitespace-pre">
                      {lesson.codeExample}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Lektion {viewingLesson.lessonIndex + 1} von {course.courseLessons.length}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-32 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${((viewingLesson.lessonIndex + 1) / course.courseLessons.length) * 100}%` }}
                  />
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {Math.round(((viewingLesson.lessonIndex + 1) / course.courseLessons.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {!isCompleted ? (
                <button
                  onClick={() => completeLesson(viewingLesson.courseId, viewingLesson.lessonIndex, lesson.karmaReward)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-green-500/30 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Lektion abschließen (+{lesson.karmaReward} Karma)</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Bereits abgeschlossen</span>
                </button>
              )}
              
              {viewingLesson.lessonIndex < course.courseLessons.length - 1 && (
                <button
                  onClick={() => setViewingLesson({
                    courseId: viewingLesson.courseId,
                    lessonIndex: viewingLesson.lessonIndex + 1
                  })}
                  className={`px-6 py-4 rounded-xl border font-semibold hover:scale-[1.02] transition-transform duration-300 ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Nächste Lektion
                </button>
              )}
            </div>
          </div>

          {/* Community Chat Section */}
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💬 Community Chat
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Erstelle Bubbles und chatte mit anderen Lernenden
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {onlineUsers} online
                </span>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bubble List */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Aktive Bubbles ({bubbles.length})
                  </h4>
                  <button
                    onClick={() => setShowCreateBubble(true)}
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {bubbles.map((bubble) => (
                    <div
                      key={bubble.id}
                      onClick={() => setSelectedBubble(bubble)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] relative ${
                        selectedBubble?.id === bubble.id
                          ? isDark 
                            ? 'bg-blue-900/30 border-blue-500/50' 
                            : 'bg-blue-50 border-blue-200'
                          : isDark
                            ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {bubble.hasNewMessages && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                      )}
                      
                      {bubble.createdBy === 'Du' && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Deine Bubble
                          </span>
                        </div>
                      )}

                      <div className="flex items-start space-x-3 mt-2">
                        <div className="text-2xl">{bubble.category === 'help' ? '🆘' : bubble.category === 'discussion' ? '💬' : '🚀'}</div>
                        <div className="flex-1">
                          <h5 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {bubble.title}
                          </h5>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            von {bubble.createdBy} {bubble.createdBy === 'Du' ? '👑' : ''}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-1">
                                {bubble.participants.slice(0, 3).map((participant, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 ${
                                      isDark ? 'border-slate-700' : 'border-white'
                                    }`}
                                    style={{ backgroundColor: participant.color }}
                                  >
                                    {participant.name.charAt(0)}
                                  </div>
                                ))}
                              </div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {bubble.participants.length}/10
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${bubble.creatorOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {bubble.lastActivity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2">
                {selectedBubble ? (
                  <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl border h-96 flex flex-col`}>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-600 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {selectedBubble.category === 'help' ? '🆘' : selectedBubble.category === 'discussion' ? '💬' : '🚀'}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedBubble.title}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedBubble.participants.length} Teilnehmer
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedBubble.createdBy === 'Du' && (
                          <>
                            <div className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                              Wenn du gehst, platzt die Bubble!
                            </div>
                            <button
                              onClick={() => handleBubblePop(selectedBubble.id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
                            >
                              💥 Bubble platzen lassen
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleLeaveBubble(selectedBubble.id)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            isDark 
                              ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Verlassen
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'Du' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.sender === 'Du'
                              ? 'bg-blue-500 text-white'
                              : isDark
                                ? 'bg-slate-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                          }`}>
                            {message.sender !== 'Du' && (
                              <div className="text-xs opacity-70 mb-1">{message.sender}</div>
                            )}
                            <div className="text-sm">{message.text}</div>
                            <div className="text-xs opacity-70 mt-1">{message.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-slate-600">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Nachricht schreiben..."
                          className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                            isDark 
                              ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-xl border h-96 flex items-center justify-center`}>
                    <div className="text-center">
                      <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Wähle eine Bubble
                      </h4>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Klicke auf eine Bubble links, um zu chatten
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Karma Display */}
          <div className={`${isDark ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'} rounded-2xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Dein Karma
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sammle Punkte durch Lektionen
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">
                  {userKarma.toLocaleString()}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Punkte
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateLesson) {
    return (
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Neue Lektion erstellen
            </h1>
            <button
              onClick={() => setShowCreateLesson(false)}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Main Lesson Creation */}
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Titel
                  </label>
                  <input
                    type="text"
                    value={currentLesson.title}
                    onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                    placeholder="Lektions-Titel eingeben..."
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Beschreibung
                  </label>
                  <textarea
                    rows={4}
                    value={currentLesson.description}
                    onChange={(e) => setCurrentLesson({...currentLesson, description: e.target.value})}
                    placeholder="Beschreibung der Lektion..."
                    className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  />
                </div>

                {/* Media and Code Options */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      if (!currentLesson.hasMedia) {
                        setCurrentLesson({...currentLesson, hasMedia: true});
                        triggerMediaUpload();
                      } else {
                        setCurrentLesson({...currentLesson, hasMedia: false, mediaFiles: []});
                      }
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      currentLesson.hasMedia
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isDark
                          ? 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Medien</span>
                  </button>

                  <button
                    onClick={() => setCurrentLesson({...currentLesson, hasCode: !currentLesson.hasCode})}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      currentLesson.hasCode
                        ? 'bg-purple-500 text-white border-purple-500'
                        : isDark
                          ? 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span className="text-sm font-medium">Code</span>
                  </button>
                </div>

                {/* Media Preview */}
                {currentLesson.hasMedia && currentLesson.mediaFiles && currentLesson.mediaFiles.length > 0 && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hochgeladene Medien ({currentLesson.mediaFiles.length})
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {currentLesson.mediaFiles.map((file, index) => (
                        <div key={index} className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} border rounded-xl p-3 flex items-center space-x-2`}>
                          <Image className="w-4 h-4 text-blue-500" />
                          <span className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {file.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => triggerMediaUpload()}
                      className="mt-2 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                      + Weitere Medien hinzufügen
                    </button>
                  </div>
                )}

                {/* Code Input */}
                {currentLesson.hasCode && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Code-Beispiel
                    </label>
                    <textarea
                      rows={6}
                      value={currentLesson.codeContent}
                      onChange={(e) => setCurrentLesson({...currentLesson, codeContent: e.target.value})}
                      placeholder="// Code hier einfügen..."
                      className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none font-mono text-sm ${
                        isDark 
                          ? 'bg-slate-900 border-slate-600 text-green-400 placeholder-gray-500' 
                          : 'bg-gray-900 border-gray-300 text-green-400 placeholder-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Lessons */}
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border relative`}>
                <button
                  onClick={() => removeLesson(lesson.id)}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Titel (Lektion {index + 2})
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                      placeholder="Lektions-Titel eingeben..."
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Beschreibung
                    </label>
                    <textarea
                      rows={4}
                      value={lesson.description}
                      onChange={(e) => updateLesson(lesson.id, 'description', e.target.value)}
                      placeholder="Beschreibung der Lektion..."
                      className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        if (!lesson.hasMedia) {
                          updateLesson(lesson.id, 'hasMedia', true);
                          triggerMediaUpload(lesson.id);
                        } else {
                          updateLesson(lesson.id, 'hasMedia', false);
                          updateLesson(lesson.id, 'mediaFiles', []);
                        }
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        lesson.hasMedia
                          ? 'bg-blue-500 text-white border-blue-500'
                          : isDark
                            ? 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Medien</span>
                    </button>

                    <button
                      onClick={() => updateLesson(lesson.id, 'hasCode', !lesson.hasCode)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        lesson.hasCode
                          ? 'bg-purple-500 text-white border-purple-500'
                          : isDark
                            ? 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Code className="w-4 h-4" />
                      <span className="text-sm font-medium">Code</span>
                    </button>
                  </div>

                  {/* Media Preview for additional lessons */}
                  {lesson.hasMedia && lesson.mediaFiles && lesson.mediaFiles.length > 0 && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hochgeladene Medien ({lesson.mediaFiles.length})
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {lesson.mediaFiles.map((file, index) => (
                          <div key={index} className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} border rounded-xl p-3 flex items-center space-x-2`}>
                            <Image className="w-4 h-4 text-blue-500" />
                            <span className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {file.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => triggerMediaUpload(lesson.id)}
                        className="mt-2 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
                      >
                        + Weitere Medien hinzufügen
                      </button>
                    </div>
                  )}

                  {lesson.hasCode && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Code-Beispiel
                      </label>
                      <textarea
                        rows={6}
                        value={lesson.codeContent}
                        onChange={(e) => updateLesson(lesson.id, 'codeContent', e.target.value)}
                        placeholder="// Code hier einfügen..."
                        className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none font-mono text-sm ${
                          isDark 
                            ? 'bg-slate-900 border-slate-600 text-green-400 placeholder-gray-500' 
                            : 'bg-gray-900 border-gray-300 text-green-400 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Another Lesson Button */}
            <button
              onClick={addAnotherLessonField}
              className={`w-full ${isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80' : 'bg-white border-gray-200 hover:bg-gray-50'} border-2 border-dashed rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] group`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Plus className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Weitere Lektion hinzufügen
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Erstelle mehrere Lektionen für deinen Kurs
                  </p>
                </div>
              </div>
            </button>

            {/* Save Button */}
            <button
              onClick={async () => {
                try {
                  // Get current user
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    alert('Sie müssen angemeldet sein, um Lektionen zu erstellen.');
                    return;
                  }

                  // Create course first
                  const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .insert({
                      title: currentLesson.title || 'Neuer Kurs',
                      description: currentLesson.description || 'Kurs Beschreibung',
                      category: 'general',
                      difficulty: 'Anfänger',
                      created_by: user.id
                    })
                    .select()
                    .single();

                  if (courseError) {
                    console.error('Fehler beim Erstellen des Kurses:', courseError);
                    alert('Fehler beim Erstellen des Kurses');
                    return;
                  }

                  // Create lessons
                  const allLessons = [currentLesson, ...lessons];
                  for (let i = 0; i < allLessons.length; i++) {
                    const lesson = allLessons[i];
                    if (lesson.title && lesson.description) {
                      const { data: lessonData, error: lessonError } = await supabase
                        .from('lessons')
                        .insert({
                          course_id: courseData.id,
                          title: lesson.title,
                          description: lesson.description,
                          content: lesson.description, // Using description as content for now
                          code_example: lesson.hasCode ? lesson.codeContent : null,
                          karma_reward: 25,
                          order_index: i,
                          is_published: true
                        })
                        .select()
                        .single();

                      if (lessonError) {
                        console.error('Fehler beim Erstellen der Lektion:', lessonError);
                        continue;
                      }

                      // Handle media files (placeholder for now)
                      if (lesson.hasMedia && lesson.mediaFiles && lesson.mediaFiles.length > 0) {
                        // TODO: Upload files to Supabase Storage and save references
                        console.log('Media files to upload:', lesson.mediaFiles);
                      }
                    }
                  }

                  alert('Kurs und Lektionen erfolgreich erstellt!');
                  setShowCreateLesson(false);
                  
                  // Reset form
                  setCurrentLesson({
                    id: '',
                    title: '',
                    description: '',
                    hasMedia: false,
                    hasCode: false,
                    codeContent: '',
                    mediaFiles: []
                  });
                  setLessons([]);
                  
                } catch (error) {
                  console.error('Unerwarteter Fehler:', error);
                  alert('Ein unerwarteter Fehler ist aufgetreten');
                }
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Kurs mit Lektionen speichern</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto pb-32">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Campus
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Erweitere deine Fähigkeiten und sammle Karma
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>4</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Kurse</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Erfolge</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <Star className="w-6 h-6 text-purple-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>750</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Karma</div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : isDark
                    ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Lesson Button */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setShowCreateLesson(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Neue Lektion erstellen</span>
        </button>
      </div>

      {/* Achievements Section */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Erfolge
          </h2>
          <button
            onClick={() => setShowAchievements(true)}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
          >
            Alle anzeigen
          </button>
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-48 p-4 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                achievement.earned
                  ? isDark
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                    : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                  : isDark
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-white border-gray-200'
              }`}
            >
              <achievement.icon className={`w-8 h-8 mb-3 ${
                achievement.earned ? 'text-yellow-500' : isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {achievement.title}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {achievement.description}
              </p>
              {achievement.earned && (
                <div className="mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                </div>
              )}
            </div>
          ))}
          
          {/* New Achievement */}
          <div className={`flex-shrink-0 w-48 p-4 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
            isDark
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 animate-pulse'
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 animate-pulse'
          }`}>
            <Zap className="w-8 h-8 mb-3 text-blue-500" />
            <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Topspeed ⚡
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Auftrag in unter 30min angenommen
            </p>
            <div className="mt-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="px-6 space-y-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => {
              if (course.courseLessons.length > 0) {
                setViewingLesson({ courseId: course.id, lessonIndex: 0 });
              }
            }}
            className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative overflow-hidden ${course.courseLessons.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${course.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                {course.thumbnail}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {course.description}
                    </p>
                  </div>
                  {course.progress === 100 && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm mb-3">
                  <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Play className="w-4 h-4 mr-1" />
                    {course.completed}/{course.lessons} Lektionen
                  </div>
                  {course.courseLessons.length > 0 && (
                    <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.courseLessons.length} verfügbar
                    </div>
                  )}
                  <div className="flex items-center text-purple-400">
                    <Star className="w-4 h-4 mr-1" />
                    +{course.karma} Karma
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.difficulty === 'Anfänger' 
                        ? 'bg-green-500/20 text-green-400'
                        : course.difficulty === 'Mittel'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.progress}%
                    </span>
                    <div className={`w-20 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampusPage;