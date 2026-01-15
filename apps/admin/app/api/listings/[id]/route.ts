import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { createContentVersion } from "@/lib/utils/version-control";
import { requireStaff } from "@/lib/auth/server";

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

    // Get current user for version tracking
    let userId: string | null = null;
    try {
      const user = await requireStaff();
      userId = user.id;
    } catch (error) {
      // If auth fails, continue without version tracking
      console.warn("[Listing API] Could not get user for version tracking");
    }

    // Get current listing data for version snapshot
    const { data: currentListing } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("listings")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating listing:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Create version snapshot if significant changes detected
    if (currentListing && userId) {
      const significantFields = ['title', 'description', 'price_amount', 'property_type'];
      const hasSignificantChanges = significantFields.some(field => {
        const oldValue = currentListing[field as keyof typeof currentListing];
        const newValue = body[field];
        return oldValue !== newValue;
      });

      if (hasSignificantChanges) {
        try {
          await createContentVersion({
            contentType: "listing",
            contentId: id,
            data: data as Record<string, unknown>,
            userId,
            changeNote: body.changeNote || "İlan güncellendi",
          });
        } catch (versionError) {
          // Don't fail the update if version creation fails
          console.error("[Listing API] Error creating version:", versionError);
        }
      }
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

