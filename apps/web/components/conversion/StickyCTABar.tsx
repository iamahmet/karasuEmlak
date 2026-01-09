/**
 * Sticky CTA Bar Component
 * Sticky call-to-action bar for property detail pages
 * Appears after scrolling 300px
 * Mobile-optimized bottom bar
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { siteConfig } from '@karasu-emlak/config';
import { Button } from '@karasu/ui';
import { Phone, MessageCircle, Calendar } from 'lucide-react';

interface StickyCTABarProps {
  propertyTitle?: string;
  propertyId?: string;
  propertySlug?: string;
  propertyType?: string;
  showOnScroll?: number; // pixels to scroll before showing
}

export default function StickyCTABar({
  propertyTitle,
  propertyId,
  propertySlug,
  propertyType,
  showOnScroll = 300,
}: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Scroll detection
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsVisible(scrollY > showOnScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [showOnScroll]);

  if (!isVisible) return null;

  const whatsappMessage = propertyTitle
    ? `Merhaba, ${propertyTitle} hakkında bilgi almak istiyorum.`
    : 'Merhaba, emlak ilanları hakkında bilgi almak istiyorum.';

  const whatsappNumber = siteConfig.nap.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const phoneUrl = `tel:${siteConfig.nap.phone}`;
  const appointmentUrl = propertySlug && propertyType
    ? `/ilan/${propertySlug}#randevu`
    : '/iletisim';

  return (
    <div
      className={`fixed ${
        isMobile ? 'bottom-0 left-0 right-0' : 'top-0 left-0 right-0'
      } z-50 bg-background border-t border-border shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : isMobile ? 'translate-y-full' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Property Title (Desktop only) */}
          {!isMobile && propertyTitle && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {propertyTitle}
              </p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Phone Button */}
            <a
              href={phoneUrl}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium text-sm transition-colors duration-200"
              aria-label="Telefon ile ara"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline">Ara</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
              aria-label="WhatsApp ile iletişime geç"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Appointment Button */}
            <Link
              href={appointmentUrl}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors duration-200"
              aria-label="Randevu al"
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:inline">Randevu Al</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

