import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Admin Panel Sync API
 * Handles sync requests from admin panel to web app
 * Invalidates Next.js cache for affected routes
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from admin panel (in production, add authentication)
    const normalizeSecret = (value: string | null | undefined) =>
      (value || '').trim().replace(/\\n/g, '');
    const secret = normalizeSecret(request.headers.get('x-revalidate-secret'));
    const configuredSecret = normalizeSecret(process.env.REVALIDATE_SECRET);
    
    // In production, verify secret
    if (process.env.NODE_ENV === 'production') {
      if (!configuredSecret) {
        console.error('[api/admin/sync] REVALIDATE_SECRET is not set in production');
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
      }
      if (secret !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { type, resourceId, locale = 'tr', slug } = body;

    // Log sync event
    console.log('🔄 Admin sync request:', { type, resourceId, slug, locale });

    // Invalidate Next.js cache based on sync type
    switch (type) {
      case 'content':
        if (resourceId) {
          // Revalidate specific content page
          revalidatePath(`/${locale}/haber/${resourceId}`);
          revalidatePath(`/${locale}/blog/${resourceId}`);
        }
        // Revalidate all content pages
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('articles');
        revalidatePath(`/${locale}/haberler`);
        revalidatePath(`/${locale}/blog`);
        // Revalidate sitemap when content changes
        revalidatePath('/sitemap.xml');
        revalidatePath('/sitemap-news.xml');
        break;
      
      case 'listings':
        if (slug) {
          // Revalidate specific listing page
          revalidatePath(`/${locale}/ilan/${slug}`);
        }
        // Revalidate listing pages
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('listings');
        revalidatePath(`/${locale}/satilik`);
        revalidatePath(`/${locale}/kiralik`);
        revalidatePath(`/${locale}`); // Homepage shows featured listings
        // Revalidate sitemap when listings change
        revalidatePath('/sitemap.xml');
        break;
      
      case 'news':
        if (slug) {
          // Revalidate specific news page
          revalidatePath(`/${locale}/haberler/${slug}`);
        }
        // Revalidate news pages
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('news');
        revalidatePath(`/${locale}/haberler`);
        break;
      
      case 'settings':
        // Revalidate homepage and all pages (settings affect global state)
        revalidatePath('/');
        revalidatePath(`/${locale}`);
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('settings');
        break;
      
      case 'seo':
        // Revalidate SEO-related pages
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('seo');
        revalidatePath(`/${locale}`);
        break;
      
      case 'all':
        // Revalidate everything
        revalidatePath('/', 'layout');
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('articles');
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('listings');
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('news');
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('settings');
        // @ts-expect-error - Next.js 16 type definitions may be incorrect
        revalidateTag('seo');
        // Revalidate sitemap
        revalidatePath('/sitemap.xml');
        revalidatePath('/sitemap-news.xml');
        revalidatePath('/sitemap-images.xml');
        break;
      
      default:
        console.warn('Unknown sync type:', type);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sync completed',
      type,
      resourceId,
      locale,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
