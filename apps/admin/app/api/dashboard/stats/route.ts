import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

/**
 * Dashboard Stats API
 * Get dashboard statistics and metrics
 * 
 * Admin API: Uses service role to bypass RLS
 */
async function handleGet(_request: NextRequest) {
  const requestId = getRequestId(_request);
  // Development mode: Skip auth check
  // await requireStaff();

  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();

  // Get article counts
  let totalArticles = 0;
  try {
    const { count } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true });
    totalArticles = count || 0;
  } catch (error) {
    // Table might not exist, continue with 0
  }

  let publishedArticles = 0;
  try {
    const { count } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");
    publishedArticles = count || 0;
  } catch (error) {
    // Table might not exist, continue with 0
  }

  let draftArticles = 0;
  try {
    const { count } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft");
    draftArticles = count || 0;
  } catch (error) {
    // Table might not exist, continue with 0
  }

  // Get user counts
  let totalUsers = 0;
  try {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    totalUsers = count || 0;
  } catch (error) {
    // Table might not exist, continue with 0
  }

  // Get comment counts
  let totalComments = 0;
  try {
    const { count } = await supabase
      .from("content_comments")
      .select("*", { count: "exact", head: true });
    totalComments = count || 0;
  } catch (error) {
    // Table might not exist, continue with 0
  }

  let pendingComments = 0;
  try {
    const { count } = await supabase
      .from("content_comments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingComments = count || 0;
  } catch (error) {
    // Table might not exist, continue with 0
  }

  // Get recent articles
  let recentArticles: any[] = [];
  try {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, created_at, views, status")
      .order("created_at", { ascending: false })
      .limit(5);
    
    recentArticles = (data || []).map((article: any) => ({
      ...article,
      is_published: article.status === 'published',
    }));
  } catch (error) {
    // Table might not exist, continue with empty array
  }

  // Get recent activity (mock for now, can be enhanced with audit_logs table)
  const recentActivity = [
    {
      id: "1",
      type: "article",
      action: "created",
      user: "Admin",
      target: recentArticles?.[0]?.title || "Yeni Makale",
      timestamp: new Date().toISOString(),
    },
  ];

  return createSuccessResponse(requestId, {
    stats: {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
      },
      users: {
        total: totalUsers,
      },
      comments: {
        total: totalComments,
        pending: pendingComments,
      },
      recentArticles: recentArticles,
      recentActivity: recentActivity,
    },
  });
}

export const GET = withErrorHandling(handleGet);
