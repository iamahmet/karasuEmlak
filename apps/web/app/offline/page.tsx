'use client';

import { WifiOff, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <WifiOff className="w-24 h-24 text-blue-500 dark:text-blue-400" />
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Çevrimdışısınız
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            İnternet bağlantınız kesilmiş görünüyor. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Yeniden Dene
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Ana Sayfa
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bazı içerikler çevrimdışı modda görüntülenebilir.
          </p>
        </div>
      </div>
    </div>
  );
}
