/**
 * Coverage Map API
 * Returns 1 cornerstone + 5 blog posts for a cluster (titles, keywords, slugs, intent)
 */

import { NextRequest } from "next/server";
import {
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";
import { generateCoverageMapSuggestions } from "@/lib/prompts/seo-content-engine";

async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const cluster = (searchParams.get("cluster") || "karasu") as "karasu" | "sapanca";
  const pillarKeyword = searchParams.get("keyword") || "";

  if (!pillarKeyword.trim()) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "keyword parametresi gereklidir",
      undefined,
      400
    );
  }

  const suggestions = generateCoverageMapSuggestions({
    cluster,
    pillarKeyword: pillarKeyword.trim(),
  });

  return createSuccessResponse(requestId, {
    cluster,
    pillarKeyword,
    suggestions,
  });
}

export const GET = withErrorHandling(handleGet);
