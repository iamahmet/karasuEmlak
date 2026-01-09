/**
 * Request Context Utilities
 * Provides request correlation and context propagation
 */

import { headers } from "next/headers";

export interface RequestContext {
  requestId: string;
  startTime: number;
  method: string;
  path: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Get request ID from headers or generate new one
 */
export async function getRequestId(): Promise<string> {
  const headersList = await headers();
  const requestId = headersList.get("x-request-id");
  
  if (requestId) {
    return requestId;
  }
  
  // Generate new request ID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create request context from headers
 */
export async function createRequestContext(
  method: string,
  path: string
): Promise<RequestContext> {
  const headersList = await headers();
  
  return {
    requestId: await getRequestId(),
    startTime: Date.now(),
    method,
    path,
    userAgent: headersList.get("user-agent") || undefined,
    ip: headersList.get("x-forwarded-for")?.split(",")[0] || 
        headersList.get("x-real-ip") || 
        undefined,
  };
}
