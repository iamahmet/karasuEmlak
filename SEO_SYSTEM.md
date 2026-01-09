# SEO System - KarasuEmlak v4

## Core Principles

- **Systematic > Ad-hoc**: Consistent SEO patterns, not one-off tricks
- **siteConfig as Single Source of Truth**: All SEO data from one place
- **Per-Page Schema**: Schema injected per-page, not globally
- **Dynamic Sitemaps**: Generated from database, not static files
- **Canonical URLs**: Always correct, with hreflang support

## siteConfig (`packages/config/site-config.ts`)

Single source of truth for all SEO data:

```typescript
export const siteConfig = {
  name: 'Karasu Emlak',
  url: 'https://karasuemlak.net',
  description: '...',
  // ...
};
```

**Never hardcode SEO data** - always use `siteConfig`.

## Metadata System

### Page-Level Metadata
Each page generates its own metadata:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/path' 
    : `/${locale}/path`;

  return {
    title: 'Page Title',
    description: 'Page description',
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Page Title',
      description: 'Page description',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}
```

### Locale Handling
- Default locale (`tr`): No prefix in URL
- Other locales: `/{locale}/path`
- Canonical always points to correct locale version
- hreflang tags for all locales (when enabled)

## Schema.org Implementation

### Organization Schema
- Cached (static data)
- Injected in locale layout
- Uses `siteConfig` for all data

### Page-Specific Schema
- Article schema for blog posts
- RealEstateListing schema for listings
- FAQ schema for FAQ pages
- BreadcrumbList schema for navigation

### Schema Injection
```typescript
import { StructuredData } from '@/components/seo/StructuredData';

<StructuredData data={schema} />
```

**Never inject schema globally** - only per-page.

## Sitemap System

### Dynamic Sitemap (`apps/web/app/sitemap.ts`)
Generates sitemap from:
- Static pages
- Listings (published only)
- Neighborhoods (published only)
- Blog articles (published only)
- News articles (published only)
- FAQ pages

### Sitemap Structure
```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  
  return [
    // Static pages
    { url: `${baseUrl}/`, lastModified: new Date() },
    // Dynamic pages from database
    ...listings.map(listing => ({
      url: `${baseUrl}/ilan/${listing.slug}`,
      lastModified: new Date(listing.updated_at),
    })),
  ];
}
```

### lastModified
- Only changes on meaningful updates
- Not on every request
- Cached when possible

## Robots.txt

### Static Robots (`apps/web/app/robots.ts`)
```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

## Internal Linking

### Strategy
- Related listings on detail pages
- Related articles on blog posts
- Neighborhood links in content
- Breadcrumb navigation

### Implementation
- Automatic related content
- Manual internal links in content
- Breadcrumb schema for navigation

## Image SEO

### Alt Text
- Always required
- Descriptive, not generic
- AI-generated alt text flagged
- Manual override available

### Image Optimization
- Cloudinary for all images
- WebP/AVIF formats
- Responsive sizing
- Lazy loading

## Content SEO

### Blog Articles
- Unique, valuable content
- SEO metadata per article
- Category and tag structure
- Related articles

### News Articles
- Factual summaries only
- Real estate analysis
- Related neighborhoods
- Related listings

### Programmatic SEO
- Neighborhood pages
- Property type pages
- Location-based pages
- Quality gate before publishing

## Performance SEO

### Core Web Vitals
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1
- Tracked via Web Vitals component

### Page Speed
- Timeout all data fetching
- Lazy load heavy components
- Optimize images
- Minimize blocking resources

## Monitoring

### SEO Events (`seo_events` table)
- Listing published
- Article published
- Neighborhood published
- Content generated
- Schema generated
- Sitemap generated

### Analytics
- Google Search Console integration
- GA4 events
- First-party event lake
- Performance metrics

## Best Practices

### DO
- ✅ Use `siteConfig` for all SEO data
- ✅ Generate metadata per-page
- ✅ Inject schema per-page
- ✅ Use canonical URLs
- ✅ Add hreflang tags
- ✅ Optimize images
- ✅ Track SEO events

### DON'T
- ❌ Hardcode SEO data
- ❌ Inject schema globally
- ❌ Skip canonical URLs
- ❌ Use generic alt text
- ❌ Block rendering for SEO
- ❌ Generate low-quality content

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEV_RULES.md](./DEV_RULES.md) - Development rules
- [RUNBOOK.md](./RUNBOOK.md) - Operations guide

