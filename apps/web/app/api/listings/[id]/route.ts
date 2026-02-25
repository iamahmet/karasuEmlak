import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Single Listing API
 * GET: Get listing by ID
 * PUT: Update listing
 * DELETE: Soft delete listing
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching listing:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: data,
    });
  } catch (error: any) {
    console.error("Get listing error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Transform data to match database schema
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map fields to database schema
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.property_type !== undefined) updateData.property_type = body.property_type;
    if (body.location_neighborhood !== undefined) updateData.location_neighborhood = body.location_neighborhood;
    if (body.location_city !== undefined) updateData.location_city = body.location_city;
    if (body.location_district !== undefined) updateData.location_district = body.location_district;
    if (body.location_address !== undefined || body.location_full_address !== undefined) {
      updateData.location_full_address = body.location_address || body.location_full_address;
    }
    if (body.coordinates_lat !== undefined) updateData.coordinates_lat = body.coordinates_lat;
    if (body.coordinates_lng !== undefined) updateData.coordinates_lng = body.coordinates_lng;
    if (body.price_amount !== undefined) updateData.price_amount = body.price_amount;
    if (body.price_currency !== undefined) updateData.price_currency = body.price_currency;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.available !== undefined) updateData.available = body.available;
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [];

    // Handle description - split into short/long if single description provided
    if (body.description !== undefined) {
      if (body.description.length <= 200) {
        updateData.description_short = body.description;
        updateData.description_long = null;
      } else {
        updateData.description_short = body.description.substring(0, 200);
        updateData.description_long = body.description;
      }
    }
    if (body.description_short !== undefined) updateData.description_short = body.description_short;
    if (body.description_long !== undefined) updateData.description_long = body.description_long;

    // Handle features - merge area_sqm, room_count, etc. into features JSONB
    if (body.area_sqm !== undefined || body.room_count !== undefined || 
        body.floor !== undefined || body.building_age !== undefined || body.features !== undefined) {
      const existingFeatures = body.features || {};
      const features: any = { ...existingFeatures };
      
      if (body.area_sqm !== undefined) features.sizeM2 = body.area_sqm;
      if (body.room_count !== undefined) features.rooms = body.room_count;
      if (body.floor !== undefined) features.floor = body.floor;
      if (body.building_age !== undefined) features.buildingAge = body.building_age;
      
      updateData.features = features;
    }

    // Handle agent info
    if (body.agent_name !== undefined) updateData.agent_name = body.agent_name;
    if (body.agent_phone !== undefined) updateData.agent_phone = body.agent_phone;
    if (body.agent_email !== undefined) updateData.agent_email = body.agent_email;
    if (body.agent_whatsapp !== undefined) updateData.agent_whatsapp = body.agent_whatsapp;

    const { data, error } = await supabase
      .from("listings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating listing:", error);
      // Handle PostgREST schema cache issues
      if (error.code === "PGRST205" || error.code === "PGRST202" || 
          error.message?.toLowerCase().includes("schema cache")) {
        return NextResponse.json(
          { error: "Database schema cache is stale. Please try again in a moment." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: data,
    });
  } catch (error: any) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("listings")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error deleting listing:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
