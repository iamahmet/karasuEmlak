import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

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
    // If table doesn't exist, return empty array silently
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    
    if (
      errorCode === "PGRST116" || 
      errorCode === "42P01" ||
      errorCode === "PGRST202" ||
      errorCode === "PGRST205" ||
      errorMessage.includes("does not exist") ||
      errorMessage.includes("relation") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("permission denied")
    ) {
      // Table doesn't exist or permission denied - return empty array silently
      // Return in format expected by component: { success: true, notifications: [] }
      return NextResponse.json(
        { 
          success: true, 
          requestId,
          notifications: [] 
        },
        {
          status: 200,
          headers: {
            "x-request-id": requestId,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // For other database errors, return error response
    return createErrorResponse(
      requestId,
      "DATABASE_ERROR",
      `Database query failed: ${error.message}`,
      undefined,
      500
    );
  }

  // Return in format expected by component: { success: true, notifications: [...] }
  return NextResponse.json(
    { 
      success: true, 
      requestId,
      notifications: notifications || [] 
    },
    {
      status: 200,
      headers: {
        "x-request-id": requestId,
        "Content-Type": "application/json",
      },
    }
  );
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();
  
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Invalid JSON in request body",
      undefined,
      400
    );
  }

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
    // If table doesn't exist, return error silently
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    
    if (
      errorCode === "PGRST116" || 
      errorCode === "42P01" ||
      errorCode === "PGRST202" ||
      errorCode === "PGRST205" ||
      errorMessage.includes("does not exist") ||
      errorMessage.includes("relation") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("permission denied")
    ) {
      // Table doesn't exist - return error silently
      return NextResponse.json(
        {
          success: false,
          requestId,
          code: "TABLE_NOT_FOUND",
          message: "Notifications table does not exist. Please run migrations first.",
        },
        {
          status: 404,
          headers: {
            "x-request-id": requestId,
            "Content-Type": "application/json",
          },
        }
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

  return NextResponse.json(
    { 
      success: true, 
      requestId,
      notification 
    },
    {
      status: 200,
      headers: {
        "x-request-id": requestId,
        "Content-Type": "application/json",
      },
    }
  );
}

export const POST = withErrorHandling(handlePost);

