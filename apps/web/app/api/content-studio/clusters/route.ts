import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";

/**
 * Content Studio Clusters API
 * Admin API: Uses service role to bypass RLS
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();

  // Gracefully handle if topic_clusters table doesn't exist
  const { data: clusters, error } = await supabase
    .from("topic_clusters")
    .select(`
      *,
      cluster_items (
        content_item_id,
        role,
        content_items (
          slug,
          status
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    // If table doesn't exist, return empty array
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    
    if (
      errorCode === "PGRST116" || 
      errorCode === "42P01" ||
      errorMessage.includes("does not exist") ||
      (errorMessage.includes("relation") && errorMessage.includes("does not exist"))
    ) {
      console.warn(`[${requestId}] topic_clusters table not found, returning empty array`);
      return createSuccessResponse(requestId, { clusters: [] });
    }
    
    throw new Error(`Database query failed: ${error.message}`);
  }

  // Add spoke count
  const clustersWithCounts = (clusters || []).map((cluster: any) => ({
    ...cluster,
    spoke_count: cluster.cluster_items?.filter((ci: any) => ci.role === "spoke").length || 0,
  }));

  return createSuccessResponse(requestId, { clusters: clustersWithCounts });
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();
  const body = await request.json();

  const { name, description } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Name is required and must be a non-empty string",
      { provided: name },
      400
    );
  }

  // Gracefully handle if topic_clusters table doesn't exist
  const { data: cluster, error } = await supabase
    .from("topic_clusters")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || "";
    
    if (
      errorCode === "PGRST116" || 
      errorCode === "42P01" ||
      errorMessage.includes("does not exist") ||
      (errorMessage.includes("relation") && errorMessage.includes("does not exist"))
    ) {
      console.warn(`[${requestId}] topic_clusters table not found`);
      return createErrorResponse(
        requestId,
        "TABLE_NOT_FOUND",
        "Topic clusters feature is not available. Please create the topic_clusters table first.",
        undefined,
        404
      );
    }
    
    throw new Error(`Database insert failed: ${error.message}`);
  }

  return createSuccessResponse(requestId, { success: true, cluster });
}

export const POST = withErrorHandling(handlePost);
