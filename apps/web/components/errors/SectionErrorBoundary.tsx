'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Section-level Error Boundary
 * Catches errors in specific sections without breaking the entire page
 */
export class SectionErrorBoundary extends Component<Props, State> {
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
    // Log section-specific error
    const sectionName = this.props.sectionName || 'Unknown Section';
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${sectionName}:`, error, errorInfo);
    }
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // Send to Sentry in production
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: {
              errorBoundary: 'section',
              sectionName: this.props.sectionName || 'unknown',
            },
          });
        }).catch(() => {
          // Silently fail if Sentry fails
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Minimal error UI for sections
      return (
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              {this.props.sectionName 
                ? `${this.props.sectionName} yüklenirken bir hata oluştu.`
                : 'Bu bölüm yüklenirken bir hata oluştu.'
              }
            </p>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

