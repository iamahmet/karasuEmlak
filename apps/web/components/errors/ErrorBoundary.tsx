'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@karasu/ui';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { routing } from '@/i18n/routing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // Default error logging
      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }
      
      // Send to Sentry in production
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
            tags: {
              errorBoundary: true,
            },
          });
        }).catch(() => {
          // Silently fail if Sentry fails
        });
      } else {
        // Development: use error tracker
        import('@/lib/monitoring/error-tracker').then(({ trackError }) => {
          trackError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
          });
        }).catch(() => {
          // Silently fail if error tracker is not available
        });
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const locale = 'tr'; // Default locale
      const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

      return (
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-24 w-24 text-destructive mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Bir Hata Oluştu</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
                <p className="text-sm font-mono text-destructive mb-2">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-48">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={this.handleReset}>
                <RefreshCw className="mr-2 h-5 w-5" />
                Tekrar Dene
              </Button>
              <Link href={basePath || "/"}>
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

    return this.props.children;
  }
}

/**
 * HOC wrapper for ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

