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
