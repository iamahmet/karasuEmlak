"use server";

/**
 * Web app revalidation utility
 * Handles cache invalidation for static pages
 * This file uses Server Actions - can only be called from server context
 */

import { revalidatePath, revalidateTag } from 'next/cache';

export interface RevalidateOptions {
  path?: string;
  tag?: string;
}

/**
 * Revalidate web app cache
 */
export async function revalidateWebApp(options: RevalidateOptions): Promise<void> {
  if (options.path) {
    revalidatePath(options.path, 'page');
  }
  if (options.tag) {
    revalidateTag(options.tag);
  }
}

/**
 * Revalidate multiple paths
 */
export async function revalidatePaths(paths: string[]): Promise<void> {
  for (const path of paths) {
    revalidatePath(path, 'page');
  }
}

/**
 * Revalidate article pages
 */
export async function revalidateArticle(slug?: string): Promise<void> {
  revalidateTag('articles');
  if (slug) {
    revalidatePath(`/makale/${slug}`, 'page');
    revalidatePath(`/tr/makale/${slug}`, 'page');
  }
  revalidatePath('/makaleler', 'page');
  revalidatePath('/tr/makaleler', 'page');
}

/**
 * Revalidate listing pages
 */
export async function revalidateListing(slug?: string): Promise<void> {
  revalidateTag('listings');
  if (slug) {
    revalidatePath(`/ilan/${slug}`, 'page');
    revalidatePath(`/tr/ilan/${slug}`, 'page');
  }
  revalidatePath('/satilik', 'page');
  revalidatePath('/kiralik', 'page');
  revalidatePath('/tr/satilik', 'page');
  revalidatePath('/tr/kiralik', 'page');
}

/**
 * Revalidate static pages
 */
export async function revalidateStaticPages(): Promise<void> {
  revalidateTag('static-pages');
  revalidatePath('/', 'layout');
  revalidatePath('/tr', 'page');
}
