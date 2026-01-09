import { createServiceClient } from '../supabase/service';

/**
 * Audit event types
 */
export type AuditEventType =
  | 'content.created'
  | 'content.updated'
  | 'content.deleted'
  | 'content.published'
  | 'content.approved'
  | 'content.rejected'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.role_changed'
  | 'settings.updated'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'api.called'
  | 'error.occurred';

/**
 * Audit event data
 */
export interface AuditEvent {
  type: AuditEventType;
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log audit event to database
 * 
 * @param event - Audit event data
 * @returns Promise<void>
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Insert audit event into database
    const { error } = await supabase.from('audit_logs').insert({
      event_type: event.type,
      user_id: event.user_id || null,
      resource_type: event.resource_type || null,
      resource_id: event.resource_id || null,
      metadata: event.metadata || {},
      ip_address: event.ip_address || null,
      user_agent: event.user_agent || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // In development, log to console if database insert fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Failed to log audit event:', error.message);
        console.log('Audit event:', event);
      }
      // Don't throw error - audit logging should not break the application
    }
  } catch (error) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Audit logging error:', error);
      console.log('Audit event:', event);
    }
    // Don't throw error - audit logging should not break the application
  }
}

/**
 * Get audit logs
 * 
 * @param filters - Optional filters
 * @returns Promise<AuditEvent[]>
 */
export async function getAuditLogs(filters?: {
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  event_type?: AuditEventType;
  limit?: number;
}): Promise<any[]> {
  try {
    const supabase = createServiceClient();
    let query = supabase.from('audit_logs').select('*');

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }
    if (filters?.resource_id) {
      query = query.eq('resource_id', filters.resource_id);
    }
    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    query = query.order('created_at', { ascending: false });
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

