import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";

/**
 * News Articles API
 * GET: List all news articles with filters
 */
async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const published = searchParams.get("published");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

  const supabase = createServiceClient();

  let query = supabase
    .from("news_articles")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (published !== null) {
    query = query.eq("published", published === "true");
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,original_summary.ilike.%${search}%,emlak_analysis.ilike.%${search}%`
    );
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    // If table doesn't exist, return empty array
    if (error.code === "PGRST116" || error.code === "42P01" || 
        error.message?.toLowerCase().includes("could not find the table") ||
        error.message?.toLowerCase().includes("schema cache")) {
      return createSuccessResponse(requestId, { articles: [], total: 0 });
    }
    throw error;
  }

  return createSuccessResponse(requestId, {
    articles: data || [],
    total: count || 0,
  });
}

export const GET = withErrorHandling(handleGet);
