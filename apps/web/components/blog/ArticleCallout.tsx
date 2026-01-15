'use client';

import { AlertCircle, Info, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutType = 'info' | 'warning' | 'success' | 'error' | 'tip';

interface ArticleCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
    textColor: 'text-blue-800 dark:text-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    titleColor: 'text-yellow-900 dark:text-yellow-100',
    textColor: 'text-yellow-800 dark:text-yellow-200',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100',
    textColor: 'text-green-800 dark:text-green-200',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100',
    textColor: 'text-red-800 dark:text-red-200',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleColor: 'text-purple-900 dark:text-purple-100',
    textColor: 'text-purple-800 dark:text-purple-200',
  },
};

/**
 * ArticleCallout Component
 * 
 * Inline callout boxes for important information, tips, warnings, etc.
 */
export function ArticleCallout({
  type = 'info',
  title,
  children,
  className,
}: ArticleCalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-lg border-l-4 p-4 my-6",
      config.bg,
      config.border,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn("font-semibold mb-2", config.titleColor)}>
              {title}
            </h4>
          )}
          <div className={cn("prose prose-sm max-w-none", config.textColor)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
