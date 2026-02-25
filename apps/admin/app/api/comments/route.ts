import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";
import { getEnv } from "@karasu-emlak/config";

/**
 * Comments API
 * List, filter, and manage comments
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const contentId = searchParams.get("content_id");
  const listingId = searchParams.get("listing_id");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
  const isPublicScopedApprovedRead =
    status === "approved" && (!!contentId || !!listingId);
  const createEmptyCommentsResponse = (degradedReason?: string) =>
    createSuccessResponse(requestId, {
      comments: [],
      total: 0,
      ...(degradedReason ? { degraded: true, degradedReason } : {}),
    });

  // Use service client like other APIs (articles, listings, news)
  const supabase = createServiceClient();

  // Try querying the table - if it fails with cache error, we'll handle it
  let query = supabase
    .from("content_comments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (contentId) {
    query = query.eq("content_id", contentId);
  }
  if (listingId) {
    query = query.eq("listing_id", listingId);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  
  // Log query result for debugging
  console.log(`[${requestId}] Query result:`, {
    hasData: !!data,
    dataLength: data?.length || 0,
    hasError: !!error,
    errorCode: error?.code,
    errorMessage: error?.message,
    count: count || 0,
  });

  if (error) {
    // Log full error details for debugging
    console.error(`[${requestId}] Query error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    // Detect PostgREST schema cache staleness
    const isSchemaCacheStale = 
      error.code === "PGRST205" ||
      error.code === "PGRST202" ||
      (error.code === "PGRST116" && error.message?.toLowerCase().includes("schema cache")) ||
      error.message?.toLowerCase().includes("schema cache");

    // Detect table doesn't exist (different from cache stale)
    const tableDoesNotExist = 
      error.code === "PGRST116" ||
      error.code === "42P01" ||
      error.message?.toLowerCase().includes("could not find the table") ||
      error.message?.toLowerCase().includes("relation") ||
      error.message?.toLowerCase().includes("does not exist");

    if (isSchemaCacheStale) {
      console.warn(`[${requestId}] ⚠️  PostgREST schema cache is stale (${error.code}).`);
      console.warn(`[${requestId}] Table exists in database but not visible via PostgREST.`);
      if (isPublicScopedApprovedRead) {
        return createEmptyCommentsResponse("postgrest_schema_stale");
      }
      
      // Return diagnostic response with clear instructions
      return createErrorResponse(
        requestId,
        "POSTGREST_SCHEMA_STALE",
        "PostgREST schema cache is stale. Table exists in database but not visible via REST API.",
        {
          code: error.code,
          suggestion: "Run: pnpm supabase:reload-postgrest",
          documentation: "See scripts/supabase/POSTGREST_CACHE.md",
        },
        503 // Service Unavailable
      );
    }

    if (tableDoesNotExist) {
      console.warn(`[${requestId}] ⚠️  Table does not exist: content_comments`);
      if (isPublicScopedApprovedRead) {
        return createEmptyCommentsResponse("table_not_found");
      }
      return createErrorResponse(
        requestId,
        "TABLE_NOT_FOUND",
        "content_comments table does not exist. Please run migration 005_create_content_comments.sql",
        {
          migration: "scripts/db/migrations/005_create_content_comments.sql",
          suggestion: "Run: pnpm supabase:apply-migrations",
        },
        404
      );
    }

    if (isPublicScopedApprovedRead) {
      console.warn(`[${requestId}] Falling back to empty comments for public read`, {
        code: error.code,
        message: error.message,
      });
      return createEmptyCommentsResponse("comments_query_failed");
    }

    // Other errors - throw to be handled by withErrorHandling
    throw error;
  }

  return createSuccessResponse(requestId, {
    comments: data || [],
    total: count || 0,
  });
}

// Wrap with error handling, but handleGet already returns success responses for cache issues
export const GET = withErrorHandling(handleGet);

async function handleDelete(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // await requireStaff();

  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (!ids) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Comment IDs required",
      undefined,
      400
    );
  }

  const commentIds = ids.split(",");
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("content_comments")
    .delete()
    .in("id", commentIds);

  if (error) {
    throw error;
  }

  return createSuccessResponse(requestId, {
    message: `${commentIds.length} comment(s) deleted`,
  });
}

export const DELETE = withErrorHandling(handleDelete);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  
  try {
    const body = await request.json();
    const { content_id, listing_id, author_name, author_email, content, parent_id } = body;

    if (!content_id && !listing_id) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "Either content_id or listing_id is required",
        undefined,
        400
      );
    }

    if (!author_name || !content) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "author_name and content are required",
        undefined,
        400
      );
    }

    const supabase = createServiceClient();
    
    const commentData: any = {
      author_name,
      author_email: author_email || null,
      content,
      status: "pending",
      parent_id: parent_id || null,
    };

    if (content_id) {
      commentData.content_id = content_id;
    }
    if (listing_id) {
      commentData.listing_id = listing_id;
    }

    const { data, error } = await supabase
      .from("content_comments")
      .insert(commentData)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert comment:", error);
      // If table doesn't exist, provide helpful error
      if (
        error.code === "PGRST116" || 
        error.code === "42P01" || 
        error.message?.includes("does not exist") ||
        error.message?.includes("relation") ||
        error.message?.includes("table")
      ) {
        return createErrorResponse(
          requestId,
          "MIGRATION_REQUIRED",
          "content_comments table does not exist. Please run migration 005_create_content_comments.sql",
          undefined,
          500
        );
      }
      throw error;
    }

    return createSuccessResponse(requestId, {
      comment: data,
      message: "Comment created successfully",
    });
  } catch (error: any) {
    throw error;
  }
}

export const POST = withErrorHandling(handlePost);
