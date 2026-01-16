import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { sendNewListingNotification } from "@karasu/lib/email";
import { verifyCronSecret } from "@/lib/cron/verify-cron-secret";

/**
 * Cron Job: Check New Listings
 * Runs hourly to check for new listings and send notifications to subscribed users
 * 
 * Vercel Cron Configuration:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-new-listings",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends Authorization: Bearer <CRON_SECRET>)
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get listings created in the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: newListings, error: listingsError } = await supabase
      .from("listings")
      .select("*")
      .eq("published", true)
      .eq("available", true)
      .is("deleted_at", null)
      .gte("created_at", oneHourAgo.toISOString())
      .order("created_at", { ascending: false });

    if (listingsError) {
      console.error("Error fetching new listings:", listingsError);
      return NextResponse.json(
        { error: "Failed to fetch new listings" },
        { status: 500 }
      );
    }

    if (!newListings || newListings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new listings found",
        count: 0,
      });
    }

    // For now, we'll check if there are users subscribed to new listings
    // In production, implement proper subscription system with user_preferences table
    const notificationsSent = [];
    const errors = [];

    for (const listing of newListings) {
      // Check if notification already sent for this listing
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("type", "new_listing")
        .eq("metadata->>listing_id", listing.id)
        .limit(1);

      if (existingNotification && existingNotification.length > 0) {
        continue; // Already notified
      }

      // Try to get users who have favorited this listing (if favorites table exists)
      let favorites: any[] = [];
      try {
        const { data: favs } = await supabase
          .from("favorites")
          .select("user_id, user_email")
          .eq("listing_id", listing.id)
          .limit(100);
        favorites = favs || [];
      } catch (error) {
        // Favorites table might not exist yet, skip
        console.log("Favorites table not available, skipping favorite-based notifications");
      }

      // For now, if no favorites, we'll skip notification
      // In production, implement proper subscription system
      if (favorites.length === 0) {
        continue;
      }

      for (const favorite of favorites) {
        try {
          const result = await sendNewListingNotification({
            listingId: listing.id,
            userId: favorite.user_id,
            email: favorite.user_email || undefined,
          });

          if (result.success) {
            notificationsSent.push({
              listingId: listing.id,
              userId: favorite.user_id,
            });
          } else {
            errors.push({
              listingId: listing.id,
              userId: favorite.user_id,
              error: result.error,
            });
          }
        } catch (error: any) {
          errors.push({
            listingId: listing.id,
            userId: favorite.user_id,
            error: error.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cron job completed",
      newListingsCount: newListings.length,
      notificationsSent: notificationsSent.length,
      errors: errors.length,
      details: {
        notificationsSent,
        errors: errors.slice(0, 10), // Limit error details
      },
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

