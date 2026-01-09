'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@karasu/lib';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 text-gray-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        error: 'bg-red-50 border-red-200 text-red-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const alertIcons = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, description, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = variant ? alertIcons[variant] : Info;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), 'animate-fade-in', className)}
        {...props}
      >
        <Icon className={cn(
          'h-5 w-5 stroke-[1.5]',
          variant === 'success' && 'text-green-600',
          variant === 'error' && 'text-red-600',
          variant === 'warning' && 'text-yellow-600',
          variant === 'info' && 'text-blue-600',
          variant === 'default' && 'text-gray-600'
        )} />
        <div className="flex-1">
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
          {children}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'absolute top-4 right-4 p-1 rounded-md transition-all duration-200',
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
);
Alert.displayName = 'Alert';

export { Alert, alertVariants };

