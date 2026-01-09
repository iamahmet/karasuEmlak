'use client';

import * as React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@karasu/lib';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const toastVariants = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
};

const toastIcons = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const Icon = toastIcons[variant];

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 200);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[400px]',
        'toast-enter backdrop-blur-sm',
        toastVariants[variant]
      )}
      role="alert"
    >
      <Icon className={cn(
        'h-5 w-5 flex-shrink-0 mt-0.5 stroke-[1.5]',
        variant === 'success' && 'text-green-600',
        variant === 'error' && 'text-red-600',
        variant === 'warning' && 'text-yellow-600',
        variant === 'info' && 'text-blue-600',
        variant === 'default' && 'text-gray-600'
      )} />
      <div className="flex-1 min-w-0">
        {title && (
          <div className={cn(
            'text-[15px] font-semibold mb-1 tracking-[-0.011em]',
            variant === 'success' && 'text-green-900',
            variant === 'error' && 'text-red-900',
            variant === 'warning' && 'text-yellow-900',
            variant === 'info' && 'text-blue-900'
          )}>
            {title}
          </div>
        )}
        {description && (
          <div className={cn(
            'text-[13px] leading-[1.47] tracking-[-0.01em]',
            variant === 'success' && 'text-green-700',
            variant === 'error' && 'text-red-700',
            variant === 'warning' && 'text-yellow-700',
            variant === 'info' && 'text-blue-700',
            variant === 'default' && 'text-gray-600'
          )}>
            {description}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 200);
          }}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-all duration-200',
            'hover:bg-black/5 active:scale-95',
            variant === 'success' && 'hover:bg-green-100',
            variant === 'error' && 'hover:bg-red-100',
            variant === 'warning' && 'hover:bg-yellow-100',
            variant === 'info' && 'hover:bg-blue-100'
          )}
          aria-label="Kapat"
        >
          <X className="h-4 w-4 stroke-[1.5]" />
        </button>
      )}
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={() => onRemove(toast.id)} />
        </div>
      ))}
    </div>
  );
}

