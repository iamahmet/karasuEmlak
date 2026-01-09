"use client";

import Link from 'next/link';
import { Link2, Home, Map, Building2, FileText, Phone } from 'lucide-react';
import { cn } from '@karasu/lib';
import { generateSlug } from '@/lib/utils';

interface InternalLinksProps {
  propertyType: string;
  status: 'satilik' | 'kiralik';
  neighborhood: string;
  basePath?: string;
  className?: string;
}

export function InternalLinks({ propertyType, status, neighborhood, basePath = '', className }: InternalLinksProps) {
  const statusLabel = status === 'satilik' ? 'Satılık' : 'Kiralık';
  const propertyTypeLabel = propertyType === 'daire' ? 'Daire'
    : propertyType === 'villa' ? 'Villa'
    : propertyType === 'yazlik' ? 'Yazlık'
    : propertyType === 'arsa' ? 'Arsa'
    : propertyType === 'ev' ? 'Ev'
    : propertyType === 'isyeri' ? 'İşyeri'
    : 'Dükkan';

  const links = [
    {
      href: `${basePath}/`,
      label: 'Karasu Emlak',
      icon: Home,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      href: `${basePath}/${status}`,
      label: `${statusLabel} İlanlar`,
      icon: Building2,
      color: 'text-green-600 bg-green-50 border-green-200',
    },
    {
      href: `${basePath}/${status}/${propertyType}`,
      label: `${statusLabel} ${propertyTypeLabel}`,
      icon: Building2,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      href: `${basePath}/mahalle/${generateSlug(neighborhood)}`,
      label: `${neighborhood} Mahallesi`,
      icon: Map,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      href: `${basePath}/blog`,
      label: 'Emlak Rehberi',
      icon: FileText,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      href: `${basePath}/iletisim`,
      label: 'İletişim',
      icon: Phone,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
  ];

  return (
    <div className={cn("bg-gray-50 rounded-xl border-2 border-gray-200 p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="h-5 w-5 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-900">İlgili Sayfalar</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={index}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md",
                link.color
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default InternalLinks;

