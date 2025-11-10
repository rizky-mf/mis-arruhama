import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const types = {
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      progressBg: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-white',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
      progressBg: 'bg-red-500',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      progressBg: 'bg-amber-500',
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
      progressBg: 'bg-blue-500',
    },
  };

  const config = types[toast.type] || types.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-2 rounded-xl shadow-2xl overflow-hidden animate-slideInRight pointer-events-auto max-w-md`}
    >
      <div className="p-4 flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <p className={`flex-1 text-sm font-medium ${config.text} leading-relaxed pr-2`}>
          {toast.message}
        </p>
        <button
          onClick={onClose}
          className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0 p-1 rounded-lg hover:bg-black/5`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-1 bg-gray-100">
        <div className={`h-full ${config.progressBg} animate-shrink`}></div>
      </div>
    </div>
  );
};

export default ToastProvider;
