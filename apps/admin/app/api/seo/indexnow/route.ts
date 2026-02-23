import { NextRequest, NextResponse } from "next/server";

/**
 * IndexNow API
 * Submit URLs to IndexNow service for faster indexing
 */
export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required" },
        { status: 400 }
      );
    }

    // Validate URLs
    const validUrls = urls.filter((url) => {
      try {
        // Allow relative URLs
        if (url.startsWith("/")) {
          return true;
        }
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid URLs provided" },
        { status: 400 }
      );
    }

    // In production, this would submit to IndexNow API
    // IndexNow API endpoint: https://api.indexnow.org/IndexNow
    // Requires: API key and host
    // For now, return success response

    const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";

    if (!INDEXNOW_API_KEY) {
      console.warn("INDEXNOW_API_KEY not configured, skipping actual submission");
      return NextResponse.json({
        success: true,
        message: "IndexNow submission simulated (API key not configured)",
        urls: validUrls,
        submitted: validUrls.length,
      });
    }

    // Submit to IndexNow
    try {
      const response = await fetch("https://api.indexnow.org/IndexNow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: new URL(SITE_URL).hostname,
          key: INDEXNOW_API_KEY,
          keyLocation: `${SITE_URL}/${INDEXNOW_API_KEY}.txt`,
          urlList: validUrls.map((url) => {
            // Convert relative URLs to absolute
            if (url.startsWith("/")) {
              return `${SITE_URL}${url}`;
            }
            return url;
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`IndexNow API returned ${response.status}`);
      }

      return NextResponse.json({
        success: true,
        message: "URLs submitted to IndexNow successfully",
        urls: validUrls,
        submitted: validUrls.length,
      });
    } catch (error: any) {
      console.error("IndexNow submission error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to submit to IndexNow",
          urls: validUrls,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Failed to process IndexNow request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
