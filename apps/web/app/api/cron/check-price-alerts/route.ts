import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { getListings } from "@/lib/supabase/queries/listings";
import { sendPushNotificationToUser } from "@/lib/pwa/send-push-notification";
import { verifyCronSecret } from "@/lib/cron/verify-cron-secret";
import { sendPriceAlertNotification } from "@karasu/lib/email";

/**
 * Cron Job: Check Price Alerts
 * Runs hourly - finds new listings matching price alert filters and sends notifications
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: alerts, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("status", "active")
      .eq("email_notifications", true);

    if (error || !alerts?.length) {
      return NextResponse.json({
        success: true,
        message: "No active price alerts",
        count: 0,
      });
    }

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const notificationsSent: Array<{ alertId: string; listingCount: number }> = [];
    const errors: Array<{ alertId: string; error: string }> = [];

    for (const alert of alerts) {
      try {
        const f = alert.filters || {};
        const filters: any = {};
        if (f.min_price) filters.min_price = Number(f.min_price);
        if (f.max_price) filters.max_price = Number(f.max_price);
        if (f.property_type) filters.property_type = [f.property_type];
        if (f.location) filters.location_city = [f.location];
        if (f.neighborhood) filters.location_neighborhood = [f.neighborhood];
        filters.status = "satilik";

        const { listings } = await getListings(filters, { field: "created_at", order: "desc" }, 50, 0);

        const lastChecked = alert.last_checked_at ? new Date(alert.last_checked_at) : new Date(0);
        const newMatches = listings.filter((l) => new Date(l.created_at) > lastChecked);

        if (newMatches.length === 0) {
          await supabase
            .from("price_alerts")
            .update({ last_checked_at: new Date().toISOString() })
            .eq("id", alert.id);
          continue;
        }

        const result = await sendPriceAlertNotification({
          alertId: alert.id,
          email: alert.email,
          matches: newMatches.slice(0, 10).map((l) => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            price_amount: l.price_amount,
            price_currency: l.price_currency,
            location_neighborhood: l.location_neighborhood,
            images: l.images,
          })),
        });

        if (result.success) {
          await supabase
            .from("price_alerts")
            .update({
              last_checked_at: new Date().toISOString(),
              notified_at: new Date().toISOString(),
              matches_count: (alert.matches_count || 0) + newMatches.length,
            })
            .eq("id", alert.id);

          if (alert.push_notifications) {
            await sendPushNotificationToUser(alert.user_id, alert.email, {
              title: "🔔 Yeni İlan Eşleşmesi",
              body: `Fiyat uyarınız için ${newMatches.length} yeni ilan bulundu!`,
              url: "/satilik",
              tag: `price-alert-${alert.id}`,
            });
          }

          notificationsSent.push({ alertId: alert.id, listingCount: newMatches.length });
        } else {
          errors.push({ alertId: alert.id, error: result.error || "Unknown" });
        }
      } catch (err: any) {
        errors.push({ alertId: alert.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price alerts check completed",
      alertsChecked: alerts.length,
      notificationsSent: notificationsSent.length,
      errors: errors.length,
      details: { notificationsSent, errors: errors.slice(0, 10) },
    });
  } catch (err: any) {
    console.error("Price alerts cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
