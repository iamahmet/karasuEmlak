import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const supabase = await createClient();

    // Add all published articles to sitemap queue
    const { data: articles } = await supabase
      .from("articles")
      .select("id, slug, updated_at")
      .eq("status", "published");

    if (articles && articles.length > 0) {
      const queueItems = articles.map((article) => ({
        content_type: "article",
        content_id: article.id,
        url_path: `/haber/${article.slug}`,
        lastmod: article.updated_at || new Date().toISOString(),
        priority: 0.8,
        changefreq: "weekly",
      }));

      // Clear existing queue and insert new items
      await supabase.from("sitemap_queue").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      const { error } = await supabase.from("sitemap_queue").insert(queueItems);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sitemap queue updated with ${articles?.length || 0} URLs`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

