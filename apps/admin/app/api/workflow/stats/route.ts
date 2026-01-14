/**
 * Workflow Stats API
 * GET: Get workflow statistics
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

    // Get pending reviews count
    const { count: pendingCount } = await supabase
      .from("content_reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Get approved reviews count
    const { count: approvedCount } = await supabase
      .from("content_reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    // Get rejected reviews count
    const { count: rejectedCount } = await supabase
      .from("content_reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    // Get changes requested reviews count
    const { count: changesRequestedCount } = await supabase
      .from("content_reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "changes_requested");

    // Get total reviews count
    const { count: totalCount } = await supabase
      .from("content_reviews")
      .select("*", { count: "exact", head: true });

    const stats = {
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      rejected: rejectedCount || 0,
      changesRequested: changesRequestedCount || 0,
      total: totalCount || 0,
    };

    return createSuccessResponse(requestId, { stats });
  } catch (error: any) {
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Failed to fetch workflow stats",
      error,
      500
    );
  }
}
