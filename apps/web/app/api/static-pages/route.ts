import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";
// import { requireStaff } from "@/lib/auth/server";

/**
 * Static Pages API
 * Get and manage static pages (hakkimizda, iletisim, etc.)
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // await requireStaff();

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const locale = searchParams.get("locale") || "tr";

  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();

  let result;
  if (slug) {
    result = await supabase
      .from("static_pages")
      .select("*")
      .eq("slug", slug)
      .eq("locale", locale)
      .single();
  } else {
    result = await supabase
      .from("static_pages")
      .select("*")
      .eq("locale", locale)
      .order("slug", { ascending: true });
  }

  const { data, error } = result;

  if (error) {
    // If table doesn't exist, return empty array
    if (error.code === "PGRST116" || error.code === "42P01" ||
        error.message?.toLowerCase().includes("could not find the table") ||
        error.message?.toLowerCase().includes("schema cache")) {
      return createSuccessResponse(requestId, { pages: [] });
    }
    throw error;
  }

  return createSuccessResponse(requestId, { pages: slug ? [data] : (data || []) });
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // await requireStaff();

  const body = await request.json();
  
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();

  const { data: page, error } = await supabase
    .from("static_pages")
    .insert(body)
    .select()
    .single();

  if (error) {
    // If table doesn't exist, return error
    if (error.code === "PGRST116" || error.code === "42P01") {
      return createErrorResponse(
        requestId,
        "TABLE_NOT_FOUND",
        "Static pages table does not exist",
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { page }, 201);
}

export const POST = withErrorHandling(handlePost);

async function handlePut(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // await requireStaff();

  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Page ID is required",
      undefined,
      400
    );
  }

  // In development, use service role to bypass RLS
  // Use service role client for admin operations
  const supabase = createServiceClient();

  const { data: page, error } = await supabase
    .from("static_pages")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "42P01") {
      return createErrorResponse(
        requestId,
        "TABLE_NOT_FOUND",
        "Static pages table does not exist",
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { page });
}

export const PUT = withErrorHandling(handlePut);
