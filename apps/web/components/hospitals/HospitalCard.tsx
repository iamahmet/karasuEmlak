'use client';

import { Card, CardContent } from '@karasu/ui';
import { Phone, MapPin, AlertCircle, Building2, Stethoscope, Heart } from 'lucide-react';
import Link from 'next/link';
import type { HospitalLocation } from '../maps/HospitalsMap';

interface HospitalCardProps {
  hospital: HospitalLocation & { aciklama?: string };
  basePath?: string;
}

const typeIcons = {
  hastane: AlertCircle,
  'saglik-merkezi': Stethoscope,
  'ozel-saglik': Heart,
};

const typeColors = {
  hastane: {
    bg: 'from-red-50 to-pink-50',
    icon: 'text-red-600',
    border: 'border-red-100',
  },
  'saglik-merkezi': {
    bg: 'from-blue-50 to-cyan-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  'ozel-saglik': {
    bg: 'from-purple-50 to-indigo-50',
    icon: 'text-purple-600',
    border: 'border-purple-100',
  },
};

export function HospitalCard({ hospital, basePath = '' }: HospitalCardProps) {
  const Icon = typeIcons[hospital.type] || Building2;
  const colors = typeColors[hospital.type] || typeColors.hastane;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${colors.border} border-2`}>
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
              {hospital.name}
            </h3>
            {hospital.aciklama && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                {hospital.aciklama}
              </p>
            )}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 break-words">{hospital.address}</span>
              </div>
              {hospital.phone && (
                <a
                  href={`tel:${hospital.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors group/link"
                  aria-label={`${hospital.name} telefon: ${hospital.phone}`}
                >
                  <Phone className="h-4 w-4 group-hover/link:scale-110 transition-transform" />
                  <span>{hospital.phone}</span>
                </a>
              )}
              <div className="pt-2">
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  Haritada göster
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
