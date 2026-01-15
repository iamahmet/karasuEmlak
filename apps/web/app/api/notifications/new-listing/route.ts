import { NextRequest, NextResponse } from "next/server";
import { sendNewListingNotification } from "@karasu/lib/email";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * New Listing Notification API
 * Sends email notification when a new listing is created
 * Can be called via webhook or cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request authorization (in production, add proper auth)
    const authHeader = request.headers.get("authorization");
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = (process.env.CRON_SECRET || "change-me-in-production").trim();

    // Allow cron secret or proper auth
    if (
      process.env.NODE_ENV === "production" &&
      cronSecret !== expectedSecret &&
      !authHeader
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, userId, email } = body;

    // Validation
    if (!listingId || !email) {
      return NextResponse.json(
        { error: "listingId and email are required" },
        { status: 400 }
      );
    }

    // Send notification
    const result = await sendNewListingNotification({
      listingId,
      userId,
      email,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error: any) {
    console.error("New listing notification API error:", error);
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
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");
  const email = searchParams.get("email");
  const userId = searchParams.get("userId");

  if (!listingId || !email) {
    return NextResponse.json(
      { error: "listingId and email query parameters are required" },
      { status: 400 }
    );
  }

  try {
    const result = await sendNewListingNotification({
      listingId,
      userId: userId || undefined,
      email,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
    });
  } catch (error: any) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

