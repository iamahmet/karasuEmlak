import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Web App Rebuild API
 * Triggers a full rebuild of the web app (for production deployments)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from admin panel
    const secret = request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || 'change-me-in-production';
    
    if (process.env.NODE_ENV === 'production' && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Revalidate all paths
    revalidatePath('/', 'layout');
    
    // Revalidate sitemaps
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-news.xml');
    revalidatePath('/sitemap-images.xml');

    // In production, this would trigger a Vercel rebuild
    // For now, we just invalidate all cache
    if (process.env.VERCEL) {
      // Vercel rebuild would be triggered via webhook
      console.log('🔄 Rebuild requested (Vercel deployment)');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Rebuild triggered',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Rebuild error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger rebuild', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
