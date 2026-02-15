"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@karasu/ui";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Always log errors
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service (e.g., Sentry)
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="card-professional max-w-md w-full">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-lg font-display font-bold text-foreground">
              Bir Hata Oluştu
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <p className="text-sm text-muted-foreground font-ui">
            {error?.message || "Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün."}
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <details className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
              <summary className="text-xs font-semibold text-red-800 dark:text-red-300 cursor-pointer mb-2">
                Teknik Detaylar (Development)
              </summary>
              <pre className="text-xs text-red-700 dark:text-red-400 font-mono overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onReset}
              variant="outline"
              className="flex-1 hover-scale micro-bounce rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yeniden Dene
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-gradient-to-r from-design-light to-green-600 hover:from-design-dark hover:to-green-700 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
            >
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook for programmatic error throwing
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    throw error;
  };
}
