/**
 * Restore Content Version API
 * POST: Restore content to a specific version
 */

import { NextRequest, NextResponse } from "next/server";
import { restoreContentVersion } from "@/lib/utils/version-control";
import { requireStaff } from "@/lib/auth/server";
import { createSuccessResponse, createErrorResponse, getRequestId } from "@/lib/api/error-handler";
import { z } from "zod";

const restoreVersionSchema = z.object({
  contentType: z.enum(["article", "news", "listing", "page"]),
  contentId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    const user = await requireStaff();
    const body = await request.json();

    const validated = restoreVersionSchema.parse(body);

    const success = await restoreContentVersion(
      validated.contentType,
      validated.contentId,
      validated.versionNumber,
      user.id
    );

    if (!success) {
      return createErrorResponse(
        requestId,
        "VERSION_RESTORE_ERROR",
        "Failed to restore content version",
        null,
        500
      );
    }

    return createSuccessResponse(requestId, {
      message: "Content restored successfully",
      contentType: validated.contentType,
      contentId: validated.contentId,
      versionNumber: validated.versionNumber,
    });
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
      error.message || "Failed to restore content version",
      error,
      500
    );
  }
}
