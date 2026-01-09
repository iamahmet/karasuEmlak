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

export default async function EditNewsPage({ params }: PageProps) {
  const { locale, id } = await params;

  const supabase = createServiceClient();

  // Fetch news article
  const { data: article, error } = await supabase
    .from("news_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching news article:", error);
    // Check if it's a "not found" error
    if (error.code === "PGRST116" || error.message?.includes("No rows")) {
      notFound();
    }
    // For other errors, still show not found to avoid exposing internal errors
    notFound();
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <NewsEditor article={article} locale={locale} />
    </div>
  );
}

