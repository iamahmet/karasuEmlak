import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { sendPriceChangeNotification } from "@karasu/lib/email";
import { sendPushNotificationToUser } from "@/lib/pwa/send-push-notification";
import { verifyCronSecret } from "@/lib/cron/verify-cron-secret";

/**
 * Cron Job: Check Price Changes
 * Runs daily to check for price changes and send notifications to users who favorited listings
 * 
 * Vercel Cron Configuration:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-price-changes",
 *     "schedule": "0 9 * * *"
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

    // Get listings updated in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: updatedListings, error: listingsError } = await supabase
      .from("listings")
      .select("*")
      .eq("published", true)
      .eq("available", true)
      .is("deleted_at", null)
      .gte("updated_at", oneDayAgo.toISOString())
      .not("price_amount", "is", null)
      .order("updated_at", { ascending: false });

    if (listingsError) {
      console.error("Error fetching updated listings:", listingsError);
      return NextResponse.json(
        { error: "Failed to fetch updated listings" },
        { status: 500 }
      );
    }

    if (!updatedListings || updatedListings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No updated listings found",
        count: 0,
      });
    }

    // Check for price changes
    // In production, you'd have a price_history table to track changes
    // For now, we'll check if price was updated recently
    const priceChanges = [];
    const notificationsSent = [];
    const errors = [];

    for (const listing of updatedListings) {
      // Get price history or check if price notification was already sent today
      const today = new Date().toISOString().split("T")[0];
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id, metadata")
        .eq("type", "price_change")
        .eq("metadata->>listing_id", listing.id)
        .gte("created_at", `${today}T00:00:00.000Z`)
        .limit(1);

      if (existingNotification && existingNotification.length > 0) {
        // Check if price actually changed
        const lastNotification = existingNotification[0];
        const lastPrice = lastNotification.metadata?.new_price;
        if (lastPrice === listing.price_amount) {
          continue; // Price hasn't changed since last notification
        }
      }

      // Get users who favorited this listing (if favorites table exists)
      let favorites: any[] = [];
      try {
        const { data: favs } = await supabase
          .from("favorites")
          .select("user_id, user_email, metadata")
          .eq("listing_id", listing.id)
          .limit(100);
        favorites = favs || [];
      } catch (error) {
        // Favorites table might not exist yet, skip
        console.log("Favorites table not available, skipping price change notifications");
      }

      if (favorites.length > 0) {
        // Get previous price from notification metadata or use a default
        const previousPrice =
          existingNotification?.[0]?.metadata?.new_price ||
          listing.price_amount; // Fallback to current price (not ideal)

        // Only notify if price actually changed
        if (previousPrice !== listing.price_amount && listing.price_amount) {
          priceChanges.push({
            listingId: listing.id,
            oldPrice: previousPrice,
            newPrice: listing.price_amount,
          });

          for (const favorite of favorites) {
            try {
              // Send email notification
              const emailResult = await sendPriceChangeNotification({
                listingId: listing.id,
                oldPrice: previousPrice,
                newPrice: listing.price_amount,
                userId: favorite.user_id,
                email: favorite.user_email || undefined,
              });

              // Send push notification
              const pushResult = await sendPushNotificationToUser(
                favorite.user_id || null,
                favorite.user_email || null,
                {
                  title: "💰 Fiyat Değişikliği",
                  body: `${listing.title || "İlan"} fiyatı değişti: ${previousPrice} → ${listing.price_amount} TL`,
                  url: `/ilan/${listing.slug || listing.id}`,
                  tag: `price-change-${listing.id}`,
                }
              );

              if (emailResult.success || pushResult.success > 0) {
                notificationsSent.push({
                  listingId: listing.id,
                  userId: favorite.user_id,
                  emailSent: emailResult.success,
                  pushSent: pushResult.success,
                });
              } else {
                errors.push({
                  listingId: listing.id,
                  userId: favorite.user_id,
                  error: emailResult.error || pushResult.errors.join(", "),
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
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price change check completed",
      updatedListingsCount: updatedListings.length,
      priceChangesCount: priceChanges.length,
      notificationsSent: notificationsSent.length,
      errors: errors.length,
      details: {
        priceChanges,
        notificationsSent: notificationsSent.slice(0, 10),
        errors: errors.slice(0, 10), // Limit error details
      },
    });
  } catch (error: any) {
    console.error("Price change cron job error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

