import { NextRequest, NextResponse } from "next/server";
import { pingSitemap } from "@/lib/seo/search-console";
import { siteConfig } from "@karasu-emlak/config";

/**
 * Sitemap Submission API Endpoint
 * Pings search engines when sitemap is updated
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sitemapUrl } = body;

    const sitemap = sitemapUrl || `${siteConfig.url}/sitemap.xml`;

    // Ping search engines
    await pingSitemap(sitemap);

    return NextResponse.json({
      success: true,
      message: `Sitemap submitted: ${sitemap}`,
    });
  } catch (error: any) {
    console.error("Sitemap submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit sitemap" },
      { status: 500 }
    );
  }
}

