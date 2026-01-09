'use client';

import { Phone, MessageCircle, X } from 'lucide-react';
import { siteConfig } from '@karasu-emlak/config';
import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';

export default function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed CTA before
    const dismissed = localStorage.getItem('mobile-cta-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Show CTA after user scrolls down 300px
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsVisible(scrollY > 300 && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('mobile-cta-dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  const whatsappNumber = siteConfig.nap.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-2xl z-50 md:hidden animate-slide-up"
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div className="flex gap-2 p-3">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Call Button */}
        <a
          href={`tel:${siteConfig.nap.phone}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary active:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-200 shadow-lg active:scale-95"
          aria-label="Telefon ile ara"
        >
          <Phone className="w-5 h-5" />
          <span>Ara</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 active:bg-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg active:scale-95"
          aria-label="WhatsApp ile mesaj gönder"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Mesaj</span>
        </a>
      </div>
    </div>
  );
}

