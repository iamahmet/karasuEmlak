'use client';

import { Phone, Mail, MapPin, MessageCircle, Shield, Award, Clock } from 'lucide-react';
import { napData } from '@karasu-emlak/config/nap';
import Link from 'next/link';

interface TrustSignalsBarProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function TrustSignalsBar({ variant = 'full', className = '' }: TrustSignalsBarProps) {
  const whatsappNumber = napData.contact.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
        <a
          href={`tel:${napData.contact.phone}`}
          className="flex items-center gap-2 text-primary hover:underline"
          aria-label="Telefon"
        >
          <Phone className="h-4 w-4" />
          <span>{napData.contact.phoneFormatted}</span>
        </a>
        <a
          href={`mailto:${napData.contact.email}`}
          className="flex items-center gap-2 text-primary hover:underline"
          aria-label="E-posta"
        >
          <Mail className="h-4 w-4" />
          <span>{napData.contact.email}</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[#25D366] hover:underline"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Phone */}
        <a
          href={`tel:${napData.contact.phone}`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
          aria-label="Telefon ile ara"
        >
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Telefon</div>
            <div className="text-sm font-semibold text-gray-900">{napData.contact.phoneFormatted}</div>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
          aria-label="WhatsApp ile mesaj gönder"
        >
          <div className="p-2 bg-[#25D366]/10 rounded-lg group-hover:bg-[#25D366]/20 transition-colors">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
          </div>
          <div>
            <div className="text-xs text-gray-500">WhatsApp</div>
            <div className="text-sm font-semibold text-gray-900">Hemen Mesaj Gönder</div>
          </div>
        </a>

        {/* Email */}
        <a
          href={`mailto:${napData.contact.email}`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
          aria-label="E-posta gönder"
        >
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-gray-500">E-posta</div>
            <div className="text-sm font-semibold text-gray-900">{napData.contact.email}</div>
          </div>
        </a>

        {/* Address */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Adres</div>
            <div className="text-sm font-semibold text-gray-900">{napData.address.city}, {napData.address.province}</div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Lisanslı Emlak Ofisi</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Award className="h-4 w-4 text-blue-600" />
          <span>15+ Yıl Deneyim</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="h-4 w-4 text-orange-600" />
          <span>7/24 Destek</span>
        </div>
      </div>
    </div>
  );
}
