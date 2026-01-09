import { NextRequest, NextResponse } from "next/server";

/**
 * Revalidation API
 * Invalidates Next.js cache when articles are published/updated
 * This ensures web app shows latest content immediately
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, locale = "tr", type = "article" } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Revalidate paths
    const pathsToRevalidate: string[] = [];

    if (type === "article") {
      // Revalidate article page
      pathsToRevalidate.push(`/${locale}/haber/${slug}`);
      
      // Revalidate homepage (for featured articles)
      pathsToRevalidate.push(`/${locale}`);
      
      // Revalidate category pages (if article has category)
      // We'll need to fetch category from article, but for now just revalidate common paths
      pathsToRevalidate.push(`/${locale}/kategori`);
    } else if (type === "page") {
      // Revalidate static page
      pathsToRevalidate.push(`/${locale}/${slug}`);
    }

    // Use shared revalidation utility
    try {
      const { revalidateWebApp } = await import("@/lib/web-app/revalidate");
      
      for (const path of pathsToRevalidate) {
        try {
          await revalidateWebApp({ path, type: "path" });
        } catch (error) {
          console.error(`Error revalidating ${path}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        revalidated: pathsToRevalidate.length,
        paths: pathsToRevalidate,
      });
    } catch (error: any) {
      console.error("Revalidation error:", error);
      // Don't fail the request if revalidation fails
      return NextResponse.json({
        success: true,
        warning: "Revalidation may have failed",
        error: error.message,
        paths: pathsToRevalidate,
      });
    }
  } catch (error: any) {
    console.error("Revalidation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to revalidate" },
      { status: 500 }
    );
  }
}

