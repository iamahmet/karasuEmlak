/**
 * Audit Logger Utility
 * Tüm admin aktivitelerini kaydetmek için
 */

import { createServiceClient } from "@karasu/lib/supabase/service";
import type { NextRequest } from "next/server";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "approve"
  | "reject"
  | "archive"
  | "restore"
  | "assign"
  | "unassign"
  | "export"
  | "import"
  | "login"
  | "logout"
  | "role_change"
  | "settings_update";

export type ResourceType =
  | "article"
  | "news"
  | "listing"
  | "user"
  | "comment"
  | "media"
  | "navigation"
  | "page"
  | "settings"
  | "role"
  | "content_studio";

export interface AuditLogData {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  resourceSlug?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Create audit log entry
 * Uses service client to bypass RLS
 */
export async function createAuditLog(
  data: AuditLogData,
  request?: NextRequest
): Promise<string | null> {
  try {
    const supabase = createServiceClient();

    // Get user ID from request if available
    let userId: string | undefined;
    if (request) {
      const authHeader = request.headers.get("authorization");
      // Try to extract user from session if available
      // For now, we'll get it from the database query context
    }

    // Get IP address and user agent
    const ipAddress = request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || null;
    const userAgent = request?.headers.get("user-agent") || null;

    const { data: logEntry, error } = await supabase
      .from("admin_audit_logs")
      .insert({
        user_id: userId || null,
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId || null,
        resource_slug: data.resourceSlug || null,
        changes: data.changes || null,
        metadata: {
          ...data.metadata,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create audit log:", error);
      return null;
    }

    return logEntry?.id || null;
  } catch (error) {
    console.error("Error creating audit log:", error);
    return null;
  }
}

/**
 * Create audit log with user context
 * Gets user from Supabase session
 */
export async function createAuditLogWithUser(
  userId: string,
  data: AuditLogData,
  request?: NextRequest
): Promise<string | null> {
  try {
    const supabase = createServiceClient();

    const ipAddress = request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || null;
    const userAgent = request?.headers.get("user-agent") || null;

    const { data: logEntry, error } = await supabase
      .from("admin_audit_logs")
      .insert({
        user_id: userId,
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId || null,
        resource_slug: data.resourceSlug || null,
        changes: data.changes || null,
        metadata: {
          ...data.metadata,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create audit log:", error);
      return null;
    }

    return logEntry?.id || null;
  } catch (error) {
    console.error("Error creating audit log:", error);
    return null;
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    const supabase = createServiceClient();

    let query = supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters.action) {
      query = query.eq("action", filters.action);
    }

    if (filters.resourceType) {
      query = query.eq("resource_type", filters.resourceType);
    }

    if (filters.resourceId) {
      query = query.eq("resource_id", filters.resourceId);
    }

    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to get audit logs:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error getting audit logs:", error);
    return { data: [], error };
  }
}

/**
 * Helper: Log content creation
 */
export async function logContentCreation(
  resourceType: ResourceType,
  resourceId: string,
  resourceSlug: string,
  userId: string,
  request?: NextRequest
) {
  return createAuditLogWithUser(
    userId,
    {
      action: "create",
      resourceType,
      resourceId,
      resourceSlug,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    request
  );
}

/**
 * Helper: Log content update
 */
export async function logContentUpdate(
  resourceType: ResourceType,
  resourceId: string,
  resourceSlug: string,
  userId: string,
  changes: { before?: Record<string, unknown>; after?: Record<string, unknown> },
  request?: NextRequest
) {
  return createAuditLogWithUser(
    userId,
    {
      action: "update",
      resourceType,
      resourceId,
      resourceSlug,
      changes,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    request
  );
}

/**
 * Helper: Log content publish
 */
export async function logContentPublish(
  resourceType: ResourceType,
  resourceId: string,
  resourceSlug: string,
  userId: string,
  request?: NextRequest
) {
  return createAuditLogWithUser(
    userId,
    {
      action: "publish",
      resourceType,
      resourceId,
      resourceSlug,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    request
  );
}

/**
 * Helper: Log content approval
 */
export async function logContentApproval(
  resourceType: ResourceType,
  resourceId: string,
  resourceSlug: string,
  userId: string,
  request?: NextRequest
) {
  return createAuditLogWithUser(
    userId,
    {
      action: "approve",
      resourceType,
      resourceId,
      resourceSlug,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    request
  );
}
