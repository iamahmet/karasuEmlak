"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { napData } from '@karasu-emlak/config/nap';
import { cn } from '@/lib/utils';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const whatsappNumber = napData.contact.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Merhaba, Karasu Emlak hakkında bilgi almak istiyorum.`;

  const defaultMessage = encodeURIComponent('Merhaba, Karasu Emlak hakkında bilgi almak istiyorum.');

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg transition-all duration-300",
            "flex items-center justify-center w-14 h-14",
            "hover:scale-110 active:scale-95",
            isOpen && "rotate-90"
          )}
          aria-label="WhatsApp ile iletişime geç"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Popup Card - Fixed positioning for proper z-index */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl border p-4 animate-in slide-in-from-bottom-4 z-40">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-[#25D366] rounded-full p-2">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">WhatsApp ile İletişim</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Sorularınız için bize yazın
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Mesaj Gönder
            </a>
            <a
              href={`tel:${napData.contact.phone}`}
              className="block w-full border border-gray-300 hover:bg-gray-50 text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {napData.contact.phoneFormatted}
            </a>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Çalışma saatleri: {napData.businessHours.weekdays}
          </p>
        </div>
      )}
    </>
  );
}

