import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => {
          let bgColor = 'bg-white text-neutral-800 border-neutral-200';
          let Icon = Info;
          let iconColor = 'text-info-500';

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-50 text-emerald-900 border-emerald-200';
            Icon = CheckCircle;
            iconColor = 'text-success-500';
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-50 text-rose-900 border-rose-200';
            Icon = XCircle;
            iconColor = 'text-danger-500';
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-50 text-amber-900 border-amber-200';
            Icon = AlertCircle;
            iconColor = 'text-warning-500';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg glass-card animate-slide-up ${bgColor}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
