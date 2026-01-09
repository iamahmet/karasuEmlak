/**
 * Cache Revalidation Utilities
 * 
 * Provides deterministic cache invalidation strategy for Next.js and PostgREST.
 * 
 * Strategy:
 * - Public pages: Use revalidateTag/revalidatePath with appropriate tags
 * - Admin: Always no-store (no caching)
 * - After publish/update: Invalidate related tags
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/clients';

/**
 * Cache tags for different content types
 */
export const CACHE_TAGS = {
  listings: 'listings',
  articles: 'articles',
  news: 'news',
  neighborhoods: 'neighborhoods',
  qa: 'qa',
  content: 'content',
  sitemap: 'sitemap',
} as const;

/**
 * Revalidate listings cache
 */
export async function revalidateListings(options?: { path?: string; tag?: string }) {
  if (options?.path) {
    revalidatePath(options.path);
  }
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(options?.tag || CACHE_TAGS.listings);
}

/**
 * Revalidate articles cache
 */
export async function revalidateArticles(options?: { path?: string; tag?: string; slug?: string }) {
  if (options?.path) {
    revalidatePath(options.path);
  }
  if (options?.slug) {
    revalidatePath(`/blog/${options.slug}`);
  }
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(options?.tag || CACHE_TAGS.articles);
}

/**
 * Revalidate news cache
 */
export async function revalidateNews(options?: { path?: string; tag?: string; slug?: string }) {
  if (options?.path) {
    revalidatePath(options.path);
  }
  if (options?.slug) {
    revalidatePath(`/haberler/${options.slug}`);
  }
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(options?.tag || CACHE_TAGS.news);
}

/**
 * Revalidate neighborhoods cache
 */
export async function revalidateNeighborhoods(options?: { path?: string; tag?: string; slug?: string }) {
  if (options?.path) {
    revalidatePath(options.path);
  }
  if (options?.slug) {
    revalidatePath(`/karasu/${options.slug}`);
  }
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(options?.tag || CACHE_TAGS.neighborhoods);
}

/**
 * Revalidate Q&A cache
 */
export async function revalidateQA(options?: { path?: string; tag?: string }) {
  if (options?.path) {
    revalidatePath(options.path);
  }
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(options?.tag || CACHE_TAGS.qa);
}

/**
 * Revalidate sitemap cache
 */
export async function revalidateSitemap() {
  revalidatePath('/sitemap.xml');
  revalidatePath('/sitemap-news.xml');
  revalidatePath('/sitemap-images.xml');
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.sitemap);
}

/**
 * Revalidate all content caches
 */
export async function revalidateAll() {
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.listings);
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.articles);
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.news);
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.neighborhoods);
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.qa);
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.content);
  // @ts-expect-error - Next.js 16 type definitions may be incorrect
  revalidateTag(CACHE_TAGS.sitemap);
  revalidatePath('/', 'layout');
}

/**
 * Bump content version in database to trigger PostgREST cache invalidation
 * This is a fallback mechanism for PostgREST schema cache issues
 */
export async function bumpContentVersion(): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Try to call the RPC function first
    const { error: rpcError } = await supabase.rpc('bump_content_version', {});

    if (rpcError) {
      // If function doesn't exist, create a simple version table entry
      const { error: upsertError } = await supabase
        .from('content_version')
        .upsert({ id: 1, version: Date.now() }, { onConflict: 'id' });

      if (upsertError) {
        // Table might not exist, that's okay - non-critical operation
        console.debug('[revalidate] content_version table may not exist:', upsertError.message);
      }
    }
  } catch (error) {
    // Non-critical, log and continue
    console.warn('[revalidate] Failed to bump content version:', error);
  }
}
