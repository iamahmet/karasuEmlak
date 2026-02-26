import { createServiceClient } from "@/lib/supabase/clients";
import { getCurrentUser } from "@/lib/admin/auth/server";

export interface VersionControlParams {
    entityType: string;
    entityId: string;
    content: Record<string, any>;
    commitMessage?: string;
    userId?: string;
}

/**
 * Service to handle content versions and historical snapshots
 */
export class ContentVersionManager {
    /**
     * Save a new version of the content
     */
    static async createVersion(params: VersionControlParams): Promise<void> {
        try {
            const supabase = createServiceClient();

            // Determine user ID if not explicitly provided
            let userId = params.userId;
            if (!userId) {
                try {
                    const user = await getCurrentUser();
                    if (user?.id) userId = user.id;
                } catch (e) {
                    // Silent fail
                }
            }

            // Read current max version
            const { data: latestVersion, error: latestError } = await supabase
                .from('content_versions')
                .select('version_num')
                .eq('entity_type', params.entityType)
                .eq('entity_id', params.entityId)
                .order('version_num', { ascending: false })
                .limit(1)
                .single();

            const newVersionNum = (latestVersion?.version_num || 0) + 1;

            const { error } = await supabase.from('content_versions').insert({
                entity_type: params.entityType,
                entity_id: params.entityId,
                version_num: newVersionNum,
                content: params.content,
                created_by: userId || null,
                commit_message: params.commitMessage || null,
            });

            if (error) {
                console.error('[ContentVersionManager] Failed to create version:', error);
            }
        } catch (e) {
            console.error('[ContentVersionManager] Error writing version:', e);
        }
    }

    /**
     * Get version history for a specific entity
     */
    static async getHistory(entityType: string, entityId: string, limit: number = 20) {
        try {
            const supabase = createServiceClient();

            const { data, error } = await supabase
                .from('content_versions')
                .select(`
          id, version_num, created_at, commit_message,
          user:created_by(id, raw_user_meta_data)
        `)
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('version_num', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data || [];
        } catch (e) {
            console.error('[ContentVersionManager] Error fetching version history:', e);
            return [];
        }
    }

    /**
     * Get a specific version's content
     */
    static async getVersionContent(entityType: string, entityId: string, versionNum: number) {
        try {
            const supabase = createServiceClient();

            const { data, error } = await supabase
                .from('content_versions')
                .select('content')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .eq('version_num', versionNum)
                .single();

            if (error) throw error;

            return data?.content || null;
        } catch (e) {
            console.error('[ContentVersionManager] Error fetching version content:', e);
            return null;
        }
    }
}
