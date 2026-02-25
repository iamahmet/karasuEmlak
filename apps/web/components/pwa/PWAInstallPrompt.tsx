'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@karasu/ui';
import { toast } from 'sonner';
import { brandAssetUrl } from '@/lib/branding/assets';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const promptFaviconUrl = brandAssetUrl('/favicon.ico');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if app was installed before
    const installed = localStorage.getItem('pwa-installed');
    if (installed === 'true') {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (better UX)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
      toast.success('Karasu Emlak başarıyla yüklendi!', {
        description: 'Ana ekranınızdan hızlıca erişebilirsiniz. 🏠',
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Show install prompt
      await deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Karasu Emlak yükleniyor...', {
          description: 'Ana ekranınıza ekleniyor, lütfen bekleyin.',
        });
      } else {
        toast.info('Yükleme iptal edildi', {
          description: 'İstediğiniz zaman tekrar deneyebilirsiniz.',
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast.error('Yükleme sırasında bir hata oluştu', {
        description: 'Lütfen tekrar deneyin.',
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  // Check if dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-2xl p-5 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          {/* Karasu Emlak Favicon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800 overflow-hidden p-1.5">
              <img 
                src={promptFaviconUrl}
                alt="Karasu Emlak" 
                className="w-11 h-11 object-contain"
                onError={(e) => {
                  // Fallback to download icon if favicon not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-icon');
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
              <Download className="w-6 h-6 text-white hidden fallback-icon" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Karasu Emlak'ı Yükle
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-semibold rounded-full">
                ÜCRETSİZ
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
              Ana ekranınıza ekleyin, <strong>daha hızlı erişin</strong> ve Karasu'daki en güncel emlak ilanlarını kaçırmayın.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Anında bildirimler
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Offline erişim
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Hızlı arama
              </span>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Action Button */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Şimdi Yükle
          </Button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Daha Sonra
          </button>
        </div>
      </div>
    </div>
  );
}
