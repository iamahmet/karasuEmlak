import type { NextRequest } from "next/server";
import { getRequestId as getRequestIdFromErrorHandler } from "./error-handler";

// Compatibility shim: older routes import getRequestId from this module.
export function getRequestId(request: NextRequest): string {
  return getRequestIdFromErrorHandler(request);
}

