/**
 * SectionHeader Component
 * Consistent section headers across pages
 */

import * as React from 'react';
import { cn } from '@karasu/lib';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeader({
  title,
  description,
  action,
  align = 'left',
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        align === 'center' && 'items-center text-center',
        align === 'left' && 'items-start',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex-1">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-base text-gray-600 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
