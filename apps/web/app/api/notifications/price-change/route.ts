import { NextRequest, NextResponse } from "next/server";
import { sendPriceChangeNotification } from "@karasu/lib/email";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Price Change Notification API
 * Sends email notification when a listing price changes
 * Can be called via webhook or cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request authorization
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
    const { listingId, oldPrice, newPrice, userId, email } = body;

    // Validation
    if (!listingId || !email || oldPrice === undefined || newPrice === undefined) {
      return NextResponse.json(
        {
          error:
            "listingId, email, oldPrice, and newPrice are required",
        },
        { status: 400 }
      );
    }

    // Validate prices are numbers
    const oldPriceNum = Number(oldPrice);
    const newPriceNum = Number(newPrice);

    if (isNaN(oldPriceNum) || isNaN(newPriceNum)) {
      return NextResponse.json(
        { error: "oldPrice and newPrice must be valid numbers" },
        { status: 400 }
      );
    }

    // Send notification
    const result = await sendPriceChangeNotification({
      listingId,
      oldPrice: oldPriceNum,
      newPrice: newPriceNum,
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
      message: "Price change notification sent successfully",
    });
  } catch (error: any) {
    console.error("Price change notification API error:", error);
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
  const oldPrice = searchParams.get("oldPrice");
  const newPrice = searchParams.get("newPrice");
  const userId = searchParams.get("userId");

  if (!listingId || !email || !oldPrice || !newPrice) {
    return NextResponse.json(
      {
        error:
          "listingId, email, oldPrice, and newPrice query parameters are required",
      },
      { status: 400 }
    );
  }

  try {
    const oldPriceNum = Number(oldPrice);
    const newPriceNum = Number(newPrice);

    if (isNaN(oldPriceNum) || isNaN(newPriceNum)) {
      return NextResponse.json(
        { error: "oldPrice and newPrice must be valid numbers" },
        { status: 400 }
      );
    }

    const result = await sendPriceChangeNotification({
      listingId,
      oldPrice: oldPriceNum,
      newPrice: newPriceNum,
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
      message: "Test price change notification sent successfully",
    });
  } catch (error: any) {
    console.error("Test price change notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

