'use client';

import { useEffect } from 'react';
import { Button } from '@karasu/ui';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { trackError } from '@/lib/monitoring/error-tracker';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = 'tr'; // Default locale for now
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  useEffect(() => {
    // Track error to monitoring service
    trackError(error, {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <AlertCircle className="h-24 w-24 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Bir Hata Oluştu</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
            <p className="text-sm font-mono text-destructive">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={reset}>
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

