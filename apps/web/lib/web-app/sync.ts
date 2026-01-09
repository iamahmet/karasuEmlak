"use server";

/**
 * Web app sync utility
 * Handles synchronization between admin and web app
 * This file uses Server Actions - can only be called from server context
 */

import { revalidatePath, revalidateTag } from 'next/cache';

export interface SyncOptions {
  type: 'content' | 'listing' | 'article' | 'news' | 'pharmacy' | 'settings';
  resourceId?: string;
  action?: 'create' | 'update' | 'delete' | 'publish';
}

/**
 * Sync content to web app (invalidate relevant caches)
 */
export async function syncToWebApp(options: SyncOptions): Promise<void> {
  const { type, resourceId } = options;

  // Revalidate based on content type
  switch (type) {
    case 'content':
      revalidateTag('content', 'default');
      if (resourceId) {
        revalidatePath(`/blog/${resourceId}`, 'page');
        revalidatePath(`/tr/blog/${resourceId}`, 'page');
      }
      revalidatePath('/blog', 'page');
      revalidatePath('/tr/blog', 'page');
      break;

    case 'listing':
      revalidateTag('listings', 'default');
      if (resourceId) {
        revalidatePath(`/ilan/${resourceId}`, 'page');
        revalidatePath(`/tr/ilan/${resourceId}`, 'page');
      }
      revalidatePath('/satilik', 'page');
      revalidatePath('/kiralik', 'page');
      revalidatePath('/tr/satilik', 'page');
      revalidatePath('/tr/kiralik', 'page');
      break;

    case 'article':
      revalidateTag('articles', 'default');
      if (resourceId) {
        revalidatePath(`/makale/${resourceId}`, 'page');
        revalidatePath(`/tr/makale/${resourceId}`, 'page');
      }
      revalidatePath('/makaleler', 'page');
      revalidatePath('/tr/makaleler', 'page');
      break;

    case 'news':
      revalidateTag('news', 'default');
      if (resourceId) {
        revalidatePath(`/haber/${resourceId}`, 'page');
        revalidatePath(`/tr/haber/${resourceId}`, 'page');
      }
      revalidatePath('/haberler', 'page');
      revalidatePath('/tr/haberler', 'page');
      break;

    case 'pharmacy':
      revalidateTag('pharmacies', 'default');
      revalidatePath('/nobetci-eczane', 'page');
      revalidatePath('/tr/nobetci-eczane', 'page');
      break;

    case 'settings':
      revalidateTag('settings', 'default');
      // Revalidate all pages as settings may affect global behavior
      revalidatePath('/', 'layout');
      break;
  }

  // Always revalidate home page
  revalidatePath('/', 'layout');
  revalidatePath('/tr', 'page');
}
