import { NextRequest, NextResponse } from "next/server";
import { sendSavedSearchMatchNotification } from "@karasu/lib/email";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Saved Search Match Notification API
 * Sends email notification when saved search finds new matches
 * Can be called via webhook or cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "change-me-in-production";

    // Allow cron secret or proper auth
    if (
      process.env.NODE_ENV === "production" &&
      cronSecret !== expectedSecret &&
      !authHeader
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { searchId, userId, email, matches } = body;

    // Validation
    if (!searchId || !userId || !email || !matches || !Array.isArray(matches)) {
      return NextResponse.json(
        {
          error:
            "searchId, userId, email, and matches (array) are required",
        },
        { status: 400 }
      );
    }

    // Validate matches structure
    if (matches.length === 0) {
      return NextResponse.json(
        { error: "matches array cannot be empty" },
        { status: 400 }
      );
    }

    // Send notification
    const result = await sendSavedSearchMatchNotification({
      searchId,
      userId,
      email,
      matches,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Saved search match notification sent successfully",
      matchCount: matches.length,
    });
  } catch (error: any) {
    console.error("Saved search match notification API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "GET method not supported. Use POST with searchId, userId, email, and matches",
    },
    { status: 405 }
  );
}

