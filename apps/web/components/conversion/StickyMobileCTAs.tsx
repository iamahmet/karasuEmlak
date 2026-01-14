"use client";

import { Phone, MessageCircle, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@karasu/lib';
import { FavoriteButton } from '@/components/listings/FavoriteButton';

interface StickyMobileCTAsProps {
  propertyTitle: string;
  propertyId: string;
  className?: string;
}

export function StickyMobileCTAs({ propertyTitle, propertyId, className }: StickyMobileCTAsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
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

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 md:hidden print:hidden",
      "bg-white border-t-2 border-gray-200 shadow-2xl shadow-black/10",
      "safe-area-inset-bottom",
      className
    )}>
      <div className="flex items-center gap-2 p-4">
        {/* Secondary Actions */}
        <div className="flex items-center gap-2">
          <FavoriteButton 
            listingId={propertyId} 
            listingTitle={propertyTitle}
            variant="mobile"
          />

          <button
            onClick={handleShare}
            className="p-3 rounded-xl border-2 bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 transition-all duration-200"
            aria-label="Paylaş"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Actions */}
        <div className="flex-1 flex items-center gap-2">
          <a
            href="tel:+905325933854"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#006AFF] hover:bg-[#0052CC] text-white rounded-xl font-semibold transition-colors"
          >
            <Phone className="h-5 w-5" />
            <span>Ara</span>
          </a>

          <a
            href="https://wa.me/905325933854"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-xl font-semibold transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default StickyMobileCTAs;

