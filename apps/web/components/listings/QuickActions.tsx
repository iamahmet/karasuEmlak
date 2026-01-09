"use client";

import { Phone, MessageCircle, Download, Calendar } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { EnhancedShareButtons } from '@/components/share/EnhancedShareButtons';

interface QuickActionsProps {
  propertyId: string;
  propertyTitle: string;
  propertySlug?: string;
  propertyImage?: string;
  propertyDescription?: string;
  className?: string;
}

export function QuickActions({ 
  propertyId, 
  propertyTitle, 
  propertySlug,
  propertyImage,
  propertyDescription,
  className 
}: QuickActionsProps) {

  const handleDownload = () => {
    // In production, generate PDF brochure
    window.print();
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Primary Actions */}
      <Button
        size="lg"
        className="flex-1 md:flex-none bg-[#006AFF] hover:bg-[#0052CC] text-white font-semibold"
        asChild
      >
        <a href="tel:+905466395461">
          <Phone className="h-4 w-4 mr-2" />
          Hemen Ara
        </a>
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="flex-1 md:flex-none border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold"
        asChild
      >
        <a href="https://wa.me/905466395461" target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </a>
      </Button>

      {/* Secondary Actions */}
      <FavoriteButton 
        listingId={propertyId} 
        listingTitle={propertyTitle}
        variant="detail"
      />

      {/* Share Button - Enhanced (only on desktop, compact on mobile) */}
      <div className="hidden md:block">
        <EnhancedShareButtons
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={propertyTitle}
          description={propertyDescription || `Bu ilanı inceleyin: ${propertyTitle}`}
          image={propertyImage}
          variant="compact"
          listingId={propertyId}
          listingSlug={propertySlug}
        />
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={handleDownload}
        className="border-2 border-gray-300 hover:border-gray-400"
        aria-label="PDF İndir"
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="border-2 border-gray-300 hover:border-gray-400"
        aria-label="Randevu Al"
      >
        <Calendar className="h-4 w-4 mr-2" />
        <span className="hidden md:inline">Randevu</span>
      </Button>
    </div>
  );
}

export default QuickActions;

