/**
 * Local SEO Schemas for Real Estate
 * 
 * Comprehensive local SEO schema generation for:
 * - RealEstateAgent (main business)
 * - Place/City (location pages)
 * - Service (services offered)
 * - AggregateRating (reviews)
 * - GeoCoordinates (location data)
 */

import { siteConfig } from '@karasu-emlak/config';

/**
 * Generate comprehensive RealEstateAgent schema with all local SEO fields
 */
export function generateRealEstateAgentLocalSchema(params?: {
  includeRating?: boolean;
  includeServices?: boolean;
  includeAreaServed?: boolean;
}): object {
  const {
    includeRating = true,
    includeServices = true,
    includeAreaServed = true,
  } = params || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo.png`,
      width: 200,
      height: 60,
    },
    image: `${siteConfig.url}/og-image.jpg`,
    description: 'Karasu ve çevresinde 15+ yıllık deneyimle emlak danışmanlığı hizmeti. Satılık ve kiralık daire, villa, yazlık, arsa ilanları.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plaj Caddesi',
      addressLocality: 'Karasu',
      addressRegion: 'Sakarya',
      postalCode: '54500',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.0969,
      longitude: 30.6934,
    },
    telephone: '+905466395461',
    email: 'info@karasuemlak.net',
    ...(includeAreaServed && {
      areaServed: [
        {
          '@type': 'City',
          name: 'Karasu',
          containedIn: {
            '@type': 'State',
            name: 'Sakarya',
          },
        },
        {
          '@type': 'City',
          name: 'Kocaali',
          containedIn: {
            '@type': 'State',
            name: 'Sakarya',
          },
        },
      ],
      // ServiceArea for better local SEO (always included when areaServed is included)
      serviceArea: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 41.0735, // Center point between Karasu and Kocaali
          longitude: 30.7750,
        },
        geoRadius: {
          '@type': 'Distance',
          value: 25, // 25 km radius
          unitCode: 'KMT', // Kilometers
        },
      },
    }),
    priceRange: '₺₺',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '15:00',
      },
    ],
    ...(includeRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '156',
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(includeServices && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Emlak Hizmetleri',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Satılık Emlak Danışmanlığı',
              description: 'Karasu ve Kocaali\'de satılık daire, villa, yazlık, arsa ilanları',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Kiralık Emlak Danışmanlığı',
              description: 'Karasu ve Kocaali\'de kiralık daire, villa, yazlık ilanları',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Emlak Değerleme',
              description: 'Profesyonel emlak değerleme hizmeti',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Hukuki Destek',
              description: 'Emlak alım-satım süreçlerinde hukuki danışmanlık',
            },
          },
        ],
      },
    }),
    paymentAccepted: ['Cash', 'Credit Card', 'Bank Transfer'],
    currenciesAccepted: 'TRY',
    sameAs: [
      'https://www.facebook.com/karasuemlak',
      'https://www.instagram.com/karasuemlak',
      'https://twitter.com/karasuemlak',
    ],
  };
}

/**
 * Generate Place schema for city/location pages
 */
export function generatePlaceSchema({
  name,
  description,
  address,
  geo,
  image,
  url,
  containedIn,
}: {
  name: string;
  description?: string;
  address: {
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
    postalCode?: string;
    streetAddress?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  image?: string;
  url?: string;
  containedIn?: {
    '@type': string;
    name: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name,
    ...(description && { description }),
    ...(image && { image }),
    ...(url && { url }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      addressCountry: address.addressCountry,
      ...(address.postalCode && { postalCode: address.postalCode }),
      ...(address.streetAddress && { streetAddress: address.streetAddress }),
    },
    ...(geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    ...(containedIn && { containedIn }),
  };
}

/**
 * Generate Service schema for real estate services
 */
export function generateServiceSchema({
  name,
  description,
  provider,
  areaServed,
  serviceType,
  offers,
}: {
  name: string;
  description: string;
  provider?: {
    name: string;
    url: string;
  };
  areaServed?: Array<{
    '@type': string;
    name: string;
  }>;
  serviceType?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    ...(provider && {
      provider: {
        '@type': 'RealEstateAgent',
        name: provider.name,
        url: provider.url,
      },
    }),
    ...(areaServed && areaServed.length > 0 && { areaServed }),
    ...(serviceType && { serviceType }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        ...(offers.price && { price: offers.price }),
        ...(offers.priceCurrency && { priceCurrency: offers.priceCurrency }),
      },
    }),
  };
}

/**
 * Generate WebSite schema with search functionality
 */
export function generateWebSiteSchema(searchUrl?: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteConfig.url}${searchUrl}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
    publisher: {
      '@type': 'RealEstateAgent',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

/**
 * Generate ItemList schema for listings
 */
export function generateItemListSchema({
  name,
  description,
  items,
  numberOfItems,
}: {
  name: string;
  description?: string;
  items: Array<{
    '@type': string;
    name: string;
    url: string;
    image?: string;
    description?: string;
  }>;
  numberOfItems?: number;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    ...(description && { description }),
    numberOfItems: numberOfItems || items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': item['@type'],
        name: item.name,
        url: item.url,
        ...(item.image && { image: item.image }),
        ...(item.description && { description: item.description }),
      },
    })),
  };
}

/**
 * Generate Review schema for individual reviews
 */
export function generateReviewSchema({
  authorName,
  authorUrl,
  datePublished,
  reviewBody,
  reviewRating,
  itemReviewed,
}: {
  authorName: string;
  authorUrl?: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  itemReviewed?: {
    '@type': string;
    name: string;
    url?: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    datePublished,
    reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: reviewRating.ratingValue,
      bestRating: reviewRating.bestRating || 5,
      worstRating: reviewRating.worstRating || 1,
    },
    ...(itemReviewed && { itemReviewed }),
  };
}

/**
 * Generate ReviewCollection schema for review pages
 */
export function generateReviewCollectionSchema({
  name,
  description,
  reviews,
  aggregateRating,
}: {
  name: string;
  description?: string;
  reviews: Array<{
    authorName: string;
    authorUrl?: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    ...(description && { description }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
        worstRating: aggregateRating.worstRating || 1,
      },
    }),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: reviews.length,
      itemListElement: reviews.map((review, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: generateReviewSchema({
          authorName: review.authorName,
          authorUrl: review.authorUrl,
          datePublished: review.datePublished,
          reviewBody: review.reviewBody,
          reviewRating: {
            ratingValue: review.reviewRating,
          },
        }),
      })),
    },
  };
}

/**
 * Generate ServiceArea schema for service coverage
 */
export function generateServiceAreaSchema({
  serviceType,
  areaServed,
  provider,
}: {
  serviceType: string;
  areaServed: Array<{
    '@type': string;
    name: string;
    containedIn?: {
      '@type': string;
      name: string;
    };
  }>;
  provider?: {
    '@type': string;
    name: string;
    url: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType,
    ...(provider && { provider }),
    areaServed: areaServed.map(area => ({
      '@type': area['@type'],
      name: area.name,
      ...(area.containedIn && { containedIn: area.containedIn }),
    })),
  };
}
