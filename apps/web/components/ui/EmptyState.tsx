'use client';

import { Button } from '@karasu/ui';
import { LucideIcon } from 'lucide-react';
import { cn } from '@karasu/lib';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
    href?: string;
  };
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

/**
 * Empty State Component
 * Displays when there's no content to show
 * Follows design system: calm, professional, helpful
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('text-center py-8', className)}>
        {Icon && <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />}
        <p className="text-sm text-muted-foreground">{description || title}</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('text-center py-12', className)}>
        {Icon && (
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-4">
              <Icon className="h-8 w-8 text-muted-foreground stroke-[1.5]" />
            </div>
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}
        {action && (
          <Button
            variant={action.variant || 'default'}
            size="lg"
            onClick={action.onClick}
            className="rounded-lg"
            asChild={!!action.href}
          >
            {action.href ? (
              <a href={action.href}>{action.label}</a>
            ) : (
              <>{action.label}</>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('text-center py-20 lg:py-24 animate-fade-in', className)}>
      {Icon && (
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-gray-100 rounded-full blur-xl opacity-50"></div>
          <div className="relative">
            <div className="rounded-full bg-muted p-5">
              <Icon className="h-12 w-12 text-muted-foreground stroke-[1.5]" />
            </div>
          </div>
        </div>
      )}
      <h3 className="text-[19px] font-semibold text-foreground mb-2 tracking-[-0.022em]">{title}</h3>
      {description && (
        <p className="text-[15px] text-muted-foreground mb-8 max-w-md mx-auto leading-[1.47] tracking-[-0.011em]">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'default'}
          size="lg"
          onClick={action.onClick}
          className="text-[15px] font-semibold tracking-[-0.011em] rounded-lg transition-all duration-200 hover:shadow-md"
          asChild={!!action.href}
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            <>{action.label}</>
          )}
        </Button>
      )}
    </div>
  );
}

