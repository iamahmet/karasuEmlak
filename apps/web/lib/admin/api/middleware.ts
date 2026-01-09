/**
 * API Middleware Utilities
 * Lightweight middleware for API routes (no fetch/db in middleware)
 */

import { NextRequest } from "next/server";
import { generateRequestId } from "./error-handler";

/**
 * Get request ID from headers or generate new one
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") || generateRequestId();
}

/**
 * Add request correlation headers to response
 */
export function addRequestHeaders(requestId: string): Record<string, string> {
  return {
    "x-request-id": requestId,
    "Content-Type": "application/json",
  };
}
