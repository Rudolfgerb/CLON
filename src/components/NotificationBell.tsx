import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from './NotificationProvider';

interface NotificationBellProps {
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { unreadCount } = useNotifications();
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setGlow(true);
      const t = setTimeout(() => setGlow(false), 2000);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 transition-colors"
    >
      <Bell className={`w-6 h-6 ${glow ? 'pulse-glow' : ''}`} />
      {unreadCount > 0 && (
        <>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full pulse-glow" />
          <span className="absolute -top-1 -right-2 px-1 bg-red-600 text-white text-xs rounded-full">
            {unreadCount}
          </span>
        </>
      )}
    </button>
  );
};

export default NotificationBell;
