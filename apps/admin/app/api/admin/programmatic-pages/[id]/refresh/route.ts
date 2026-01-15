/**
 * Refresh Programmatic Page API
 * POST: Manually refresh/update a programmatic page
 */

import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

async function handlePost(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    // Get page info
    const { data: page, error: fetchError } = await supabase
      .from("programmatic_pages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !page) {
      return createErrorResponse(
        requestId,
        "NOT_FOUND",
        "Sayfa bulunamadı",
        null,
        404
      );
    }

    // Update last_updated timestamp
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

    // TODO: Implement actual data refresh logic based on page type
    // For now, we just update the timestamp
    // In the future, this could:
    // - Fetch prayer times from API
    // - Update weather data
    // - Refresh job listings
    // - etc.

    return createSuccessResponse(requestId, {
      page: updatedPage,
      message: "Sayfa güncellendi",
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

export const POST = withErrorHandling(handlePost);
