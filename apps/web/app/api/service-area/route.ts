/**
 * Service Area API Endpoint
 * 
 * GET /api/service-area
 * Returns service area information for local SEO
 */

import { NextResponse } from 'next/server';
import { siteConfig } from '@karasu-emlak/config';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate daily (service area doesn't change often)

export async function GET() {
  try {
    const serviceArea = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Real Estate Services',
      provider: {
        '@type': 'RealEstateAgent',
        name: siteConfig.name,
        url: siteConfig.url,
      },
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
    };

    return NextResponse.json({
      success: true,
      data: serviceArea,
    });
  } catch (error) {
    console.error('Error fetching service area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch service area',
      },
      { status: 500 }
    );
  }
}
