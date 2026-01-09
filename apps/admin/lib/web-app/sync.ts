/**
 * Web App Sync Utilities
 * Syncs data between admin panel and web app
 */

export interface SyncOptions {
  type: 'content' | 'listings' | 'news' | 'settings' | 'seo' | 'all';
  resourceId?: string;
  slug?: string;
  locale?: string;
}

/**
 * Sync data to web app
 * This function can trigger web app rebuilds or cache invalidation
 * 
 * @param options - Sync options
 * @returns Promise<boolean> - Success status
 */
export async function syncToWebApp(options: SyncOptions): Promise<boolean> {
  try {
    const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000';
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'change-me-in-production';
    
    // Call web app API to trigger cache invalidation
    // Works in both development and production
    const response = await fetch(`${webAppUrl}/api/admin/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': revalidateSecret,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to sync to web app:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Synced to web app:', result);
    return true;
  } catch (error) {
    console.error('Failed to sync to web app:', error);
    // In development, don't fail if web app is not running
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Web app sync failed (this is okay if web app is not running)');
      return false;
    }
    return false;
  }
}

/**
 * Invalidate web app cache
 * 
 * @param paths - Paths to invalidate
 * @returns Promise<boolean>
 */
export async function invalidateWebAppCache(paths: string[], tags?: string[]): Promise<boolean> {
  try {
    const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000';
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'change-me-in-production';

    const response = await fetch(`${webAppUrl}/api/admin/cache/invalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': revalidateSecret,
      },
      body: JSON.stringify({ paths, tags }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to invalidate web app cache:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Invalidated web app cache:', result);
    return true;
  } catch (error) {
    console.error('Failed to invalidate web app cache:', error);
    // In development, don't fail if web app is not running
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Web app cache invalidation failed (this is okay if web app is not running)');
      return false;
    }
    return false;
  }
}

/**
 * Trigger web app rebuild
 * 
 * @returns Promise<boolean>
 */
export async function triggerWebAppRebuild(): Promise<boolean> {
  try {
    const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Triggering web app rebuild');
      return true;
    }

    const response = await fetch(`${webAppUrl}/api/admin/rebuild`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to trigger web app rebuild:', error);
    return false;
  }
}
