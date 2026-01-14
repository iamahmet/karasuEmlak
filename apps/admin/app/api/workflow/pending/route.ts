/**
 * Pending Reviews API
 * GET: Get pending reviews for current user or all pending reviews
 */

import { NextRequest, NextResponse } from "next/server";
import { getPendingReviews, getContentByStatus } from "@/lib/utils/workflow";
import { requireStaff } from "@/lib/auth/server";
import { createSuccessResponse, createErrorResponse, getRequestId } from "@/lib/api/error-handler";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    const user = await requireStaff();
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get("reviewerId") || user.id;
    const contentType = searchParams.get("contentType") || undefined;

    const reviews = await getPendingReviews(reviewerId);

    // If contentType is specified, filter reviews
    const filteredReviews = contentType
      ? reviews.filter((r) => r.content_type === contentType)
      : reviews;

    // Get content details for each review
    const reviewsWithContent = await Promise.all(
      filteredReviews.map(async (review) => {
        // Get content by status
        const contentItems = await getContentByStatus(
          review.content_type as any,
          "review" as any,
          1
        );

        return {
          ...review,
          content: contentItems[0] || null,
        };
      })
    );

    return createSuccessResponse(requestId, {
      reviews: reviewsWithContent,
      count: reviewsWithContent.length,
    });
  } catch (error: any) {
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Failed to fetch pending reviews",
      error,
      500
    );
  }
}
