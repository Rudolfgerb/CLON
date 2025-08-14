import React, { useEffect, useState } from 'react';
import { X, Trophy, Star, Flame, TrendingUp, DollarSign, Bell, Gift, Target, Zap } from 'lucide-react';

interface GameNotification {
  id: number;
  type: 'achievement' | 'karma' | 'streak' | 'level' | 'bonus' | 'reminder';
  title: string;
  message: string;
  color: string;
}

interface GameNotificationSystemProps {
  notifications: GameNotification[];
  onRemove: (id: number) => void;
  isDark: boolean;
}

const GameNotificationSystem: React.FC<GameNotificationSystemProps> = ({ 
  notifications, 
  onRemove, 
  isDark 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<GameNotification[]>([]);

  useEffect(() => {
    // Add new notifications with animation
    notifications.forEach(notification => {
      if (!visibleNotifications.find(n => n.id === notification.id)) {
        setVisibleNotifications(prev => [...prev, notification]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          onRemove(notification.id);
          setVisibleNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    });
  }, [notifications, visibleNotifications, onRemove]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'karma': return Star;
      case 'streak': return Flame;
      case 'level': return TrendingUp;
      case 'bonus': return DollarSign;
      case 'reminder': return Bell;
      default: return Gift;
    }
  };

  const getSound = (type: string) => {
    // In a real app, you'd play different sounds for different notification types
    switch (type) {
      case 'achievement': return '🎉';
      case 'karma': return '⭐';
      case 'streak': return '🔥';
      case 'level': return '📈';
      case 'bonus': return '💰';
      case 'reminder': return '🔔';
      default: return '🎁';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      {visibleNotifications.map((notification, index) => {
        const Icon = getIcon(notification.type);
        const soundEmoji = getSound(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`transform transition-all duration-500 ease-out ${
              index === visibleNotifications.length - 1 
                ? 'translate-x-0 opacity-100 scale-100' 
                : 'translate-x-0 opacity-90 scale-95'
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'slideInRight 0.5s ease-out forwards, shake 0.6s ease-in-out 0.2s'
            }}
          >
            <div className={`bg-gradient-to-r ${notification.color} rounded-2xl p-4 shadow-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden`}>
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse"></div>
              
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"></div>
              
              <div className="relative z-10 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm animate-bounce">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-bold text-white text-sm truncate">
                      {notification.title}
                    </h4>
                    <span className="text-lg animate-bounce">{soundEmoji}</span>
                  </div>
                  <p className="text-white/90 text-xs leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    onRemove(notification.id);
                    setVisibleNotifications(prev => prev.filter(n => n.id !== notification.id));
                  }}
                  className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
              
              {/* Progress bar for auto-dismiss */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
                <div 
                  className="h-full bg-white/50 rounded-b-2xl animate-pulse"
                  style={{
                    animation: 'shrink 5s linear forwards'
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default GameNotificationSystem;