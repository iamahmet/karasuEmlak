import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";

/**
 * Notifications API
 * Admin API: Uses service role to bypass RLS
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";
  const read = searchParams.get("read");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Cap at 100
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0); // Ensure non-negative

  // Validate type parameter
  if (type !== "all" && !["info", "success", "warning", "error"].includes(type)) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      `Invalid type: ${type}. Must be one of: all, info, success, warning, error`,
      undefined,
      400
    );
  }

  // Query notifications with graceful error handling
  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type !== "all") {
    query = query.eq("type", type);
  }

  if (read !== null) {
    query = query.eq("is_read", read === "true");
  }

  const { data: notifications, error } = await query;

  if (error) {
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    const isMissing = errorCode === "PGRST116" || errorCode === "42P01" ||
      errorMessage.includes("does not exist") ||
      (errorMessage.includes("relation") && errorMessage.includes("does not exist"));
    const isStaleCache = errorCode === "PGRST205" || errorCode === "PGRST202" ||
      errorMessage.includes("schema cache") || errorMessage.includes("could not find the table");

    if (isMissing || isStaleCache) {
      console.warn(`[${requestId}] notifications: ${isStaleCache ? "schema cache stale" : "table not found"}, returning []`);
      return createSuccessResponse(requestId, { notifications: [] });
    }

    return createErrorResponse(
      requestId,
      "DATABASE_ERROR",
      `Database query failed: ${error.message}`,
      undefined,
      500
    );
  }

  return createSuccessResponse(requestId, { 
    success: true,
    notifications: notifications || [] 
  });
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();
  const body = await request.json();

  const { user_id, type, title, message, action_url } = body;

  // Validate required fields
  if (!type || !title || !message) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Type, title, and message are required",
      undefined,
      400
    );
  }

  // Validate type
  if (!["info", "success", "warning", "error"].includes(type)) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      `Invalid type: ${type}. Must be one of: info, success, warning, error`,
      undefined,
      400
    );
  }

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: user_id || null,
      type,
      title: title.trim(),
      message: message.trim(),
      action_url: action_url?.trim() || null,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    // If table doesn't exist
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    
    if (
      errorCode === "PGRST116" || 
      errorCode === "42P01" ||
      errorMessage.includes("does not exist")
    ) {
      console.warn(`[${requestId}] notifications table not found`);
      return createErrorResponse(
        requestId,
        "TABLE_NOT_FOUND",
        "Notifications table does not exist. Please run migrations first.",
        undefined,
        404
      );
    }
    
    return createErrorResponse(
      requestId,
      "DATABASE_ERROR",
      `Database insert failed: ${error.message}`,
      undefined,
      500
    );
  }

  return createSuccessResponse(requestId, { 
    success: true,
    notification 
  });
}

export const POST = withErrorHandling(handlePost);

