/**
 * Internal Links Section Component
 * 
 * Displays contextual internal links to improve SEO and user navigation
 * Used across multiple page types
 */

import Link from 'next/link';
import { ArrowRight, MapPin, FileText, Home, TrendingUp, Calculator } from 'lucide-react';
import { cn } from '@karasu/lib';

export interface InternalLinkItem {
  href: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: 'listing' | 'guide' | 'tool' | 'hub' | 'neighborhood';
}

interface InternalLinksSectionProps {
  links: InternalLinkItem[];
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'grid';
}

const defaultIcons = {
  listing: Home,
  guide: FileText,
  tool: Calculator,
  hub: MapPin,
  neighborhood: MapPin,
};

export function InternalLinksSection({
  links,
  title = 'İlgili Sayfalar',
  description,
  className,
  variant = 'default',
}: InternalLinksSectionProps) {
  if (!links || links.length === 0) return null;

  if (variant === 'compact') {
    return (
      <section className={cn('bg-gray-50 rounded-xl p-6 border border-gray-200', className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-2">
          {links.slice(0, 4).map((link, index) => {
            const Icon = link.icon || defaultIcons[link.type || 'guide'] || FileText;
            return (
              <Link
                key={index}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  {link.description && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{link.description}</p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  if (variant === 'grid') {
    return (
      <section className={cn('bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200', className)}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {links.map((link, index) => {
            const Icon = link.icon || defaultIcons[link.type || 'guide'] || FileText;
            return (
              <Link
                key={index}
                href={link.href}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all bg-white group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {link.label}
                  </h3>
                </div>
                {link.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">{link.description}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={cn('bg-white rounded-2xl p-8 border border-gray-200', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link, index) => {
          const Icon = link.icon || defaultIcons[link.type || 'guide'] || FileText;
          return (
            <Link
              key={index}
              href={link.href}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1">
                  {link.label}
                </h3>
                {link.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{link.description}</p>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Generate internal links for a page based on context
 */
export function generateInternalLinksForPage(
  pageType: 'listing' | 'guide' | 'hub' | 'neighborhood' | 'calculator',
  basePath: string,
  context?: {
    location?: string;
    propertyType?: string;
    status?: 'satilik' | 'kiralik';
  }
): InternalLinkItem[] {
  const links: InternalLinkItem[] = [];
  const location = context?.location?.toLowerCase() || 'karasu';
  const isKarasu = location.includes('karasu');
  const isKocaali = location.includes('kocaali');

  switch (pageType) {
    case 'listing':
      // Hub links
      if (isKarasu) {
        links.push({
          href: `${basePath}/karasu`,
          label: 'Karasu Rehberi',
          description: 'Karasu hakkında detaylı bilgiler ve rehberler',
          type: 'hub',
        });
        links.push({
          href: `${basePath}/karasu-satilik-ev`,
          label: 'Karasu Satılık Ev Rehberi',
          description: 'Karasu\'da satılık ev fiyatları ve seçenekleri',
          type: 'guide',
        });
      }
      if (isKocaali) {
        links.push({
          href: `${basePath}/kocaali`,
          label: 'Kocaali Rehberi',
          description: 'Kocaali hakkında detaylı bilgiler ve rehberler',
          type: 'hub',
        });
        links.push({
          href: `${basePath}/kocaali-satilik-ev`,
          label: 'Kocaali Satılık Ev Rehberi',
          description: 'Kocaali\'de satılık ev fiyatları ve seçenekleri',
          type: 'guide',
        });
      }
      
      // Guide links
      links.push({
        href: `${basePath}/rehberler/ev-nasil-alinir`,
        label: 'Ev Nasıl Alınır?',
        description: 'Emlak alım süreci rehberi',
        type: 'guide',
      });
      links.push({
        href: `${basePath}/rehberler/kredi-nasil-alinir`,
        label: 'Kredi Nasıl Alınır?',
        description: 'Konut kredisi başvuru rehberi',
        type: 'guide',
      });
      
      // Tool links
      links.push({
        href: `${basePath}/kredi-hesaplayici`,
        label: 'Kredi Hesaplayıcı',
        description: 'Aylık ödeme ve toplam geri ödeme hesaplama',
        type: 'tool',
      });
      break;

    case 'guide':
      // Listing links
      if (isKarasu) {
        links.push({
          href: `${basePath}/karasu-satilik-ev`,
          label: 'Karasu Satılık Ev',
          description: 'Karasu\'da satılık ev ilanları',
          type: 'listing',
        });
      }
      if (isKocaali) {
        links.push({
          href: `${basePath}/kocaali-satilik-ev`,
          label: 'Kocaali Satılık Ev',
          description: 'Kocaali\'de satılık ev ilanları',
          type: 'listing',
        });
      }
      
      // Related guides
      links.push({
        href: `${basePath}/rehberler/ev-nasil-satilir`,
        label: 'Ev Nasıl Satılır?',
        description: 'Emlak satış süreci rehberi',
        type: 'guide',
      });
      links.push({
        href: `${basePath}/rehberler/tapu-islemleri`,
        label: 'Tapu İşlemleri',
        description: 'Tapu devir ve işlem rehberi',
        type: 'guide',
      });
      break;

    case 'hub':
      // Listing links
      links.push({
        href: `${basePath}/satilik`,
        label: 'Satılık İlanlar',
        description: 'Tüm satılık emlak ilanları',
        type: 'listing',
      });
      links.push({
        href: `${basePath}/kiralik`,
        label: 'Kiralık İlanlar',
        description: 'Tüm kiralık emlak ilanları',
        type: 'listing',
      });
      
      // Guide links
      links.push({
        href: `${basePath}/rehber`,
        label: 'Emlak Rehberleri',
        description: 'Emlak alım-satım rehberleri',
        type: 'guide',
      });
      break;

    case 'neighborhood':
      // Listing links
      links.push({
        href: `${basePath}/satilik?neighborhood=${context?.location || ''}`,
        label: `${context?.location || 'Bu Mahalle'} Satılık Evler`,
        description: 'Mahalledeki satılık ev ilanları',
        type: 'listing',
      });
      
      // Hub links
      if (isKarasu) {
        links.push({
          href: `${basePath}/karasu`,
          label: 'Karasu Rehberi',
          description: 'Karasu hakkında detaylı bilgiler',
          type: 'hub',
        });
      }
      if (isKocaali) {
        links.push({
          href: `${basePath}/kocaali`,
          label: 'Kocaali Rehberi',
          description: 'Kocaali hakkında detaylı bilgiler',
          type: 'hub',
        });
      }
      break;

    case 'calculator':
      // Guide links
      links.push({
        href: `${basePath}/rehberler/kredi-nasil-alinir`,
        label: 'Kredi Nasıl Alınır?',
        description: 'Konut kredisi başvuru rehberi',
        type: 'guide',
      });
      links.push({
        href: `${basePath}/rehberler/ev-nasil-alinir`,
        label: 'Ev Nasıl Alınır?',
        description: 'Emlak alım süreci rehberi',
        type: 'guide',
      });
      
      // Listing links
      links.push({
        href: `${basePath}/satilik`,
        label: 'Satılık İlanlar',
        description: 'Kredi ile alabileceğiniz evler',
        type: 'listing',
      });
      break;
  }

  return links.slice(0, 6);
}
