import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

/**
 * Listings API
 * GET: List all listings with filters
 * POST: Create a new listing
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const propertyType = searchParams.get("property_type");
  const neighborhood = searchParams.get("neighborhood");
  const published = searchParams.get("published");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

  const supabase = createServiceClient();

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (propertyType) {
    query = query.eq("property_type", propertyType);
  }

  if (neighborhood) {
    query = query.eq("location_neighborhood", neighborhood);
  }

  if (published !== null) {
    query = query.eq("published", published === "true");
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description_short.ilike.%${search}%,description_long.ilike.%${search}%`
    );
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    // If table doesn't exist, return empty array
    if (error.code === "PGRST116" || error.code === "42P01" ||
        error.message?.toLowerCase().includes("could not find the table") ||
        error.message?.toLowerCase().includes("schema cache")) {
      return createSuccessResponse(requestId, { listings: [], total: 0 });
    }
    throw error;
  }

  return createSuccessResponse(requestId, {
    listings: data || [],
    total: count || 0,
  });
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  const body = await request.json();
  const supabase = createServiceClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .insert(body)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "42P01") {
      return createErrorResponse(
        requestId,
        "TABLE_NOT_FOUND",
        "Listings table does not exist",
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { listing }, 201);
}

export const POST = withErrorHandling(handlePost);
