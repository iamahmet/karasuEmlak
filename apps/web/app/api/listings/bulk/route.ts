import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Bulk Operations API for Listings
 * Handles bulk operations on multiple listings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Action and ids are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    let result: { data: any[] | null; error: any } | null = null;

    switch (action) {
      case "publish":
        result = await supabase
          .from("listings")
          .update({ published: true, updated_at: new Date().toISOString() })
          .in("id", ids);
        break;

      case "unpublish":
        result = await supabase
          .from("listings")
          .update({ published: false, updated_at: new Date().toISOString() })
          .in("id", ids);
        break;

      case "delete":
        result = await supabase
          .from("listings")
          .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .in("id", ids);
        break;

      case "feature":
        result = await supabase
          .from("listings")
          .update({ featured: true, updated_at: new Date().toISOString() })
          .in("id", ids);
        break;

      case "unfeature":
        result = await supabase
          .from("listings")
          .update({ featured: false, updated_at: new Date().toISOString() })
          .in("id", ids);
        break;

      case "make_available":
        result = await supabase
          .from("listings")
          .update({ available: true, updated_at: new Date().toISOString() })
          .in("id", ids);
        break;

      case "make_unavailable":
        result = await supabase
          .from("listings")
          .update({ available: false, updated_at: new Date().toISOString() })
          .in("id", ids);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.error) {
      console.error("Bulk operation error:", result.error);
      return NextResponse.json(
        { error: result.error.message || "Bulk operation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed for ${ids.length} listings`,
      affected: result?.data ? (Array.isArray(result.data) ? result.data.length : ids.length) : ids.length,
    });
  } catch (error: any) {
    console.error("Bulk operation exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

