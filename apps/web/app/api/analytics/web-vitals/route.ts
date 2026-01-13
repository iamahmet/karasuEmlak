import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Web Vitals API Endpoint
 * Stores Core Web Vitals metrics in Supabase for performance monitoring
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      // Limit request body size to prevent memory issues (max 100KB)
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json({ success: true, warning: "Empty request body" });
      }
      
      // Check size limit
      if (text.length > 100 * 1024) {
        console.warn("Web vitals request body too large:", text.length);
        return NextResponse.json({ success: true, warning: "Request body too large" });
      }
      
      // Try to find valid JSON in the text (handle cases where there might be extra data)
      let cleanedText = text.trim();
      
      // Try to extract JSON if there's extra content
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      // Remove any trailing commas before closing braces/brackets
      cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1');
      
      // Try to parse JSON with better error handling
      try {
        body = JSON.parse(cleanedText);
      } catch (parseError: any) {
        // Log error details for debugging
        const preview = cleanedText.substring(0, 200);
        const errorPosition = parseError.message?.match(/position (\d+)/)?.[1];
        if (process.env.NODE_ENV === 'development') {
          console.error("Web vitals JSON parse error:", {
            message: parseError.message,
            position: errorPosition,
            preview: preview,
            textLength: cleanedText.length,
            originalLength: text.length
          });
        }
        // Return success to avoid breaking frontend - web vitals are non-critical
        return NextResponse.json({ success: true, warning: "Invalid JSON format" }, { status: 200 });
      }
    } catch (readError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Web vitals request read error:", readError.message);
      }
      // Return success to avoid breaking frontend
      return NextResponse.json({ success: true, warning: "Failed to read request" }, { status: 200 });
    }
    
    // Handle both standard web vitals format and enhanced format
    let name: string;
    let value: number;
    let id: string | undefined;
    let rating: string | undefined;
    let delta: number | undefined;
    let navigationType: string | undefined;

    // Check if it's enhanced format (has different structure)
    if (body.metric || body.name) {
      name = body.metric || body.name;
      value = body.value;
      id = body.id || body.metric_id;
      rating = body.rating;
      delta = body.delta;
      navigationType = body.navigationType || body.navigation_type;
    } else {
      // Standard format
      name = body.name;
      value = body.value;
      id = body.id;
      rating = body.rating;
      delta = body.delta;
      navigationType = body.navigationType;
    }

    // Validate required fields
    if (!name || value === undefined || isNaN(value)) {
      return NextResponse.json({ success: true, warning: "Missing or invalid required fields" }, { status: 200 });
    }

    try {
      let supabase;
      try {
        supabase = createServiceClient();
      } catch (clientError: any) {
        console.error("Web vitals - service client creation failed:", clientError.message);
        return NextResponse.json({ success: true, warning: "Service unavailable" });
      }

      // Store in seo_events table
      const { error } = await supabase.from("seo_events").insert({
        event_type: "web_vitals",
        entity_type: "performance",
        entity_id: id || `web-vitals-${Date.now()}`,
        event_data: {
          metric: name,
          value,
          rating,
          delta,
          navigationType,
          timestamp: new Date().toISOString(),
        },
        status: rating === "good" ? "success" : rating === "needs-improvement" ? "warning" : "failed",
      });

      if (error) {
        // Log error but don't fail the request - web vitals are non-critical
        if (process.env.NODE_ENV === 'development') {
          console.error("Error storing web vitals:", error);
        }
        // Still return success to avoid breaking the frontend
        return NextResponse.json({ success: true, warning: "Metrics not stored" });
      }

      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      // If database is unavailable, log but don't fail
      if (process.env.NODE_ENV === 'development') {
        console.error("Web vitals database error:", dbError);
      }
      return NextResponse.json({ success: true, warning: "Database unavailable" });
    }
  } catch (error: any) {
    // Catch-all for any other errors
    if (process.env.NODE_ENV === 'development') {
      console.error("Web vitals API error:", error);
    }
    // Return success to avoid breaking the frontend
    return NextResponse.json({ success: true, warning: error.message || "Internal server error" });
  }
}

