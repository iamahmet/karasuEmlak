import { NextResponse } from 'next/server';
import { getQAEntries } from '@/lib/db/qa';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

/**
 * GET /api/faq
 * Returns all FAQ questions from database
 * Uses repository pattern with anon client (respects RLS)
 * Cached for 1 hour, stale-while-revalidate for 24 hours
 */
export async function GET() {
  try {
    const faqs = await getQAEntries(undefined, undefined, 100);
    
    return NextResponse.json(
      {
        success: true,
        data: faqs,
        count: faqs?.length || 0,
        cached: true,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, s-maxage=3600',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
        },
      }
    );
  } catch (error: any) {
    console.error('[api/faq] Error fetching FAQs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
