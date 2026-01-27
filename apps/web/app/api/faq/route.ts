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
  const requestId = crypto.randomUUID();
  
  try {
    const faqs = await getQAEntries(undefined, undefined, 100);
    
    return NextResponse.json(
      {
        success: true,
        data: faqs || [],
        count: faqs?.length || 0,
        cached: true,
        requestId,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, s-maxage=3600',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error(`[${requestId}] [api/faq] Error fetching FAQs:`, error);
    
    // Always return JSON, never plain text
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Internal server error',
        code: error?.code || 'INTERNAL_ERROR',
        requestId,
        ...(process.env.NODE_ENV === 'development' && error?.stack ? { stack: error.stack } : {}),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
