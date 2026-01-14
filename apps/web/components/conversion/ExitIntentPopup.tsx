"use client";

import { useEffect, useState, useCallback } from 'react';
import { X, Phone, MessageCircle, Gift } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface ExitIntentPopupProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ExitIntentPopup({
  title = 'Bekleyin! Özel Teklifimizi Kaçırmayın',
  description = 'Karasu emlak uzmanlarımızla ücretsiz görüşün ve en iyi fırsatları keşfedin.',
  className,
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY < 10 && !hasShown) {
      // Check if popup was shown before in this session
      const shownBefore = sessionStorage.getItem('exitIntentShown');
      if (!shownBefore) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    }
  }, [hasShown]);

  useEffect(() => {
    // Only run on desktop
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [handleMouseLeave]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4",
      className
    )}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Kapat"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Gift Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-[#006AFF] to-[#0052CC] rounded-2xl">
            <Gift className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-green-50 rounded-xl border border-green-200">
          <span className="text-2xl">✅</span>
          <span className="text-sm font-semibold text-green-800">
            Ücretsiz danışmanlık hizmeti
          </span>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <a
            href="tel:+905325933854"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#006AFF] hover:bg-[#0052CC] text-white rounded-xl font-semibold transition-colors"
          >
            <Phone className="h-5 w-5" />
            Hemen Ara
          </a>

          <a
            href="https://wa.me/905325933854"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-xl font-semibold transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp ile Yaz
          </a>

          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full py-3"
          >
            Hayır, teşekkürler
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          🔒 Bilgileriniz %100 güvende
        </p>
      </div>
    </div>
  );
}

export default ExitIntentPopup;
