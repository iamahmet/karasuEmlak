import Link from 'next/link';
import { Home, ArrowRight, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface RelatedListingsCTAProps {
  basePath: string;
  articleTitle: string;
  articleContent?: string;
  className?: string;
}

// Determine relevant listing categories based on article content
function getRelevantListings(title: string, content?: string): Array<{
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  type: 'primary' | 'secondary';
}> {
  const text = `${title} ${content || ''}`.toLowerCase();
  const listings: Array<{
    href: string;
    label: string;
    description: string;
    icon: React.ElementType;
    type: 'primary' | 'secondary';
  }> = [];

  // Karasu specific
  if (text.includes('karasu')) {
    listings.push({
      href: '/karasu-satilik-ev',
      label: 'Karasu Satılık Evler',
      description: 'Karasu\'da satılık ev ilanlarını inceleyin',
      icon: Home,
      type: 'primary',
    });

    if (text.includes('deniz') || text.includes('sahil') || text.includes('plaj')) {
      listings.push({
        href: '/karasu-denize-yakin-satilik-ev',
        label: 'Denize Yakın Evler',
        description: 'Sahil bölgesinde satılık evler',
        icon: MapPin,
        type: 'secondary',
      });
    }

    if (text.includes('yatırım') || text.includes('yatirim') || text.includes('kazanç')) {
      listings.push({
        href: '/karasu-yatirimlik-satilik-ev',
        label: 'Yatırımlık Gayrimenkuller',
        description: 'Yatırım amaçlı emlak fırsatları',
        icon: TrendingUp,
        type: 'secondary',
      });
    }

    if (text.includes('merkez')) {
      listings.push({
        href: '/karasu-merkez-satilik-ev',
        label: 'Merkez Satılık Evler',
        description: 'Karasu merkezde satılık evler',
        icon: MapPin,
        type: 'secondary',
      });
    }
  }

  // Kocaali specific
  if (text.includes('kocaali')) {
    listings.push({
      href: '/kocaali-satilik-ev',
      label: 'Kocaali Satılık Evler',
      description: 'Kocaali\'de satılık ev ilanlarını inceleyin',
      icon: Home,
      type: 'primary',
    });

    if (text.includes('yatırım') || text.includes('yatirim')) {
      listings.push({
        href: '/kocaali-yatirimlik-gayrimenkul',
        label: 'Kocaali Yatırımlık',
        description: 'Yatırım amaçlı emlak fırsatları',
        icon: TrendingUp,
        type: 'secondary',
      });
    }
  }

  // General listings if no specific match
  if (listings.length === 0) {
    listings.push(
      {
        href: '/satilik',
        label: 'Satılık İlanlar',
        description: 'Tüm satılık emlak ilanlarını görüntüleyin',
        icon: Home,
        type: 'primary',
      },
      {
        href: '/kiralik',
        label: 'Kiralık İlanlar',
        description: 'Kiralık emlak seçeneklerini inceleyin',
        icon: MapPin,
        type: 'secondary',
      }
    );
  }

  // Limit to 3 listings
  return listings.slice(0, 3);
}

export function RelatedListingsCTA({
  basePath,
  articleTitle,
  articleContent,
  className,
}: RelatedListingsCTAProps) {
  const listings = getRelevantListings(articleTitle, articleContent);
  const primaryListing = listings.find((l) => l.type === 'primary');
  const secondaryListings = listings.filter((l) => l.type === 'secondary');

  return (
    <aside
      className={cn(
        'rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-blue-50 border border-primary/20',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">İlgili İlanlar</h3>
            <p className="text-sm text-gray-600">Bu konuyla ilgili emlak seçenekleri</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Primary CTA */}
        {primaryListing && (
          <Link
            href={`${basePath}${primaryListing.href}`}
            className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 mb-4 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <primaryListing.icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {primaryListing.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{primaryListing.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>
        )}

        {/* Secondary CTAs */}
        {secondaryListings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryListings.map((listing, index) => (
              <Link
                key={index}
                href={`${basePath}${listing.href}`}
                className="flex items-center gap-3 p-4 bg-white/80 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 group"
              >
                <listing.icon className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                  {listing.label}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-5 pt-5 border-t border-primary/10">
          <Button asChild variant="default" className="w-full">
            <Link href={`${basePath}/satilik`}>
              Tüm İlanları Görüntüle
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
