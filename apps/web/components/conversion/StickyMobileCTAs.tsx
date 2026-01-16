"use client";

import { Phone, MessageCircle, Share2, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@karasu/lib';
import { FavoriteButton } from '@/components/listings/FavoriteButton';

interface StickyMobileCTAsProps {
  propertyTitle: string;
  propertyId: string;
  price?: number;
  status?: 'satilik' | 'kiralik';
  className?: string;
}

export function StickyMobileCTAs({
  propertyTitle,
  propertyId,
  price,
  status = 'satilik',
  className
}: StickyMobileCTAsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the price card (approximately)
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: `Bu ilanı inceleyin: ${propertyTitle}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const formattedPrice = price
    ? new Intl.NumberFormat('tr-TR').format(price)
    : null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 md:hidden print:hidden",
      "bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-2xl shadow-black/20",
      "transform transition-transform duration-300 ease-out",
      isVisible ? "translate-y-0" : "translate-y-full",
      "safe-area-inset-bottom",
      className
    )}>
      {/* Price Row - Compact */}
      {formattedPrice && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xl font-bold tracking-tight",
              status === 'satilik' ? 'text-[#006AFF]' : 'text-[#00A862]'
            )}>
              ₺{formattedPrice}
            </span>
            {status === 'kiralik' && (
              <span className="text-sm text-gray-500">/ay</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <FavoriteButton
              listingId={propertyId}
              listingTitle={propertyTitle}
              variant="mobile"
            />
            <button
              onClick={handleShare}
              className="p-2.5 rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200 transition-colors"
              aria-label="Paylaş"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* CTA Buttons Row */}
      <div className="flex items-center gap-2 p-3">
        <a
          href="tel:+905325933854"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#006AFF] active:bg-[#0052CC] text-white rounded-xl font-semibold transition-colors touch-manipulation"
        >
          <Phone className="h-5 w-5" />
          <span>Ara</span>
        </a>

        <a
          href="https://wa.me/905325933854"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] active:bg-[#20BD5C] text-white rounded-xl font-semibold transition-colors touch-manipulation"
        >
          <MessageCircle className="h-5 w-5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export default StickyMobileCTAs;

