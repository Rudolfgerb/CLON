import React, { useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastNotificationProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

const colorMap: Record<ToastType, string> = {
  success: 'bg-green-500',
  info: 'bg-blue-500',
  warning: 'bg-orange-500',
  error: 'bg-red-500'
};

const ToastNotification: React.FC<ToastNotificationProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(t);
  }, [id, onClose]);

  return (
    <div
      className={`flex items-center text-white px-4 py-2 rounded shadow-md ${colorMap[type]} slide-in-right fade-out-5`}
    >
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default ToastNotification;
