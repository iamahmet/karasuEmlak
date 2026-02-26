import { createServiceClient } from "@/lib/supabase/clients";
import { getCurrentUser } from "@/lib/admin/auth/server";

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGIN_FAILED' | 'EXPORT' | 'SETTINGS_CHANGED';

export interface AuditLogParams {
    action: AuditAction;
    entityType: string;
    entityId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    userId?: string; // Optional, will be automatically fetched if not provided
}

/**
 * Service to log administrative actions to the database for auditing and security monitoring.
 */
export class AuditLogger {
    /**
     * Log an administrative action
     */
    static async log(params: AuditLogParams): Promise<void> {
        try {
            const supabase = createServiceClient();

            // Determine user ID if not explicitly provided
            let userId = params.userId;
            if (!userId) {
                try {
                    const user = await getCurrentUser();
                    if (user?.id) userId = user.id;
                } catch (e) {
                    // Silent fail on getCurrentUser
                }
            }

            const { error } = await supabase.from('admin_audit_logs').insert({
                user_id: userId || null,
                action: params.action,
                entity_type: params.entityType,
                entity_id: params.entityId || null,
                changes: params.changes || null,
                ip_address: params.ipAddress || null,
                user_agent: params.userAgent || null,
            });

            if (error) {
                console.error('[AuditLogger] Failed to insert audit log:', error);
            }
        } catch (e) {
            console.error('[AuditLogger] Error writing audit log:', e);
        }
    }

    /**
     * Get audit logs (for display in admin panel)
     */
    static async getLogs(options: {
        limit?: number;
        offset?: number;
        userId?: string;
        entityType?: string;
        action?: AuditAction;
    } = {}) {
        try {
            const supabase = createServiceClient();

            let query = supabase
                .from('admin_audit_logs')
                .select(`
          *,
          user:user_id(
            id,
            raw_user_meta_data
          )
        `, { count: 'exact' })
                .order('created_at', { ascending: false });

            if (options.limit) query = query.limit(options.limit);
            if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            if (options.userId) query = query.eq('user_id', options.userId);
            if (options.entityType) query = query.eq('entity_type', options.entityType);
            if (options.action) query = query.eq('action', options.action);

            const { data, error, count } = await query;

            if (error) throw error;

            return { logs: data, count };
        } catch (e) {
            console.error('[AuditLogger] Error fetching audit logs:', e);
            return { logs: [], count: 0 };
        }
    }
}
