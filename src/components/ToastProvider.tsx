import React, { createContext, useCallback, useContext, useState } from 'react';
import ToastNotification, { ToastType } from './ToastNotification';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

type AddToast = (toast: Omit<Toast, 'id'>) => void;

const ToastContext = createContext<AddToast>(() => {});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback<AddToast>(({ type, message }) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <ToastNotification key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
