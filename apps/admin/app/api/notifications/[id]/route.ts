import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Notification Management API
 * Mark as read/unread or delete a notification
 * Admin API: Uses service role to bypass RLS
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    const body = await request.json();
    const { read, is_read } = body;
    const readStatus = is_read !== undefined ? is_read : read; // Support both for backward compatibility

    if (typeof readStatus !== "boolean") {
      return NextResponse.json(
        { error: "Read status must be boolean" },
        { status: 400 }
      );
    }

    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: readStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification updated",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}

