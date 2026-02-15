import { NextRequest, NextResponse } from 'next/server';
import { revalidateAll, revalidateListings, revalidateArticles, revalidateNews, revalidateNeighborhoods, revalidateQA, revalidateSitemap, bumpContentVersion } from '@/lib/cache/revalidate';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/admin/revalidate
 * 
 * Admin endpoint for cache invalidation.
 * Accepts tags or paths to revalidate.
 * 
 * Body:
 * {
 *   tags?: string[],
 *   paths?: string[],
 *   all?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is authorized (prevents public cache-busting abuse in production)
    const normalizeSecret = (value: string | null | undefined) =>
      (value || '').trim().replace(/\\n/g, '');
    const secret = normalizeSecret(request.headers.get('x-revalidate-secret'));
    const configuredSecret = normalizeSecret(process.env.REVALIDATE_SECRET);
    if (process.env.NODE_ENV === 'production') {
      if (!configuredSecret) {
        console.error('[api/admin/revalidate] REVALIDATE_SECRET is not set in production');
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
      }
      if (secret !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { tags, paths, all } = body;

    if (all) {
      await revalidateAll();
      await bumpContentVersion();
      return NextResponse.json({ success: true, message: 'All caches revalidated' });
    }

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        switch (tag) {
          case 'listings':
            await revalidateListings();
            break;
          case 'articles':
            await revalidateArticles();
            break;
          case 'news':
            await revalidateNews();
            break;
          case 'neighborhoods':
            await revalidateNeighborhoods();
            break;
          case 'qa':
            await revalidateQA();
            break;
          case 'sitemap':
            await revalidateSitemap();
            break;
        }
      }
    }

    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
      }
    }

    await bumpContentVersion();

    return NextResponse.json({
      success: true,
      message: 'Cache revalidated',
      revalidated: { tags, paths },
    });
  } catch (error: any) {
    console.error('[api/admin/revalidate] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
