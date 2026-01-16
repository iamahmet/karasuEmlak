import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { verifyCronSecret } from "@/lib/cron/verify-cron-secret";

/**
 * Publish Scheduled Content API
 * Publishes content that has reached its scheduled publish time
 * This should be called by a cron job or scheduled task
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends Authorization: Bearer <CRON_SECRET>)
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    // Get scheduled articles (articles uses status field)
    const { data: scheduledArticles, error: articlesError } = await supabase
      .from("articles")
      .select("id, title, scheduled_publish_at")
      .eq("status", "draft")
      .not("scheduled_publish_at", "is", null)
      .lte("scheduled_publish_at", now);

    if (articlesError) {
      console.error("Error fetching scheduled articles:", articlesError);
    }

    // Get scheduled news articles
    const { data: scheduledNews, error: newsError } = await supabase
      .from("news_articles")
      .select("id, title, scheduled_publish_at")
      .eq("published", false)
      .not("scheduled_publish_at", "is", null)
      .lte("scheduled_publish_at", now);

    if (newsError) {
      console.error("Error fetching scheduled news:", newsError);
    }

    const results = {
      articles: { published: 0, errors: [] as string[] },
      news: { published: 0, errors: [] as string[] },
    };

    // Publish scheduled articles
    if (scheduledArticles && scheduledArticles.length > 0) {
      for (const article of scheduledArticles) {
        const { error } = await supabase
          .from("articles")
          .update({
            status: "published",
            published_at: article.scheduled_publish_at,
            scheduled_publish_at: null,
            updated_at: now,
          })
          .eq("id", article.id);

        if (error) {
          results.articles.errors.push(`${article.title}: ${error.message}`);
        } else {
          results.articles.published++;
        }
      }
    }

    // Publish scheduled news articles
    if (scheduledNews && scheduledNews.length > 0) {
      for (const news of scheduledNews) {
        const { error } = await supabase
          .from("news_articles")
          .update({
            published: true,
            published_at: news.scheduled_publish_at,
            scheduled_publish_at: null,
            updated_at: now,
          })
          .eq("id", news.id);

        if (error) {
          results.news.errors.push(`${news.title}: ${error.message}`);
        } else {
          results.news.published++;
        }
      }
    }

    const totalPublished = results.articles.published + results.news.published;
    const totalErrors = results.articles.errors.length + results.news.errors.length;

    return NextResponse.json({
      success: true,
      message: `Published ${totalPublished} scheduled content items`,
      results,
      totalPublished,
      totalErrors,
    });
  } catch (error: any) {
    console.error("Publish scheduled content exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

