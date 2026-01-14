/**
 * Recent Workflow Activity API
 * GET: Get recent workflow activities
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { requireStaff } from "@/lib/auth/server";
import { createSuccessResponse, createErrorResponse, getRequestId } from "@/lib/api/error-handler";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    await requireStaff();
    const supabase = createServiceClient();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;

    // Get recent reviews with reviewer info
    const { data: reviews, error } = await supabase
      .from("content_reviews")
      .select(`
        id,
        content_type,
        content_id,
        status,
        reviewer_id,
        created_at,
        reviewed_at,
        reviewer:reviewer_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return createErrorResponse(
        requestId,
        "FETCH_ERROR",
        "Failed to fetch recent activities",
        error,
        500
      );
    }

    // Format activities
    const activities = (reviews || []).map((review: any) => ({
      id: review.id,
      content_type: review.content_type,
      content_id: review.content_id,
      status: review.status,
      reviewer: review.reviewer
        ? {
            name:
              review.reviewer.raw_user_meta_data?.name ||
              review.reviewer.raw_user_meta_data?.full_name ||
              null,
            email: review.reviewer.email,
          }
        : null,
      created_at: review.created_at,
      reviewed_at: review.reviewed_at,
    }));

    return createSuccessResponse(requestId, { activities });
  } catch (error: any) {
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Failed to fetch recent activities",
      error,
      500
    );
  }
}
