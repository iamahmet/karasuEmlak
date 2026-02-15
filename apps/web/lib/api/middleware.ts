import type { NextRequest } from "next/server";

export function getRequestId(request: NextRequest): string {
  const existing = request.headers.get("x-request-id");
  return existing || `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

