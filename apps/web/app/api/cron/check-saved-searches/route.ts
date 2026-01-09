import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { sendSavedSearchMatchNotification } from "@karasu/lib/email";
import { getListings } from "@/lib/supabase/queries/listings";
import { sendPushNotificationToUser } from "@/lib/pwa/send-push-notification";

/**
 * Cron Job: Check Saved Search Matches
 * Runs daily to check saved searches and send notifications for new matches
 * 
 * Vercel Cron Configuration:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-saved-searches",
 *     "schedule": "0 10 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "change-me-in-production";

    // In production, require cron secret
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${expectedSecret}` &&
      cronSecret !== expectedSecret
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get all active saved searches (if table exists)
    let savedSearches: any[] = [];
    try {
      const { data, error: searchesError } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("active", true)
        .is("deleted_at", null);

      if (searchesError) {
        console.error("Error fetching saved searches:", searchesError);
        // Table might not exist yet, return success with 0 count
        return NextResponse.json({
          success: true,
          message: "Saved searches table not available",
          count: 0,
        });
      }

      savedSearches = data || [];
    } catch (error) {
      // Table might not exist yet
      return NextResponse.json({
        success: true,
        message: "Saved searches table not available",
        count: 0,
      });
    }

    if (savedSearches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active saved searches found",
        count: 0,
      });
    }

    const notificationsSent = [];
    const errors = [];

    for (const savedSearch of savedSearches) {
      try {
        // Parse search parameters
        const searchParams = savedSearch.search_params as Record<string, any>;
        if (!searchParams) {
          continue;
        }

        // Convert search params to ListingFilters format
        const filters: any = {};
        if (searchParams.status) filters.status = searchParams.status;
        if (searchParams.property_type) {
          filters.property_type = Array.isArray(searchParams.property_type)
            ? searchParams.property_type
            : [searchParams.property_type];
        }
        if (searchParams.location_neighborhood) {
          filters.location_neighborhood = Array.isArray(
            searchParams.location_neighborhood
          )
            ? searchParams.location_neighborhood
            : [searchParams.location_neighborhood];
        }
        if (searchParams.min_price) filters.min_price = Number(searchParams.min_price);
        if (searchParams.max_price) filters.max_price = Number(searchParams.max_price);
        if (searchParams.min_size) filters.min_size = Number(searchParams.min_size);
        if (searchParams.max_size) filters.max_size = Number(searchParams.max_size);
        if (searchParams.rooms) {
          filters.rooms = Array.isArray(searchParams.rooms)
            ? searchParams.rooms
            : [searchParams.rooms];
        }

        // Get listings matching the search
        const { listings } = await getListings(filters, undefined, 50, 0);

        if (listings.length === 0) {
          continue; // No matches
        }

        // Get listings created since last notification
        const lastNotificationDate = savedSearch.last_notified_at
          ? new Date(savedSearch.last_notified_at)
          : new Date(savedSearch.created_at);

        const newMatches = listings.filter((listing) => {
          const listingDate = new Date(listing.created_at);
          return listingDate > lastNotificationDate;
        });

        if (newMatches.length === 0) {
          continue; // No new matches
        }

        // Format matches for email
        const formattedMatches = newMatches.slice(0, 10).map((listing) => ({
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          price_amount: listing.price_amount,
          price_currency: listing.price_currency,
          location_neighborhood: listing.location_neighborhood,
          images: listing.images,
        }));

        // Get user email
        const { data: user } = await supabase
          .from("users")
          .select("email")
          .eq("id", savedSearch.user_id)
          .single();

        if (!user || !user.email) {
          errors.push({
            searchId: savedSearch.id,
            error: "User email not found",
          });
          continue;
        }

        // Send email notification
        const emailResult = await sendSavedSearchMatchNotification({
          searchId: savedSearch.id,
          userId: savedSearch.user_id,
          email: user.email,
          matches: formattedMatches,
        });

        // Send push notification
        const pushResult = await sendPushNotificationToUser(
          savedSearch.user_id || null,
          user.email || null,
          {
            title: "🔔 Yeni İlan Eşleşmesi",
            body: `Kayıtlı aramanız için ${formattedMatches.length} yeni ilan bulundu!`,
            url: `/aramalarim`,
            tag: `saved-search-${savedSearch.id}`,
          }
        );

        if (emailResult.success || pushResult.success > 0) {
          // Update last_notified_at
          await supabase
            .from("saved_searches")
            .update({ last_notified_at: new Date().toISOString() })
            .eq("id", savedSearch.id);

          notificationsSent.push({
            searchId: savedSearch.id,
            userId: savedSearch.user_id,
            matchCount: formattedMatches.length,
            emailSent: emailResult.success,
            pushSent: pushResult.success,
          });
        } else {
          errors.push({
            searchId: savedSearch.id,
            error: emailResult.error || pushResult.errors.join(", "),
          });
        }
      } catch (error: any) {
        console.error(
          `Error processing saved search ${savedSearch.id}:`,
          error
        );
        errors.push({
          searchId: savedSearch.id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Saved search check completed",
      savedSearchesCount: savedSearches.length,
      notificationsSent: notificationsSent.length,
      errors: errors.length,
      details: {
        notificationsSent: notificationsSent.slice(0, 10),
        errors: errors.slice(0, 10), // Limit error details
      },
    });
  } catch (error: any) {
    console.error("Saved search cron job error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

