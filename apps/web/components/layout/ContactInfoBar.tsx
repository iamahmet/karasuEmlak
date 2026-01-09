"use client";

import { Phone, Mail, MessageCircle } from 'lucide-react';
import { napData } from '@karasu-emlak/config/nap';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ContactInfoBarProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function ContactInfoBar({ className, variant = 'default' }: ContactInfoBarProps) {
  const whatsappNumber = napData.contact.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-4 md:gap-6 px-4 py-3 bg-blue-50/80 backdrop-blur-sm border-b border-blue-100/60", className)}>
        <a
          href={`tel:${napData.contact.phone}`}
          className="flex items-center gap-2.5 text-slate-700 hover:text-[#006AFF] transition-colors group"
          aria-label="Telefon ile ara"
        >
          <div className="p-1.5 bg-white/60 rounded-lg group-hover:bg-white/80 transition-colors">
            <Phone className="h-4 w-4 text-[#006AFF]" strokeWidth={2.5} />
          </div>
          <span className="text-sm md:text-base font-semibold tracking-tight">{napData.contact.phoneFormatted}</span>
        </a>
        <a
          href={`mailto:${napData.contact.email}`}
          className="flex items-center gap-2.5 text-slate-700 hover:text-[#006AFF] transition-colors group"
          aria-label="E-posta gönder"
        >
          <div className="p-1.5 bg-white/60 rounded-lg group-hover:bg-white/80 transition-colors">
            <Mail className="h-4 w-4 text-[#006AFF]" strokeWidth={2.5} />
          </div>
          <span className="text-sm md:text-base font-semibold tracking-tight">{napData.contact.email}</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-slate-700 hover:text-[#25D366] transition-colors group"
          aria-label="WhatsApp ile mesaj gönder"
        >
          <div className="p-1.5 bg-white/60 rounded-lg group-hover:bg-white/80 transition-colors">
            <MessageCircle className="h-4 w-4 text-[#25D366]" strokeWidth={2.5} />
          </div>
          <span className="text-sm md:text-base font-semibold tracking-tight">WhatsApp</span>
        </a>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-gradient-to-br from-blue-50 via-cyan-50/50 to-blue-50/30 backdrop-blur-sm border-b border-blue-100/60 shadow-sm", className)}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10 py-4 md:py-5">
          {/* Phone */}
          <a
            href={`tel:${napData.contact.phone}`}
            className="flex items-center gap-3 px-4 py-2.5 bg-white/70 hover:bg-white rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md border border-white/80"
            aria-label="Telefon ile ara"
          >
            <div className="p-2 bg-[#006AFF]/10 rounded-lg group-hover:bg-[#006AFF]/15 transition-colors">
              <Phone className="h-5 w-5 text-[#006AFF]" strokeWidth={2.5} />
            </div>
            <span className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{napData.contact.phoneFormatted}</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${napData.contact.email}`}
            className="flex items-center gap-3 px-4 py-2.5 bg-white/70 hover:bg-white rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md border border-white/80"
            aria-label="E-posta gönder"
          >
            <div className="p-2 bg-[#006AFF]/10 rounded-lg group-hover:bg-[#006AFF]/15 transition-colors">
              <Mail className="h-5 w-5 text-[#006AFF]" strokeWidth={2.5} />
            </div>
            <span className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{napData.contact.email}</span>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 bg-white/70 hover:bg-white rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md border border-white/80"
            aria-label="WhatsApp ile mesaj gönder"
          >
            <div className="p-2 bg-[#25D366]/10 rounded-lg group-hover:bg-[#25D366]/15 transition-colors">
              <MessageCircle className="h-5 w-5 text-[#25D366]" strokeWidth={2.5} />
            </div>
            <span className="text-base md:text-lg font-bold text-slate-900 tracking-tight">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
