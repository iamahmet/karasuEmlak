/**
 * Assign Content for Review API
 * POST: Assign content to a reviewer
 */

import { NextRequest, NextResponse } from "next/server";
import { assignForReview } from "@/lib/utils/workflow";
import { requireStaff } from "@/lib/auth/server";
import { createSuccessResponse, createErrorResponse, getRequestId } from "@/lib/api/error-handler";
import { logContentUpdate } from "@/lib/utils/audit-logger";
import { z } from "zod";

const assignReviewSchema = z.object({
  contentType: z.enum(["article", "news", "listing", "page"]),
  contentId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    const user = await requireStaff();
    const body = await request.json();

    const validated = assignReviewSchema.parse(body);

    const review = await assignForReview({
      contentType: validated.contentType,
      contentId: validated.contentId,
      reviewerId: validated.reviewerId,
      assignedBy: user.id,
      notes: validated.notes,
    });

    if (!review) {
      return createErrorResponse(
        requestId,
        "REVIEW_ASSIGN_ERROR",
        "Failed to assign content for review",
        null,
        500
      );
    }

    // Log the assignment
    await logContentUpdate(
      validated.contentType as any,
      validated.contentId,
      "",
      user.id,
      {
        after: {
          status: "review",
          assigned_reviewer_id: validated.reviewerId,
        },
      },
      request
    );

    return createSuccessResponse(requestId, { review }, 201);
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
      error.message || "Failed to assign content for review",
      error,
      500
    );
  }
}
