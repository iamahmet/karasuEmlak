import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";
import { createServiceClient } from "@karasu/lib/supabase/service";

const NewsEditorAdvanced = dynamic(
  () => import("@/components/news/NewsEditorAdvanced").then((mod) => ({ default: mod.NewsEditorAdvanced })),
  {
    loading: () => <PageSkeleton />,
  }
);

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditNewsPage({ params }: PageProps) {
  const { locale, id } = await params;

  console.log(`[Edit News Page] Loading news article: ${id} for locale: ${locale}`);

  const supabase = createServiceClient();

  // Fetch news article
  const { data: article, error } = await supabase
    .from("news_articles")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null) // Exclude deleted articles
    .single();

  if (error) {
    console.error("[Edit News Page] Error fetching news article:", JSON.stringify(error, null, 2));
    // Check if it's a "not found" error
    if (error.code === "PGRST116" || error.code === "42P01" || error.message?.includes("No rows") || error.message?.includes("not found")) {
      console.warn(`[Edit News Page] News article not found: ${id}`);
      notFound();
    }
    // For other errors, still show not found to avoid exposing internal errors
    console.error("[Edit News Page] Unexpected error, showing not found");
    notFound();
  }

  if (!article) {
    console.warn(`[Edit News Page] No article data returned for id: ${id}`);
    notFound();
  }

  console.log(`[Edit News Page] Successfully loaded news article: ${article.title}`);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <NewsEditorAdvanced article={article} locale={locale} />
    </div>
  );
}

