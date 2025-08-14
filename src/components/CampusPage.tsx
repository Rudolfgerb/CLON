import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Trophy, 
  Users, 
  TrendingUp, 
  Award,
  ChevronRight,
  Search,
  Filter,
  MessageCircle,
  Send,
  Plus,
  X,
  User
} from 'lucide-react';

interface CampusPageProps {
  isDark: boolean;
}

interface ChatBubble {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  description: string;
  participants: number;
  maxParticipants: number;
  creator: string;
  hasNewMessages: boolean;
  lastActivity: string;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}

const CampusPage: React.FC<CampusPageProps> = ({ isDark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  // Chat states
  const [selectedBubble, setSelectedBubble] = useState<ChatBubble | null>(null);
  const [showCreateBubble, setShowCreateBubble] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newBubbleData, setNewBubbleData] = useState({
    title: '',
    category: 'help',
    description: ''
  });

  // Mock chat data
  const [chatBubbles, setChatBubbles] = useState<ChatBubble[]>([
    {
      id: '1',
      title: 'React useState Hilfe',
      category: 'help',
      categoryIcon: '🆘',
      description: 'Brauche Hilfe mit React Hooks',
      participants: 4,
      maxParticipants: 10,
      creator: 'Anna Schmidt',
      hasNewMessages: true,
      lastActivity: 'vor 2 Min'
    },
    {
      id: '2',
      title: 'JavaScript Diskussion',
      category: 'discussion',
      categoryIcon: '💬',
      description: 'Diskussion über moderne JS Features',
      participants: 7,
      maxParticipants: 10,
      creator: 'Tom Weber',
      hasNewMessages: true,
      lastActivity: 'vor 5 Min'
    },
    {
      id: '3',
      title: 'Todo-App Projekt',
      category: 'project',
      categoryIcon: '🚀',
      description: 'Gemeinsam eine Todo-App entwickeln',
      participants: 3,
      maxParticipants: 8,
      creator: 'Lisa Müller',
      hasNewMessages: false,
      lastActivity: 'vor 15 Min'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'Anna Schmidt',
      message: 'Hey, kann mir jemand bei useState helfen?',
      timestamp: '14:30',
      isOwn: false
    },
    {
      id: '2',
      user: 'Tom Weber',
      message: 'Klar! Was ist denn das Problem?',
      timestamp: '14:32',
      isOwn: false
    },
    {
      id: '3',
      user: 'Du',
      message: 'Ich kann auch helfen. Zeig mal deinen Code.',
      timestamp: '14:33',
      isOwn: true
    },
    {
      id: '4',
      user: 'Anna Schmidt',
      message: 'Danke! Ich poste gleich einen Link zu meinem CodePen.',
      timestamp: '14:35',
      isOwn: false
    }
  ]);

  const categories = [
    { id: 'all', label: 'Alle Kurse', count: 24 },
    { id: 'frontend', label: 'Frontend', count: 8 },
    { id: 'backend', label: 'Backend', count: 6 },
    { id: 'mobile', label: 'Mobile', count: 4 },
    { id: 'design', label: 'Design', count: 6 },
  ];

  const courses = [
    {
      id: 1,
      title: 'React Grundlagen',
      description: 'Lerne die Basics von React',
      category: 'frontend',
      difficulty: 'Anfänger',
      duration: '4 Stunden',
      lessons: 12,
      completedLessons: 8,
      karma: 150,
      thumbnail: '⚛️',
      color: 'from-blue-500 to-blue-600',
      instructor: 'Max Mustermann',
      rating: 4.8,
      students: 1234,
    },
    {
      id: 2,
      title: 'JavaScript ES6+',
      description: 'Moderne JavaScript Features',
      category: 'frontend',
      difficulty: 'Mittel',
      duration: '6 Stunden',
      lessons: 18,
      completedLessons: 5,
      karma: 200,
      thumbnail: '🟨',
      color: 'from-yellow-500 to-yellow-600',
      instructor: 'Sarah Weber',
      rating: 4.9,
      students: 987,
    },
    {
      id: 3,
      title: 'Node.js Backend',
      description: 'Server-side JavaScript',
      category: 'backend',
      difficulty: 'Fortgeschritten',
      duration: '8 Stunden',
      lessons: 24,
      completedLessons: 0,
      karma: 300,
      thumbnail: '🟢',
      color: 'from-green-500 to-green-600',
      instructor: 'Tom Schmidt',
      rating: 4.7,
      students: 756,
    },
  ];

  const achievements = [
    { title: 'Erste Lektion', description: 'Erste Lektion abgeschlossen', icon: '🎯', unlocked: true },
    { title: 'Streak Master', description: '7 Tage in Folge gelernt', icon: '🔥', unlocked: true },
    { title: 'Karma Sammler', description: '500 Karma Punkte erreicht', icon: '⭐', unlocked: false },
    { title: 'Kurs Experte', description: '3 Kurse abgeschlossen', icon: '🏆', unlocked: false },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedBubble) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: 'Du',
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleCreateBubble = () => {
    if (newBubbleData.title.trim() && newBubbleData.description.trim()) {
      const bubble: ChatBubble = {
        id: Date.now().toString(),
        title: newBubbleData.title,
        category: newBubbleData.category,
        categoryIcon: newBubbleData.category === 'help' ? '🆘' : newBubbleData.category === 'discussion' ? '💬' : '🚀',
        description: newBubbleData.description,
        participants: 1,
        maxParticipants: 10,
        creator: 'Du',
        hasNewMessages: false,
        lastActivity: 'gerade eben'
      };
      setChatBubbles(prev => [...prev, bubble]);
      setNewBubbleData({ title: '', category: 'help', description: '' });
      setShowCreateBubble(false);
      setSelectedBubble(bubble);
      setChatMessages([]);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Campus
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Lerne neue Skills und sammle Karma
        </p>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Kurse durchsuchen..."
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
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                selectedCategory === category.id
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
            <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>12</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Kurse</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>850</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Karma</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} hover:scale-105 transition-transform duration-300`}>
            <Award className="w-6 h-6 text-purple-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>4</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Erfolge</div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="px-6 mb-8">
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Verfügbare Kurse
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${course.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                    {course.thumbnail}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration}
                      </span>
                      <span className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Users className="w-3 h-3 mr-1" />
                        {course.students}
                      </span>
                      <span className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Star className="w-3 h-3 mr-1" />
                        {course.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    <Star className="w-4 h-4 mr-1" />
                    +{course.karma}
                  </div>
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
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fortschritt
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {course.completedLessons}/{course.lessons} Lektionen
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`bg-gradient-to-r ${course.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(course.completedLessons / course.lessons) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  von {course.instructor}
                </span>
                <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:translate-x-1 transition-transform duration-300`} />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="px-6 mb-8">
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Erfolge
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-4 border transition-all duration-300 hover:scale-105 ${
                achievement.unlocked ? 'ring-2 ring-yellow-500/30' : 'opacity-60'
              }`}
            >
              <div className="text-center">
                <div className={`text-3xl mb-2 ${achievement.unlocked ? 'animate-bounce' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {achievement.title}
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <div className="mt-2">
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                      Freigeschaltet
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Chat Section */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Community Chat
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                12 online
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCreateBubble(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-xl hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden`}>
          <div className="grid grid-cols-1 md:grid-cols-2 h-96">
            {/* Bubble List */}
            <div className={`${isDark ? 'border-slate-700' : 'border-gray-200'} border-r overflow-y-auto`}>
              <div className={`p-4 ${isDark ? 'border-slate-700' : 'border-gray-200'} border-b`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Aktive Bubbles ({chatBubbles.length})
                </h3>
              </div>
              <div className="space-y-2 p-2">
                {chatBubbles.map((bubble) => (
                  <div
                    key={bubble.id}
                    onClick={() => setSelectedBubble(bubble)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      selectedBubble?.id === bubble.id
                        ? isDark ? 'bg-blue-600/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                        : isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                    } ${bubble.hasNewMessages ? 'ring-2 ring-orange-500/50 animate-pulse' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{bubble.categoryIcon}</span>
                        <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {bubble.title}
                        </h4>
                        {bubble.hasNewMessages && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 line-clamp-2`}>
                      {bubble.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {bubble.participants}/{bubble.maxParticipants} Teilnehmer
                      </span>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {bubble.lastActivity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col">
              {selectedBubble ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 ${isDark ? 'border-slate-700' : 'border-gray-200'} border-b`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedBubble.categoryIcon} {selectedBubble.title}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedBubble.participants} Teilnehmer • von {selectedBubble.creator}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-xs ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getUserColor(message.user)}`}>
                            {getUserInitials(message.user)}
                          </div>
                          <div>
                            <div className={`px-3 py-2 rounded-2xl ${
                              message.isOwn
                                ? 'bg-blue-500 text-white'
                                : isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {message.user}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className={`p-4 ${isDark ? 'border-slate-700' : 'border-gray-200'} border-t`}>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Nachricht schreiben..."
                        className={`flex-1 px-3 py-2 rounded-xl border transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Wähle eine Bubble zum Chatten
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Bubble Modal */}
      {showCreateBubble && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl p-6 w-full max-w-md border shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Neue Bubble erstellen
              </h2>
              <button
                onClick={() => setShowCreateBubble(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Titel
                </label>
                <input
                  type="text"
                  value={newBubbleData.title}
                  onChange={(e) => setNewBubbleData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="z.B. React Hooks Hilfe"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Kategorie
                </label>
                <select
                  value={newBubbleData.category}
                  onChange={(e) => setNewBubbleData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                >
                  <option value="help">🆘 Hilfe</option>
                  <option value="discussion">💬 Diskussion</option>
                  <option value="project">🚀 Projekt</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Beschreibung
                </label>
                <textarea
                  rows={3}
                  value={newBubbleData.description}
                  onChange={(e) => setNewBubbleData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Worum geht es in dieser Bubble?"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
              </div>

              <div className={`${isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} rounded-xl p-4 border`}>
                <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  Bubble-Regeln:
                </h4>
                <ul className={`text-xs space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                  <li>• Bubble existiert nur solange du online bist</li>
                  <li>• Maximal 10 Teilnehmer pro Bubble</li>
                  <li>• Sei respektvoll und hilfsbereit</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateBubble(false)}
                className={`flex-1 px-4 py-3 rounded-xl border font-semibold transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateBubble}
                disabled={!newBubbleData.title.trim() || !newBubbleData.description.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusPage;