import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Cache Invalidation API
 * Allows admin panel to invalidate specific paths or tags
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from admin panel
    const secret = request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || 'change-me-in-production';
    
    if (process.env.NODE_ENV === 'production' && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paths = [], tags = [] } = body;

    // Revalidate paths
    if (Array.isArray(paths) && paths.length > 0) {
      paths.forEach((path: string) => {
        revalidatePath(path);
      });
    }

    // Revalidate tags
    if (Array.isArray(tags) && tags.length > 0) {
      tags.forEach((tag: string) => {
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag(tag);
      });
    }

    // Always revalidate sitemap when cache is invalidated
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-news.xml');
    revalidatePath('/sitemap-images.xml');

    return NextResponse.json({ 
      success: true,
      message: 'Cache invalidated',
      paths: paths.length,
      tags: tags.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
