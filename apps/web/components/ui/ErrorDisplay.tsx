'use client';

import { AlertCircle, RefreshCw, Home, X } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';
import Link from 'next/link';
import { categorizeError, getErrorMessage, getRecoveryAction } from '@/lib/utils/error-handler';

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'inline' | 'card' | 'fullscreen';
  showDetails?: boolean;
  context?: {
    component?: string;
    action?: string;
  };
}

/**
 * Enhanced Error Display Component
 * Shows user-friendly error messages with recovery actions
 */
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className,
  variant = 'card',
  showDetails = process.env.NODE_ENV === 'development',
  context,
}: ErrorDisplayProps) {
  const category = categorizeError(error);
  const message = getErrorMessage(error, context);
  const recoveryAction = getRecoveryAction(error);

  const severityColors = {
    low: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    medium: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    critical: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
  };

  const severityIcons = {
    low: AlertCircle,
    medium: AlertCircle,
    high: AlertCircle,
    critical: AlertCircle,
  };

  const Icon = severityIcons[category.severity];

  if (variant === 'fullscreen') {
    return (
      <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
        <div className="max-w-2xl w-full text-center">
          <Icon className={cn('h-24 w-24 mx-auto mb-6', `text-${category.severity === 'critical' ? 'red' : 'amber'}-600`)} />
          <h1 className="text-4xl font-bold mb-4">Bir Hata Oluştu</h1>
          <p className="text-xl text-muted-foreground mb-8">{message}</p>
          
          {showDetails && error instanceof Error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
              <p className="text-sm font-mono text-destructive mb-2">{error.message}</p>
              {error.stack && (
                <pre className="text-xs text-muted-foreground overflow-auto max-h-48">{error.stack}</pre>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {category.recoverable && onRetry && (
              <Button size="lg" onClick={onRetry}>
                <RefreshCw className="mr-2 h-5 w-5" />
                Tekrar Dene
              </Button>
            )}
            <Link href="/">
              <Button size="lg" variant="outline">
                <Home className="mr-2 h-5 w-5" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-start gap-2 text-sm', className)}>
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', `text-${category.severity === 'critical' ? 'red' : 'amber'}-600`)} />
        <div className="flex-1">
          <p className={cn('font-medium', `text-${category.severity === 'critical' ? 'red' : 'amber'}-900 dark:text-${category.severity === 'critical' ? 'red' : 'amber'}-100`)}>
            {message}
          </p>
          {showDetails && error instanceof Error && (
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn(
      'p-6 rounded-lg border',
      severityColors[category.severity],
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-6 w-6 flex-shrink-0 mt-0.5', `text-${category.severity === 'critical' ? 'red' : 'amber'}-600`)} />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Hata</h3>
          <p className="text-sm mb-4">{message}</p>
          
          {showDetails && error instanceof Error && (
            <details className="mb-4">
              <summary className="text-xs cursor-pointer mb-2">Teknik Detaylar</summary>
              <pre className="text-xs bg-black/10 dark:bg-white/10 p-2 rounded overflow-auto max-h-32">
                {error.stack || error.message}
              </pre>
            </details>
          )}

          {category.recoverable && (
            <div className="flex flex-wrap gap-2">
              {recoveryAction === 'retry' && onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
              )}
              {recoveryAction === 'refresh' && (
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sayfayı Yenile
                </Button>
              )}
              {recoveryAction === 'go-home' && (
                <Link href="/">
                  <Button size="sm" variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    Ana Sayfa
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
