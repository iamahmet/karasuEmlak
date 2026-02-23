/**
 * SEO Notify API
 * Pings sitemap + IndexNow when new content is published
 * Call from admin when publishing articles
 */

import { NextRequest, NextResponse } from "next/server";
import { notifySearchEngines } from "@karasu/lib/seo/index-notify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urls = body.urls ?? body.url ? [body.url] : [];

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array required", success: false },
        { status: 400 }
      );
    }

    const result = await notifySearchEngines(urls);

    return NextResponse.json({
      success: true,
      sitemapPinged: result.sitemapPinged,
      indexNowSubmitted: result.indexNowSubmitted,
      urls,
    });
  } catch (e: any) {
    console.error("[seo/notify]", e);
    return NextResponse.json(
      { error: e.message || "Notify failed", success: false },
      { status: 500 }
    );
  }
}
