import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@karasu/lib';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { siteConfig } from '@karasu-emlak/config';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  // Generate breadcrumb schema
  const breadcrumbItems: Array<{ name: string; url: string }> = [
    { name: 'Ana Sayfa', url: siteConfig.url },
    ...items
      .filter((item): item is { label: string; href: string } => item.href !== undefined)
      .map((item) => ({
        name: item.label,
        url: `${siteConfig.url}${item.href}`,
      })),
  ];

  const breadcrumbSchema = breadcrumbItems.length > 0 
    ? generateBreadcrumbSchema(breadcrumbItems)
    : null;

  return (
    <>
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      <nav
        aria-label="Breadcrumb"
        className={cn(
          'flex items-center space-x-2 text-sm bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200',
          className
        )}
      >
        <Link
          href="/"
          className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
          aria-label="Ana Sayfa"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Ana Sayfa</span>
        </Link>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors font-medium text-gray-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(
                  isLast ? 'text-gray-900 font-semibold' : 'text-gray-600',
                  'truncate max-w-[200px] sm:max-w-none'
                )}>
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

