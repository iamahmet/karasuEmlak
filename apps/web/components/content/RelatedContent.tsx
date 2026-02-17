/**
 * Related Content Component
 * Displays related listings, articles, neighborhoods with internal links
 */

import Link from 'next/link';
import { Card, CardContent } from '@karasu/ui';
import { ArrowRight, Home, FileText, MapPin } from 'lucide-react';
import { CardImage } from '@/components/images';

interface RelatedItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  type: 'listing' | 'article' | 'neighborhood';
}

interface RelatedContentProps {
  items: RelatedItem[];
  title?: string;
  type?: 'listings' | 'articles' | 'neighborhoods' | 'mixed';
  className?: string;
}

export function RelatedContent({
  items,
  title,
  type = 'mixed',
  className = '',
}: RelatedContentProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const defaultTitle = type === 'listings'
    ? 'İlgili İlanlar'
    : type === 'articles'
    ? 'İlgili Yazılar'
    : type === 'neighborhoods'
    ? 'İlgili Mahalleler'
    : 'İlgili İçerikler';

  const getIcon = (itemType: string) => {
    switch (itemType) {
      case 'listing':
        return Home;
      case 'article':
        return FileText;
      case 'neighborhood':
        return MapPin;
      default:
        return FileText;
    }
  };

  const getHref = (item: RelatedItem) => {
    switch (item.type) {
      case 'listing':
        return `/ilan/${item.slug}`;
      case 'article':
        return `/blog/${item.slug}`;
      case 'neighborhood':
        return `/mahalle/${item.slug}`;
      default:
        return '#';
    }
  };

  return (
    <section className={`mb-8 md:mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          {title || defaultTitle}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item) => {
          const Icon = getIcon(item.type);
          const href = getHref(item);

          return (
            <Link key={item.id} href={href}>
              <Card className="hover:shadow-lg transition-all duration-200 h-full group">
                <CardContent className="p-0">
                  {item.image && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <CardImage
                        publicId={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        {item.type === 'listing' ? 'İlan' : item.type === 'article' ? 'Yazı' : 'Mahalle'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      <span>Detayları Gör</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
