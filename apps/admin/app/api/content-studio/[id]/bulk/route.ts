/**
 * Bulk Operations Route
 * Handles bulk operations on multiple content items
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { handleAPIError, getUserFriendlyMessage, logError } from "@/lib/errors/handle-api-error";
import { requireStaff } from "@/lib/auth/server";

/**
 * Content Studio Bulk Operations API
 * Admin API: Uses service role to bypass RLS
 */
export async function POST(
  request: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();
    const body = await request.json();
    const { action, ids } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Action and ids are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "publish":
        result = await supabase
          .from("content_items")
          .update({ status: "published", published_at: new Date().toISOString() })
          .in("id", ids);
        break;

      case "archive":
        result = await supabase
          .from("content_items")
          .update({ status: "archived" })
          .in("id", ids);
        break;

      case "delete":
        result = await supabase.from("content_items").delete().in("id", ids);
        break;

      case "reject":
        result = await supabase
          .from("content_items")
          .update({
            status: "draft",
            rejected_at: new Date().toISOString(),
          })
          .in("id", ids);
        break;

      case "duplicate":
        // Get original items
        const { data: originals } = await supabase
          .from("content_items")
          .select("*")
          .in("id", ids);

        if (!originals || originals.length === 0) {
          return NextResponse.json({ error: "Items not found" }, { status: 404 });
        }

        // Create duplicates
        const duplicates = originals.map((item) => ({
          ...item,
          id: undefined,
          slug: `${item.slug}-copy-${Date.now()}`,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        result = await supabase.from("content_items").insert(duplicates);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: ids.length,
      action,
    });
  } catch (error: unknown) {
    logError(error, "BulkOperations");
    const errorInfo = handleAPIError(error);
    return NextResponse.json(
      {
        error: getUserFriendlyMessage(errorInfo as any),
        code: errorInfo.code,
      },
      { status: errorInfo.statusCode }
    );
  }
}

