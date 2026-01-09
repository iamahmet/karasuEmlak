import { siteConfig } from '@karasu-emlak/config';

export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    '@type': string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  contactPoint?: {
    '@type': string;
    telephone: string;
    contactType: string;
  };
  employee?: Array<{
    '@type': string;
    name: string;
    jobTitle: string;
    description?: string;
  }>;
}

export interface RealEstateAgentSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    '@type': string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
}

export interface PersonSchema {
  '@context': string;
  '@type': string;
  name: string;
  jobTitle?: string;
  description?: string;
  email?: string;
  telephone?: string;
  url?: string;
  worksFor?: {
    '@type': string;
    name: string;
    url?: string;
  };
}

export interface ArticleSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description?: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
}

export interface NewsArticleSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description?: string;
  image?: string[];
  datePublished: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
}

export interface RealEstateListingSchema {
  '@context': string;
  '@type': string | string[];
  name: string;
  description?: string;
  image?: string[];
  address?: {
    '@type': string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
    streetAddress?: string;
  };
  geo?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  offers?: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
    url?: string;
  };
  numberOfRooms?: number;
  numberOfBathroomsTotal?: number;
  floorSize?: {
    '@type': string;
    value: number;
    unitCode: string;
  };
  yearBuilt?: number;
  additionalProperty?: Array<{
    '@type': string;
    name: string;
    value: string | number | boolean;
  }>;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(params?: {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  employees?: Array<{ name: string; jobTitle: string; description?: string }>;
}): OrganizationSchema {
  if (params) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: params.name || siteConfig.name,
      url: params.url || siteConfig.url,
      logo: params.logo || `${siteConfig.url}/logo.png`,
      description: params.description || siteConfig.description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Karasu',
        addressRegion: 'Sakarya',
        addressCountry: 'TR',
      },
      ...(params.employees && params.employees.length > 0 && {
        employee: params.employees.map(emp => ({
          '@type': 'Person',
          name: emp.name,
          jobTitle: emp.jobTitle,
          ...(emp.description && { description: emp.description }),
        })),
      }),
    };
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karasu',
      addressRegion: 'Sakarya',
      addressCountry: 'TR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-555-123-45-67',
      contactType: 'customer service',
    },
  };
}

/**
 * Generate Person schema
 */
export function generatePersonSchema({
  name,
  jobTitle,
  description,
  email,
  telephone,
  url,
  worksFor,
}: {
  name: string;
  jobTitle?: string;
  description?: string;
  email?: string;
  telephone?: string;
  url?: string;
  worksFor?: {
    name: string;
    url?: string;
  };
}): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    ...(jobTitle && { jobTitle }),
    ...(description && { description }),
    ...(email && { email }),
    ...(telephone && { telephone }),
    ...(url && { url }),
    ...(worksFor && {
      worksFor: {
        '@type': 'Organization',
        name: worksFor.name,
        ...(worksFor.url && { url: worksFor.url }),
      },
    }),
  };
}

/**
 * Generate RealEstateAgent schema
 */
export function generateRealEstateAgentSchema(): RealEstateAgentSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karasu',
      addressRegion: 'Sakarya',
      addressCountry: 'TR',
    },
  };
}

/**
 * Generate Article schema
 */
export function generateArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Karasu Emlak',
}: {
  headline: string;
  description?: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author?: string;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image || [`${siteConfig.url}/og-image.jpg`],
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };
}

/**
 * Generate NewsArticle schema
 */
export function generateNewsArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Karasu Emlak',
}: {
  headline: string;
  description?: string;
  image?: string[];
  datePublished: string;
  dateModified?: string;
  author?: string;
}): NewsArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    image: image || [`${siteConfig.url}/og-image.jpg`],
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };
}

/**
 * Generate RealEstateListing schema
 */
