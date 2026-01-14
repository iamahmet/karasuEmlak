/**
 * Version Control Utility
 * İçerik versiyonlarını yönetmek için
 */

import { createServiceClient } from "@karasu/lib/supabase/service";

export type ContentType = "article" | "news" | "listing" | "page";

export interface ContentVersion {
  id: string;
  content_type: ContentType;
  content_id: string;
  version_number: number;
  data: Record<string, unknown>;
  created_by: string | null;
  change_note: string | null;
  is_current: boolean;
  created_at: string;
}

export interface CreateVersionParams {
  contentType: ContentType;
  contentId: string;
  data: Record<string, unknown>;
  userId: string;
  changeNote?: string;
}

/**
 * Create a new version of content
 */
export async function createContentVersion(params: CreateVersionParams): Promise<ContentVersion | null> {
  try {
    const supabase = createServiceClient();

    // Get current version number
    const { data: currentVersion } = await supabase
      .from("content_versions")
      .select("version_number")
      .eq("content_type", params.contentType)
      .eq("content_id", params.contentId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = currentVersion ? currentVersion.version_number + 1 : 1;

    // Mark all previous versions as not current
    await supabase
      .from("content_versions")
      .update({ is_current: false })
      .eq("content_type", params.contentType)
      .eq("content_id", params.contentId);

    // Create new version
    const { data: version, error } = await supabase
      .from("content_versions")
      .insert({
        content_type: params.contentType,
        content_id: params.contentId,
        version_number: nextVersionNumber,
        data: params.data,
        created_by: params.userId,
        change_note: params.changeNote || null,
        is_current: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create content version:", error);
      return null;
    }

    // Update content table's current_version_number
    const tableName = getTableName(params.contentType);
    if (tableName) {
      await supabase
        .from(tableName)
        .update({ current_version_number: nextVersionNumber })
        .eq("id", params.contentId);
    }

    return version as ContentVersion;
  } catch (error) {
    console.error("Error creating content version:", error);
    return null;
  }
}

/**
 * Get all versions for a content item
 */
export async function getContentVersions(
  contentType: ContentType,
  contentId: string
): Promise<ContentVersion[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("content_versions")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("version_number", { ascending: false });

    if (error) {
      console.error("Failed to get content versions:", error);
      return [];
    }

    return (data || []) as ContentVersion[];
  } catch (error) {
    console.error("Error getting content versions:", error);
    return [];
  }
}

/**
 * Get a specific version
 */
export async function getContentVersion(
  contentType: ContentType,
  contentId: string,
  versionNumber: number
): Promise<ContentVersion | null> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("content_versions")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("version_number", versionNumber)
      .single();

    if (error) {
      console.error("Failed to get content version:", error);
      return null;
    }

    return data as ContentVersion;
  } catch (error) {
    console.error("Error getting content version:", error);
    return null;
  }
}

/**
 * Restore content to a specific version
 */
export async function restoreContentVersion(
  contentType: ContentType,
  contentId: string,
  versionNumber: number,
  userId: string
): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    // Get the version to restore
    const version = await getContentVersion(contentType, contentId, versionNumber);
    if (!version) {
      return false;
    }

    // Update content with version data
    const tableName = getTableName(contentType);
    if (!tableName) {
      return false;
    }

    // Remove system fields from version data
    const { id, created_at, updated_at, current_version_number, ...restoreData } = version.data as Record<string, unknown>;

    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        ...restoreData,
        updated_at: new Date().toISOString(),
        current_version_number: versionNumber,
      })
      .eq("id", contentId);

    if (updateError) {
      console.error("Failed to restore content version:", updateError);
      return false;
    }

    // Mark this version as current
    await supabase
      .from("content_versions")
      .update({ is_current: false })
      .eq("content_type", contentType)
      .eq("content_id", contentId);

    await supabase
      .from("content_versions")
      .update({ is_current: true })
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("version_number", versionNumber);

    // Create a new version with restored data (for history)
    await createContentVersion({
      contentType,
      contentId,
      data: restoreData as Record<string, unknown>,
      userId,
      changeNote: `Restored from version ${versionNumber}`,
    });

    return true;
  } catch (error) {
    console.error("Error restoring content version:", error);
    return false;
  }
}

/**
 * Compare two versions
 */
export async function compareVersions(
  contentType: ContentType,
  contentId: string,
  version1: number,
  version2: number
): Promise<{
  version1: ContentVersion | null;
  version2: ContentVersion | null;
  differences: Record<string, { before: unknown; after: unknown }>;
} | null> {
  try {
    const v1 = await getContentVersion(contentType, contentId, version1);
    const v2 = await getContentVersion(contentType, contentId, version2);

    if (!v1 || !v2) {
      return null;
    }

    const differences: Record<string, { before: unknown; after: unknown }> = {};

    // Compare all fields
    const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)]);

    for (const key of allKeys) {
      const val1 = v1.data[key];
      const val2 = v2.data[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences[key] = {
          before: val1,
          after: val2,
        };
      }
    }

    return {
      version1: v1,
      version2: v2,
      differences,
    };
  } catch (error) {
    console.error("Error comparing versions:", error);
    return null;
  }
}

/**
 * Delete old versions (keep only last N versions)
 */
export async function cleanupOldVersions(
  contentType: ContentType,
  contentId: string,
  keepLast: number = 10
): Promise<number> {
  try {
    const supabase = createServiceClient();

    // Get all versions
    const versions = await getContentVersions(contentType, contentId);

    if (versions.length <= keepLast) {
      return 0;
    }

    // Get versions to delete (oldest ones)
    const versionsToDelete = versions
      .sort((a, b) => a.version_number - b.version_number)
      .slice(0, versions.length - keepLast);

    const idsToDelete = versionsToDelete.map((v) => v.id);

    const { error } = await supabase
      .from("content_versions")
      .delete()
      .in("id", idsToDelete);

    if (error) {
      console.error("Failed to cleanup old versions:", error);
      return 0;
    }

    return versionsToDelete.length;
  } catch (error) {
    console.error("Error cleaning up old versions:", error);
    return 0;
  }
}

/**
 * Helper: Get table name from content type
 */
function getTableName(contentType: ContentType): string | null {
  const tableMap: Record<ContentType, string> = {
    article: "articles",
    news: "news",
    listing: "listings",
    page: "pages",
  };

  return tableMap[contentType] || null;
}
