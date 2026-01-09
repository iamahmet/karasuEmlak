import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Reports Generation API
 * Generate various reports (articles, users, comments, analytics, content)
 */
export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await request.json();
    const { type, dateRange } = body;

    if (!type || !["articles", "users", "comments", "analytics", "content"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end || new Date().toISOString();

    let reportData: any = {};

    switch (type) {
      case "articles":
        const { data: articles } = await supabase
          .from("articles")
          .select("id, title, slug, views, created_at, status")
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: false });

        reportData = {
          type: "articles",
          period: { start: startDate, end: endDate },
          total: articles?.length || 0,
          published: articles?.filter((a) => a.status === 'published').length || 0,
          totalViews: articles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0,
          articles: articles || [],
        };
        break;

      case "users":
        const { data: users } = await supabase
          .from("profiles")
          .select("id, name, email, created_at")
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: false });

        reportData = {
          type: "users",
          period: { start: startDate, end: endDate },
          total: users?.length || 0,
          users: users || [],
        };
        break;

      case "comments":
        const { data: comments } = await supabase
          .from("content_comments")
          .select("id, content, status, created_at")
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: false });

        reportData = {
          type: "comments",
          period: { start: startDate, end: endDate },
          total: comments?.length || 0,
          approved: comments?.filter((c) => c.status === "approved").length || 0,
          pending: comments?.filter((c) => c.status === "pending").length || 0,
          comments: comments || [],
        };
        break;

      case "analytics":
        const { data: events } = await supabase
          .from("events")
          .select("event_type, locale, created_at")
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        reportData = {
          type: "analytics",
          period: { start: startDate, end: endDate },
          totalEvents: events?.length || 0,
          eventsByType: events?.reduce((acc: any, e) => {
            acc[e.event_type] = (acc[e.event_type] || 0) + 1;
            return acc;
          }, {}) || {},
          eventsByLocale: events?.reduce((acc: any, e) => {
            acc[e.locale] = (acc[e.locale] || 0) + 1;
            return acc;
          }, {}) || {},
        };
        break;

      case "content":
        const { data: contentItems } = await supabase
          .from("content_items")
          .select("id, slug, status, created_at, content_locales (title)")
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: false });

        reportData = {
          type: "content",
          period: { start: startDate, end: endDate },
          total: contentItems?.length || 0,
          published: contentItems?.filter((c) => c.status === "published").length || 0,
          draft: contentItems?.filter((c) => c.status === "draft").length || 0,
          content: contentItems || [],
        };
        break;
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}

