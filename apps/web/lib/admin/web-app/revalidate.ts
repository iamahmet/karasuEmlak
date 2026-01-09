/**
 * Web App Cache Revalidation Utilities
 * Handles cache invalidation for web app when content is updated in admin panel
 */

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "change-me-in-production";

export interface RevalidationOptions {
  path?: string;
  tag?: string;
  type?: "path" | "tag" | "both";
}

/**
 * Revalidate web app cache
 */
export async function revalidateWebApp(options: RevalidationOptions): Promise<boolean> {
  try {
    const { path, tag, type = "path" } = options;

    if (type === "path" && path) {
      const response = await fetch(
        `${WEB_APP_URL}/api/revalidate?path=${encodeURIComponent(path)}&secret=${REVALIDATE_SECRET}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Revalidation failed:", error);
        return false;
      }

      return true;
    }

    if (type === "tag" && tag) {
      const response = await fetch(
        `${WEB_APP_URL}/api/revalidate?tag=${encodeURIComponent(tag)}&secret=${REVALIDATE_SECRET}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Revalidation failed:", error);
        return false;
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error("Revalidation error:", error);
    return false;
  }
}

/**
 * Revalidate article cache
 */
export async function revalidateArticle(slug: string, locale: string = "tr"): Promise<boolean> {
  return revalidateWebApp({
    path: `/${locale}/haber/${slug}`,
    type: "path",
  });
}

/**
 * Revalidate category cache
 */
export async function revalidateCategory(slug: string, locale: string = "tr"): Promise<boolean> {
  return revalidateWebApp({
    path: `/${locale}/kategori/${slug}`,
    type: "path",
  });
}

/**
 * Revalidate static page cache
 */
export async function revalidateStaticPage(slug: string, locale: string = "tr"): Promise<boolean> {
  return revalidateWebApp({
    path: `/${locale}/${slug}`,
    type: "path",
  });
}

/**
 * Revalidate homepage cache
 */
export async function revalidateHomepage(locale: string = "tr"): Promise<boolean> {
  return revalidateWebApp({
    path: `/${locale}`,
    type: "path",
  });
}

/**
 * Revalidate all article-related caches
 */
export async function revalidateAllArticles(): Promise<boolean> {
  return revalidateWebApp({
    tag: "articles",
    type: "tag",
  });
}

