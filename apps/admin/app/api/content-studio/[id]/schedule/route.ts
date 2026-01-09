/**
 * Content Scheduling Route
 * Schedules content for future publishing
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { scheduleContent } from "@karasu/lib/content/publishing";
import { handleAPIError, getUserFriendlyMessage, logError } from "@/lib/errors/handle-api-error";
import { requireStaff } from "@/lib/auth/server";

/**
 * Content Studio Schedule API
 * Admin API: Uses service role to bypass RLS
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();
    const { locale, scheduleDate } = body;

    if (!locale || !scheduleDate) {
      return NextResponse.json(
        { error: "Locale and scheduleDate are required" },
        { status: 400 }
      );
    }

    const publishDate = new Date(scheduleDate);
    if (publishDate <= new Date()) {
      return NextResponse.json(
        { error: "Schedule date must be in the future" },
        { status: 400 }
      );
    }

    // Update content item with scheduled date
    const { error: updateError } = await supabase
      .from("content_items")
      .update({
        published_at: publishDate.toISOString(),
        status: "review", // Keep in review until scheduled time
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Get current user for scheduling
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Schedule the publish
    await scheduleContent(id, publishDate, user.id);

    return NextResponse.json({
      success: true,
      scheduledAt: publishDate.toISOString(),
      message: `Content scheduled for ${publishDate.toLocaleString("tr-TR")}`,
    });
  } catch (error: unknown) {
    logError(error, "ContentScheduling");
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    const supabase = createServiceClient();
    const { id } = await params;

    // Remove scheduled date
    const { error } = await supabase
      .from("content_items")
      .update({
        published_at: null,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Schedule removed",
    });
  } catch (error: unknown) {
    logError(error, "RemoveSchedule");
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

