import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";
import { createServiceClient } from "@karasu/lib/supabase/service";

const NewsEditor = dynamic(
  () => import("@/components/news/NewsEditor").then((mod) => ({ default: mod.NewsEditor })),
  {
    loading: () => <PageSkeleton />,
  }
);

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { locale, id } = await params;
  
  // Development mode: Skip auth check
  // await requireStaff();

  // Use service role client (admin API)
  const supabase = createServiceClient();

  console.log(`[News Page] Loading news article: ${id} for locale: ${locale}`);

  // Fetch news article (this route is for news, not articles)
  const { data: article, error } = await supabase
    .from("news_articles")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null) // Exclude deleted articles
    .single();

  if (error) {
    console.error("[News Page] Error fetching article:", JSON.stringify(error, null, 2));
    // Check if it's a "not found" error
    if (error.code === "PGRST116" || error.code === "42P01" || error.message?.includes("No rows") || error.message?.includes("not found")) {
      console.warn(`[News Page] News article not found: ${id}`);
      notFound();
    }
    // For other errors, still show not found to avoid exposing internal errors
    console.error("[News Page] Unexpected error, showing not found");
    notFound();
  }

  if (!article) {
    console.warn(`[News Page] No article data returned for id: ${id}`);
    notFound();
  }

  console.log(`[News Page] Successfully loaded news article: ${article.title}`);

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <NewsEditor article={article} locale={locale} />
    </div>
  );
}

