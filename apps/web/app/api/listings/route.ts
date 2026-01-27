import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";
import { serializeListings } from "@/lib/serialize/toSerializable";

/**
 * Listings API
 * GET: List all listings with filters
 * POST: Create a new listing
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const typeParam = searchParams.get("type") || searchParams.get("purpose");
  const status =
    statusParam ||
    (typeParam === "rent" ? "kiralik" : typeParam === "sale" ? "satilik" : typeParam);
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
    // Handle PostgREST schema cache issues
    if (error.code === "PGRST205" || error.code === "PGRST202" || 
        error.message?.toLowerCase().includes("schema cache") ||
        error.message?.toLowerCase().includes("schema_cache")) {
      return createErrorResponse(
        requestId,
        "POSTGREST_SCHEMA_STALE",
        "Database schema cache is stale. Please try again in a moment.",
        undefined,
        503
      );
    }
    // If table doesn't exist, return empty array
    if (error.code === "PGRST116" || error.code === "42P01" ||
        error.message?.toLowerCase().includes("could not find the table")) {
      return createSuccessResponse(requestId, { listings: [], total: 0 });
    }
    throw error;
  }

  // Serialize listings to ensure safe JSON response
  const serializedListings = data ? serializeListings(data) : [];

  return createSuccessResponse(requestId, {
    listings: serializedListings,
    total: count || 0,
  });
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  const body = await request.json();
  const supabase = createServiceClient();

  // Transform data to match database schema
  const listingData: any = {
    title: body.title,
    slug: body.slug,
    status: body.status,
    property_type: body.property_type,
    location_neighborhood: body.location_neighborhood,
    location_city: body.location_city || "Sakarya",
    location_district: body.location_district || "Karasu",
    location_full_address: body.location_address || body.location_full_address,
    coordinates_lat: body.coordinates_lat || null,
    coordinates_lng: body.coordinates_lng || null,
    price_amount: body.price_amount || null,
    price_currency: body.price_currency || "TRY",
    description_short: body.description_short || (body.description ? body.description.substring(0, 200) : null),
    description_long: body.description_long || (body.description && body.description.length > 200 ? body.description : null),
    images: Array.isArray(body.images) ? body.images : [],
    published: body.published ?? false,
    featured: body.featured ?? false,
    available: body.available ?? true,
  };

  // Handle features - merge area_sqm, room_count, etc. into features JSONB
  const features: any = body.features || {};
  if (body.area_sqm !== undefined) {
    features.sizeM2 = body.area_sqm;
  }
  if (body.room_count !== undefined) {
    features.rooms = body.room_count;
  }
  if (body.floor !== undefined) {
    features.floor = body.floor;
  }
  if (body.building_age !== undefined) {
    features.buildingAge = body.building_age;
  }
  listingData.features = features;

  // Handle agent info if provided
  if (body.agent_name) listingData.agent_name = body.agent_name;
  if (body.agent_phone) listingData.agent_phone = body.agent_phone;
  if (body.agent_email) listingData.agent_email = body.agent_email;
  if (body.agent_whatsapp) listingData.agent_whatsapp = body.agent_whatsapp;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert(listingData)
    .select()
    .single();

  if (error) {
    console.error("Listing insert error:", error);
    if (error.code === "PGRST116" || error.code === "42P01") {
      return createErrorResponse(
        requestId,
        "TABLE_NOT_FOUND",
        "Listings table does not exist",
        undefined,
        404
      );
    }
    // Handle PostgREST schema cache issues
    if (error.code === "PGRST205" || error.code === "PGRST202" || 
        error.message?.toLowerCase().includes("schema cache")) {
      return createErrorResponse(
        requestId,
        "POSTGREST_SCHEMA_STALE",
        "Database schema cache is stale. Please try again in a moment.",
        undefined,
        503
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { listing }, 201);
}

export const POST = withErrorHandling(handlePost);
