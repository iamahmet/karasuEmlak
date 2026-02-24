/**
 * Refresh Programmatic Page API
 * POST: Manually refresh/update a programmatic page
 */

import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { refreshPrayerTimes } from "@karasu/lib/prayer-times-refresh";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://karasuemlak.net";

async function handlePost(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    const { data: page, error: fetchError } = await supabase
      .from("programmatic_pages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !page) {
      return createErrorResponse(requestId, "NOT_FOUND", "Sayfa bulunamadı", null, 404);
    }

    const pageType = (page.type || "").toLowerCase();
    const config = (page.config || {}) as Record<string, string>;
    const city = config.city || "Sakarya";
    const district = config.district || "Karasu";

    let refreshResult: { success: boolean; message?: string; rowsUpserted?: number } = {
      success: true,
      message: "Zaman damgası güncellendi",
    };

    if (["prayer_times", "imsakiye", "iftar"].includes(pageType)) {
      const result = await refreshPrayerTimes({
        year: new Date().getFullYear(),
        districtId: config.district_id ? Number(config.district_id) : 9803,
      });
      refreshResult = {
        success: result.success,
        message: result.success ? `${result.rowsUpserted ?? 0} vakit kaydı güncellendi` : result.error,
        rowsUpserted: result.rowsUpserted,
      };
    } else if (pageType === "pharmacy") {
      try {
        const res = await fetch(
          `${SITE_URL}/api/services/pharmacy?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}&cache=false`
        );
        const json = await res.json();
        refreshResult = {
          success: json.success === true,
          message: json.success ? "Nöbetçi eczane verisi yenilendi" : json.error || "Yenileme başarısız",
        };
      } catch (err: any) {
        refreshResult = { success: false, message: err?.message || "Eczane API hatası" };
      }
    }

    const { data: updatedPage, error: updateError } = await supabase
      .from("programmatic_pages")
      .update({
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse(requestId, {
      page: updatedPage,
      message: refreshResult.message || "Sayfa güncellendi",
      refreshSuccess: refreshResult.success,
      ...(refreshResult.rowsUpserted != null && { rowsUpserted: refreshResult.rowsUpserted }),
    });
  } catch (error: any) {
    console.error("Programmatic page refresh error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Sayfa güncellenemedi",
      error,
      500
    );
  }
}

export const POST = withErrorHandling(async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
  const params = context?.params || Promise.resolve({ id: "" });
  return handlePost(request, { params });
});
