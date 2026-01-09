import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

/**
 * Media Library API
 * List and manage media files from both storage and media_assets table
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // await requireStaff();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "all";
  const aiGenerated = searchParams.get("aiGenerated");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Admin API: ALWAYS use service role client
  // Storage operations also need service role for admin access
  const supabase = createServiceClient();
  const serviceClient = supabase; // Use same client for both

  // Fetch files from storage
  const bucket = "media";
  let { data: storageFiles, error: storageError } = await supabase.storage
    .from(bucket)
    .list("", {
      limit: 1000,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

  // Fetch AI-generated images from media_assets table
  let mediaAssetsQuery = serviceClient
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter by AI generated if specified
  if (aiGenerated === "true") {
    mediaAssetsQuery = mediaAssetsQuery.eq("ai_generated", true);
  } else if (aiGenerated === "false") {
    mediaAssetsQuery = mediaAssetsQuery.eq("ai_generated", false);
  }

  const { data: mediaAssets, error: mediaAssetsError } = await mediaAssetsQuery;

  // Combine storage files and media assets
  const allFiles: any[] = [];

  // Add storage files
  if (!storageError && storageFiles) {
    for (const file of storageFiles) {
      // Skip if it's not an image/video or doesn't match type filter
      if (type !== "all") {
        const extensions = type === "image" 
          ? [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
          : [".mp4", ".webm", ".mov"];
        if (!extensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
          continue;
        }
      }

      // Filter by search query
      if (search && !file.name.toLowerCase().includes(search.toLowerCase())) {
        continue;
      }

      const { data: urlData } = await supabase.storage
        .from(bucket)
        .getPublicUrl(file.name);

      allFiles.push({
        id: file.id || file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        mimeType: file.metadata?.mimetype || "",
        createdAt: file.created_at,
        updatedAt: file.updated_at,
        url: urlData.publicUrl,
        source: "storage",
        aiGenerated: false,
      });
    }
  }

  // Add media assets (AI-generated images from database)
  if (!mediaAssetsError && mediaAssets) {
    for (const asset of mediaAssets) {
      // Filter by search query
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          (asset.title?.toLowerCase().includes(searchLower)) ||
          (asset.alt_text?.toLowerCase().includes(searchLower)) ||
          (asset.cloudinary_public_id?.toLowerCase().includes(searchLower));
        if (!matchesSearch) {
          continue;
        }
      }

      // Filter by type (only images for now)
      if (type === "video") {
        continue;
      }

      allFiles.push({
        id: asset.id,
        name: asset.title || asset.cloudinary_public_id || `AI Image ${asset.id.slice(0, 8)}`,
        size: asset.bytes || 0,
        mimeType: asset.format ? `image/${asset.format}` : "image/jpeg",
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
        url: asset.cloudinary_secure_url,
        source: "media_assets",
        aiGenerated: asset.ai_generated || false,
        cloudinaryPublicId: asset.cloudinary_public_id,
        altText: asset.alt_text,
        assetType: asset.asset_type,
        entityType: asset.entity_type,
        entityId: asset.entity_id,
        width: asset.width,
        height: asset.height,
        usageCount: asset.usage_count || 0,
        generationCost: asset.generation_cost,
      });
    }
  }

  // Sort by created_at descending
  allFiles.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  // Apply pagination
  const paginatedFiles = allFiles.slice(offset, offset + limit);

  const response = createSuccessResponse(requestId, {
    files: paginatedFiles,
    total: allFiles.length,
    hasMore: offset + limit < allFiles.length,
  });
  
  // Cache for 1 minute (media list changes frequently)
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  
  return response;
}

export const GET = withErrorHandling(handleGet);

async function handleDelete(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // await requireStaff();

  const { searchParams } = new URL(request.url);
  const paths = searchParams.get("paths");

  if (!paths) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "File paths required",
      undefined,
      400
    );
  }

  const filePaths = paths.split(",");
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("media")
    .remove(filePaths);

  if (error) {
    throw error;
  }

  return createSuccessResponse(requestId, {
    message: `${filePaths.length} file(s) deleted`,
  });
}

export const DELETE = withErrorHandling(handleDelete);
