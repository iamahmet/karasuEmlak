/**
 * Audit Logs API
 * GET: List audit logs with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/utils/audit-logger";
import { requireStaff } from "@/lib/auth/server";
import { createSuccessResponse, createErrorResponse, getRequestId } from "@/lib/api/error-handler";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    await requireStaff();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") || undefined;
    const resourceType = searchParams.get("resourceType") || undefined;
    const resourceId = searchParams.get("resourceId") || undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const { data, error } = await getAuditLogs({
      userId,
      action: action as any,
      resourceType: resourceType as any,
      resourceId,
      startDate,
      endDate,
      limit,
      offset,
    });

    if (error) {
      return createErrorResponse(requestId, "AUDIT_LOGS_FETCH_ERROR", "Failed to fetch audit logs", error, 500);
    }

    return createSuccessResponse(requestId, {
      logs: data,
      pagination: {
        limit,
        offset,
        total: data.length,
      },
    });
  } catch (error: any) {
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Failed to fetch audit logs",
      error,
      500
    );
  }
}
