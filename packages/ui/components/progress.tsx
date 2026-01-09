'use client';

import * as React from 'react';
import { cn } from '@karasu/lib';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, variant = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantClasses = {
      default: 'bg-[#006AFF]',
      success: 'bg-[#00A862]',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
    };

    return (
      <div
        ref={ref}
        className={cn('relative w-full', className)}
        {...props}
      >
        {showLabel && (
          <div className="flex justify-between mb-2">
            <span className="text-[13px] font-medium text-gray-700 tracking-[-0.01em]">İlerleme</span>
            <span className="text-[13px] font-medium text-gray-700 tracking-[-0.01em]">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out progress-bar-animated',
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };

