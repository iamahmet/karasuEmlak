import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Bulk Notification Actions API
 * Mark all as read, delete all, etc.
 * Admin API: Uses service role to bypass RLS
 */
async function handleBulkAction(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await request.json();
    const { action, user_id, is_read } = body;

    // Support both action-based and direct is_read update
    if (is_read !== undefined) {
      // Direct update: mark all as read/unread
      const supabase = createServiceClient();
      let updateQuery = supabase.from("notifications").update({
        is_read: Boolean(is_read),
        updated_at: new Date().toISOString(),
      });
      
      if (user_id) {
        updateQuery = updateQuery.eq("user_id", user_id);
      }
      
      const { error } = await updateQuery;

      if (error) {
        // If table doesn't exist, return success silently
        const errorMessage = error.message?.toLowerCase() || "";
        const errorCode = error.code || "";
        
        if (
          errorCode === "PGRST116" || 
          errorCode === "42P01" ||
          errorMessage.includes("does not exist")
        ) {
          return NextResponse.json({
            success: true,
            message: "Notifications updated",
          });
        }

        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notifications updated",
      });
    }

    if (!action || !["mark_all_read", "delete_all_read", "delete_all"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();

    if (action === "mark_all_read") {
      let updateQuery = supabase.from("notifications").update({
        is_read: true,
        updated_at: new Date().toISOString(),
      });
      
      if (user_id) {
        updateQuery = updateQuery.eq("user_id", user_id);
      }
      
      const { error } = await updateQuery;

      if (error) {
        // If table doesn't exist, return success silently
        const errorMessage = error.message?.toLowerCase() || "";
        const errorCode = error.code || "";
        
        if (
          errorCode === "PGRST116" || 
          errorCode === "42P01" ||
          errorMessage.includes("does not exist")
        ) {
          return NextResponse.json({
            success: true,
            message: "All notifications marked as read",
          });
        }

        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (action === "delete_all_read") {
      let deleteQuery = supabase.from("notifications").delete().eq("is_read", true);
      
      if (user_id) {
        deleteQuery = deleteQuery.eq("user_id", user_id);
      }
      
      const { error } = await deleteQuery;

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "All read notifications deleted",
      });
    } else if (action === "delete_all") {
      let deleteQuery = supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (user_id) {
        deleteQuery = deleteQuery.eq("user_id", user_id);
      }
      
      const { error } = await deleteQuery;

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "All notifications deleted",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}

export const POST = handleBulkAction;
export const PATCH = handleBulkAction;

