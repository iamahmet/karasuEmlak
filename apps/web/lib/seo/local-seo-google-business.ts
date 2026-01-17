/**
 * Google Business Profile Integration
 * Local SEO optimization for Google Business Profile
 */

import { siteConfig } from '@karasu-emlak/config';

export interface GoogleBusinessProfile {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  url: string;
  openingHours?: string[];
  priceRange?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

/**
 * Default Google Business Profile data
 */
export const defaultGoogleBusinessProfile: GoogleBusinessProfile = {
  name: siteConfig.name,
  address: {
    streetAddress: 'Karasu Merkez', // Update with actual address
    addressLocality: 'Karasu',
    addressRegion: 'Sakarya',
    postalCode: '54500',
    addressCountry: 'TR',
  },
  telephone: '+90 XXX XXX XX XX', // Update with actual phone
  url: siteConfig.url,
  openingHours: [
    'Mo-Fr 09:00-18:00',
    'Sa 09:00-13:00',
  ],
  priceRange: '$$',
};

/**
 * Generate Google Business Profile schema
 */
export function generateGoogleBusinessProfileSchema(
  profile: GoogleBusinessProfile = defaultGoogleBusinessProfile
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: profile.name,
    url: profile.url,
    telephone: profile.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile.address.streetAddress,
      addressLocality: profile.address.addressLocality,
      addressRegion: profile.address.addressRegion,
      postalCode: profile.address.postalCode,
      addressCountry: profile.address.addressCountry,
    },
    ...(profile.openingHours && {
      openingHoursSpecification: profile.openingHours.map((hours) => {
        const [days, time] = hours.split(' ');
        const [open, close] = time.split('-');
        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: days.split('-').map((day) => {
            const dayMap: Record<string, string> = {
              Mo: 'Monday',
              Tu: 'Tuesday',
              We: 'Wednesday',
              Th: 'Thursday',
              Fr: 'Friday',
              Sa: 'Saturday',
              Su: 'Sunday',
            };
            return dayMap[day] || day;
          }),
          opens: open,
          closes: close,
        };
      }),
    }),
    ...(profile.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: profile.aggregateRating.ratingValue,
        reviewCount: profile.aggregateRating.reviewCount,
      },
    }),
    priceRange: profile.priceRange,
    areaServed: [
      {
        '@type': 'City',
        name: 'Karasu',
      },
      {
        '@type': 'City',
        name: 'Kocaali',
      },
      {
        '@type': 'State',
        name: 'Sakarya',
      },
    ],
  };
}

/**
 * Generate local citations data
 */
export function generateLocalCitations() {
  return {
    name: siteConfig.name,
    address: defaultGoogleBusinessProfile.address,
    phone: defaultGoogleBusinessProfile.telephone,
    website: siteConfig.url,
    categories: ['Real Estate Agency', 'Emlak Ofisi'],
    description: siteConfig.description,
  };
}

/**
 * Get Google Business Profile verification meta tag
 */
export function getGoogleBusinessVerificationMeta(verificationCode?: string): {
  'google-site-verification'?: string;
} {
  if (!verificationCode) {
    return {};
  }

  return {
    'google-site-verification': verificationCode,
  };
}
