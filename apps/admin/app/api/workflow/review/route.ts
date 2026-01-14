/**
 * Submit Review API
 * POST: Submit review (approve/reject/request changes)
 */

import { NextRequest, NextResponse } from "next/server";
import { submitReview } from "@/lib/utils/workflow";
import { requireStaff } from "@/lib/auth/server";
import { createSuccessResponse, createErrorResponse, getRequestId } from "@/lib/api/error-handler";
import { logContentApproval, logContentUpdate } from "@/lib/utils/audit-logger";
import { z } from "zod";

const submitReviewSchema = z.object({
  reviewId: z.string().uuid(),
  status: z.enum(["approved", "rejected", "changes_requested"]),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    const user = await requireStaff();
    const body = await request.json();

    const validated = submitReviewSchema.parse(body);

    const review = await submitReview({
      reviewId: validated.reviewId,
      status: validated.status,
      notes: validated.notes,
      reviewerId: user.id,
    });

    if (!review) {
      return createErrorResponse(
        requestId,
        "REVIEW_SUBMIT_ERROR",
        "Failed to submit review",
        null,
        500
      );
    }

    // Log the review action
    if (validated.status === "approved") {
      await logContentApproval(
        review.content_type as any,
        review.content_id,
        "",
        user.id,
        request
      );
    } else {
      await logContentUpdate(
        review.content_type as any,
        review.content_id,
        "",
        user.id,
        {
          after: {
            status: validated.status,
            review_notes: validated.notes,
          },
        },
        request
      );
    }

    return createSuccessResponse(requestId, { review });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "Invalid request data",
        error.errors,
        400
      );
    }

    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Failed to submit review",
      error,
      500
    );
  }
}
