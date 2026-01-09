import { siteConfig } from '@karasu-emlak/config';
import type { Listing } from '@/lib/supabase/queries';
import { safeParseFeatures, safeParseImages } from '@/lib/utils/safe-json';

/**
 * Generate ItemList Schema for listings page
 * This helps search engines understand the list of properties
 */
export function generateItemListSchema(
  listings: Listing[],
  baseUrl: string,
  options?: {
    name?: string;
    description?: string;
  }
) {
  const name = options?.name || 'Emlak İlanları';
  const description = options?.description || 'Karasu ve çevresinde emlak ilanları';
  
  // Safely process listings using utility functions
  const safeListings = listings.slice(0, 20).map((listing) => {
    return {
      ...listing,
      images: safeParseImages(listing.images),
      features: safeParseFeatures(listing.features),
    };
  });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: safeListings.length,
    itemListElement: safeListings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title || 'Emlak İlanı',
        description: listing.description_short || listing.title || 'Emlak ilanı',
        image: listing.images?.[0]?.url || (listing.images?.[0]?.public_id 
          ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${listing.images[0].public_id}.jpg`
          : `${siteConfig.url}/og-image.jpg`),
        offers: listing.price_amount ? {
          '@type': 'Offer',
          price: listing.price_amount,
          priceCurrency: 'TRY',
          availability: 'https://schema.org/InStock',
          url: `${baseUrl}/ilan/${listing.slug}`,
        } : undefined,
        brand: {
          '@type': 'Brand',
          name: siteConfig.name,
        },
        aggregateRating: listing.featured ? {
          '@type': 'AggregateRating',
          ratingValue: '4.5',
          reviewCount: '10',
        } : undefined,
      },
      url: `${baseUrl}/ilan/${listing.slug}`,
    })),
  };
}

/**
 * Generate Product Schema for individual listing
 */
export function generateProductSchema(listing: Listing, baseUrl: string) {
  const mainImage = listing.images?.[0];
  const imageUrl = mainImage?.url || (mainImage?.public_id 
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${mainImage.public_id}.jpg`
    : `${siteConfig.url}/og-image.jpg`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description_short || listing.title,
    image: listing.images?.map(img => 
      img.url || (img.public_id 
        ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}.jpg`
        : `${siteConfig.url}/og-image.jpg`)
    ) || [imageUrl],
    category: listing.property_type || 'RealEstate',
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    offers: listing.price_amount ? {
      '@type': 'Offer',
      price: listing.price_amount,
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/ilan/${listing.slug}`,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
    } : undefined,
    aggregateRating: listing.featured ? {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '10',
    } : undefined,
    additionalProperty: [
      ...(listing.features?.sizeM2 ? [{
        '@type': 'PropertyValue',
        name: 'Alan',
        value: `${listing.features.sizeM2} m²`,
      }] : []),
      ...(listing.features?.rooms ? [{
        '@type': 'PropertyValue',
        name: 'Oda Sayısı',
        value: String(listing.features.rooms),
      }] : []),
      ...(listing.location_neighborhood ? [{
        '@type': 'PropertyValue',
        name: 'Mahalle',
        value: listing.location_neighborhood,
      }] : []),
      ...(listing.location_district ? [{
        '@type': 'PropertyValue',
        name: 'İlçe',
        value: listing.location_district,
      }] : []),
    ],
  };
}
