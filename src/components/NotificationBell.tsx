import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  unread: number;
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ unread, onClick }) => {
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (unread > 0) {
      setGlow(true);
      const t = setTimeout(() => setGlow(false), 2000);
      return () => clearTimeout(t);
    }
  }, [unread]);

  return (
    <button onClick={onClick} className="relative text-gray-700 dark:text-gray-200">
      <Bell className={`w-6 h-6 ${glow ? 'pulse-glow' : ''}`} />
      {unread > 0 && (
        <>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full pulse-glow" />
          <span className="absolute -top-1 -right-2 px-1 bg-red-600 text-white text-xs rounded-full">
            {unread}
          </span>
        </>
      )}
    </button>
  );
};

export default NotificationBell;