export function generateRealEstateListingSchema({
  name,
  description,
  image,
  address,
  geo,
  price,
  priceCurrency = 'TRY',
  availability = 'https://schema.org/InStock',
  url,
  propertyType,
  numberOfRooms,
  numberOfBathrooms,
  floorSize,
  yearBuilt,
  additionalProperty,
}: {
  name: string;
  description?: string;
  image?: string[];
  address?: {
    locality: string;
    region: string;
    country: string;
    streetAddress?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  price?: number;
  priceCurrency?: string;
  availability?: string;
  url?: string;
  propertyType?: string;
  numberOfRooms?: number;
  numberOfBathrooms?: number;
  floorSize?: number;
  yearBuilt?: number;
  additionalProperty?: Array<{ '@type': string; name: string; value: string | number | boolean }>;
}): RealEstateListingSchema {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name,
    ...(description && { description }),
    image: image || [`${siteConfig.url}/og-image.jpg`],
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: address.locality,
        addressRegion: address.region,
        addressCountry: address.country,
        ...(address.streetAddress && { streetAddress: address.streetAddress }),
      },
    }),
    ...(geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency,
        availability,
        ...(url && { url }),
      },
    }),
    ...(propertyType && { 
      '@type': ['RealEstateListing', propertyType === 'villa' ? 'SingleFamilyResidence' : 'Apartment'] 
    }),
    ...(numberOfRooms && { numberOfRooms }),
    ...(numberOfBathrooms && { numberOfBathroomsTotal: numberOfBathrooms }),
    ...(floorSize && { 
      floorSize: {
        '@type': 'QuantitativeValue',
        value: floorSize,
        unitCode: 'MTK',
      }
    }),
    ...(yearBuilt && { yearBuilt }),
    ...(additionalProperty && additionalProperty.length > 0 && { additionalProperty }),
  };

  return schema;
}

/**
 * Generate BreadcrumbList Schema
 * IMPORTANT: itemListElement is REQUIRED for BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>, pageUrl?: string): object {
  if (!items || items.length === 0) {
    throw new Error('BreadcrumbList requires at least one item in itemListElement');
  }

  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(pageUrl && { '@id': `${pageUrl}#breadcrumb` }),
    itemListElement,
  };
}

/**
 * Generate FAQPage Schema
 */
export function generateFAQSchema(questions: Array<{ question: string; answer: string }>): object | null {
  if (!questions || questions.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(qa => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    })),
  };
}

/**
 * Generate LocalBusiness Schema
 */
export function generateLocalBusinessSchema(
  paramsOrSkip?: {
    name: string;
    address: string;
    telephone?: string;
    description?: string;
    type?: 'Hospital' | 'MedicalCenter' | 'MedicalBusiness' | 'LocalBusiness';
    url?: string;
  } | boolean
): object {
  // Check if params is an object (new API) or boolean/undefined (old API)
  const isParamsObject = paramsOrSkip && typeof paramsOrSkip === 'object' && 'name' in paramsOrSkip;
  const params = isParamsObject ? paramsOrSkip : undefined;
  const _skipAggregateRating = typeof paramsOrSkip === 'boolean' ? paramsOrSkip : false;

  // If params provided, generate custom schema
  if (params) {
    // Parse address (simple parsing - can be improved)
    const addressParts = params.address.split(',').map(s => s.trim());
    const streetAddress = addressParts[0] || params.address;
    const locality = addressParts[addressParts.length - 1] || 'Karasu';
    
    const schemaType = params.type === 'Hospital' 
      ? 'Hospital' 
      : params.type === 'MedicalCenter'
      ? 'MedicalCenter'
      : params.type === 'MedicalBusiness'
      ? 'MedicalBusiness'
      : 'LocalBusiness';

    return {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: params.name,
      ...(params.description && { description: params.description }),
      address: {
        '@type': 'PostalAddress',
        streetAddress,
        addressLocality: locality,
        addressRegion: 'Sakarya',
        addressCountry: 'TR',
      },
      ...(params.telephone && { telephone: params.telephone }),
      ...(params.url && { url: params.url }),
    };
  }

  // Default schema (for backward compatibility)
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}#business`,
    name: siteConfig.name,
    image: `${siteConfig.url}/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Merkez Mahallesi, Atatürk Caddesi',
      addressLocality: 'Karasu',
      addressRegion: 'Sakarya',
      postalCode: '54500',
      addressCountry: 'TR',
    },
    telephone: '+90-555-123-45-67',
    email: 'info@karasuemlak.net',
    priceRange: '$$',
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '17:00' },
    ],
    areaServed: {
      '@type': 'City',
      name: 'Karasu',
      containedIn: {
        '@type': 'State',
        name: 'Sakarya',
      },
    },
    paymentAccepted: ['Cash', 'Credit Card', 'Bank Transfer'],
    currenciesAccepted: 'TRY',
  };
}

