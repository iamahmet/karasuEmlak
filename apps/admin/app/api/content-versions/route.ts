/**
 * Content Versions API
 * GET: List versions for content
 * POST: Create new version
 */

import { NextRequest, NextResponse } from "next/server";
import { getContentVersions, createContentVersion } from "@/lib/utils/version-control";
import { requireStaff } from "@/lib/auth/server";
import { createSuccessResponse, createErrorResponse, getRequestId } from "@/lib/api/error-handler";
import { z } from "zod";

const createVersionSchema = z.object({
  contentType: z.enum(["article", "news", "listing", "page"]),
  contentId: z.string().uuid(),
  data: z.record(z.unknown()),
  changeNote: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    // Try to get user, but don't fail if not authenticated (graceful degrade)
    let user = null;
    try {
      user = await requireStaff();
    } catch (authError) {
      // In development, allow access without auth
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Content Versions API] Auth check failed, allowing in development mode');
      } else {
        // In production, return empty versions instead of error
        return createSuccessResponse(requestId, { versions: [] });
      }
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const contentId = searchParams.get("contentId");

    if (!contentType || !contentId) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "contentType and contentId are required",
        null,
        400
      );
    }

    const versions = await getContentVersions(contentType as any, contentId);

    return createSuccessResponse(requestId, { versions });
  } catch (error: any) {
    // Check if it's a table missing error
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    
    if (
      errorCode === "PGRST116" || 
      errorCode === "42P01" || 
      errorMessage.includes("does not exist") || 
      errorMessage.includes("relation") || 
      errorMessage.includes("not found")
    ) {
      // Table doesn't exist, return empty versions gracefully
      return createSuccessResponse(requestId, { versions: [] });
    }

    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Failed to fetch content versions",
      error,
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    const user = await requireStaff();
    const body = await request.json();

    const validated = createVersionSchema.parse(body);

    const version = await createContentVersion({
      contentType: validated.contentType,
      contentId: validated.contentId,
      data: validated.data,
      userId: user.id,
      changeNote: validated.changeNote,
    });

    if (!version) {
      return createErrorResponse(
        requestId,
        "VERSION_CREATE_ERROR",
        "Failed to create content version",
        null,
        500
      );
    }

    return createSuccessResponse(requestId, { version }, 201);
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
      error.message || "Failed to create content version",
      error,
      500
    );
  }
}
