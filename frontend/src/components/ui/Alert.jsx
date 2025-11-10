import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const types = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-200/50',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-200/50',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-200/50',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-200/50',
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-xl p-4 flex items-start gap-3 animate-slideInDown shadow-sm ${className}`}
      role="alert"
    >
      <div className={`${config.iconBg} rounded-lg p-1.5 flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.text} leading-relaxed`}>
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0 p-1 rounded-lg hover:bg-black/5`}
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
