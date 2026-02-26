import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@karasu/lib/audit";

/**
 * GET /api/admin/audit-logs
 * Returns audit logs for the admin panel with optional filtering.
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const eventType = searchParams.get("type") || undefined;
        const userId = searchParams.get("user_id") || undefined;
        const resourceType = searchParams.get("resource_type") || undefined;
        const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

        const logs = await getAuditLogs({
            event_type: eventType as any,
            user_id: userId,
            resource_type: resourceType,
            limit,
        });

        return NextResponse.json({ logs, count: logs.length });
    } catch (error: any) {
        console.error("[api/admin/audit-logs] Error:", error);
        return NextResponse.json({ error: error.message, logs: [], count: 0 }, { status: 500 });
    }
}
