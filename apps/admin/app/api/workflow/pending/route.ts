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

    // Try to get pending reviews, but gracefully handle if table doesn't exist
    let reviews: any[] = [];
    try {
      reviews = await getPendingReviews(reviewerId);
    } catch (error: any) {
      // If content_reviews table doesn't exist, return empty array
      if (error.message?.toLowerCase().includes("does not exist") ||
          error.message?.toLowerCase().includes("table") ||
          error.code === "PGRST116" || error.code === "42P01") {
        console.warn(`[${requestId}] content_reviews table not found, returning empty array`);
        return createSuccessResponse(requestId, {
          reviews: [],
          count: 0,
        });
      }
      throw error;
    }

    // If contentType is specified, filter reviews
    const filteredReviews = contentType
      ? reviews.filter((r) => r.content_type === contentType)
      : reviews;

    // Get content details for each review
    const reviewsWithContent = await Promise.all(
      filteredReviews.map(async (review) => {
        try {
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
        } catch (error: any) {
          // If content table doesn't exist, return review without content
          console.warn(`[${requestId}] Content table not found for ${review.content_type}`);
          return {
            ...review,
            content: null,
          };
        }
      })
    );

    return createSuccessResponse(requestId, {
      reviews: reviewsWithContent,
      count: reviewsWithContent.length,
    });
  } catch (error: any) {
    // Handle PostgREST schema cache issues
    if (error.code === "PGRST205" || error.code === "PGRST202" || 
        error.message?.toLowerCase().includes("schema cache")) {
      return createErrorResponse(
        requestId,
        "POSTGREST_SCHEMA_STALE",
        "Database schema cache is stale. Please try again in a moment.",
        undefined,
        503
      );
    }
    
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Failed to fetch pending reviews",
      error,
      500
    );
  }
}
