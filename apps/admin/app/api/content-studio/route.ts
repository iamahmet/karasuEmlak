import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

/**
 * Content Studio API
 * Admin API: Uses service role to bypass RLS
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const locale = searchParams.get("locale");

  // Validate status parameter
  const allowedStatuses = ["draft", "review", "published", "archived"];
  if (status && !allowedStatuses.includes(status)) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      `Invalid status: ${status}. Must be one of: ${allowedStatuses.join(", ")}`,
      { provided: status, allowed: allowedStatuses },
      400
    );
  }

  // Validate locale parameter if provided
  const allowedLocales = ["tr", "en", "et", "ru", "ar"];
  if (locale && !allowedLocales.includes(locale)) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      `Invalid locale: ${locale}. Must be one of: ${allowedLocales.join(", ")}`,
      { provided: locale, allowed: allowedLocales },
      400
    );
  }

  // Query content_items with graceful error handling
  let query = supabase
    .from("content_items")
    .select(`
      *,
      locales:content_locales(*)
    `);

  if (status) {
    query = query.eq("status", status);
  }

  const { data: items, error } = await query
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    // If table doesn't exist, return empty array
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    
    if (
      errorCode === "PGRST116" || 
      errorCode === "42P01" ||
      errorMessage.includes("does not exist") ||
      errorMessage.includes("could not find the table") ||
      errorMessage.includes("schema cache") ||
      (errorMessage.includes("relation") && errorMessage.includes("does not exist"))
    ) {
      // Table doesn't exist, return empty array gracefully
      return createSuccessResponse(requestId, { items: [] });
    }
    
    throw error;
  }

  return createSuccessResponse(requestId, { items: items || [] });
}

export const GET = withErrorHandling(handleGet);
