import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
    warning: 'bg-yellow-500 border-yellow-400',
    info: 'bg-blue-500 border-blue-400'
  };

  const Icon = icons[type];

  return (
    <div
        className={cn(
          'fixed top-2 right-2 sm:top-4 sm:right-4 z-50 flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border text-white shadow-lg backdrop-blur-sm transition-all duration-300 max-w-xs sm:max-w-md',
          colors[type],
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
      <Icon size={16} className="sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-xs sm:text-sm">{title}</h4>
        {message && (
          <p className="text-xs sm:text-sm opacity-90 mt-1">{message}</p>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
      >
        <X size={14} className="sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

export default Toast;