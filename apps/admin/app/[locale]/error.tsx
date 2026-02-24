'use client';

import { useEffect } from 'react';
import { Button } from '@karasu/ui';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin panel error:', error);
    }
    
    if (process.env.NODE_ENV === 'production') {
      void import('@sentry/nextjs')
        .then((Sentry) => {
          Sentry.captureException(error, {
            tags: { surface: 'admin-global-error' },
            extra: error.digest ? { digest: error.digest } : undefined,
          });
        })
        .catch(() => undefined);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Bir Hata Oluştu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.
          </p>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-semibold text-destructive mb-2">Hata Mesajı:</p>
              <pre className="text-xs font-mono text-destructive overflow-auto">
                {error.message}
              </pre>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs font-semibold text-destructive cursor-pointer">
                    Stack Trace
                  </summary>
                  <pre className="text-xs font-mono text-destructive/80 overflow-auto max-h-40 mt-2">
                    {error.stack}
                  </pre>
                </details>
              )}
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">Digest: {error.digest}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} size="lg" className="flex-1 sm:flex-initial">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="flex-1 sm:flex-initial">
                <Home className="mr-2 h-4 w-4" />
                Dashboard'a Dön
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Sorun devam ederse, lütfen{' '}
              <Link href="/tr/settings" className="text-primary hover:underline">
                Ayarlar
              </Link>
              {' '}sayfasından destek ekibiyle iletişime geçin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
