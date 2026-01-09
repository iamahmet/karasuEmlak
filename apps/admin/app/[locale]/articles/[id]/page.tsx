import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

const ArticleEditorAdvanced = dynamic(
  () => import("@/components/articles/ArticleEditorAdvanced").then((mod) => ({ default: mod.ArticleEditorAdvanced })),
  {
    loading: () => <PageSkeleton />,
  }
);

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Makale Düzenle #${id.substring(0, 8)} | Admin Panel`,
    description: "Karasu Emlak Admin Panel - Makale Düzenle",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EditArticlePage({ params }: PageProps) {
  const { locale, id } = await params;
  
  // Use service role in development to bypass RLS
  let supabase;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (process.env.NODE_ENV === "development" && serviceRoleKey && supabaseUrl) {
    try {
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
    } catch (error) {
      supabase = await createClient();
    }
  } else {
    supabase = await createClient();
  }

  // Fetch article (without category join to avoid PGRST200 error)
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch category separately if category_id exists
  let category = null;
  if (article?.category_id) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .eq("id", article.category_id)
      .single();
    category = categoryData;
  }

  if (error) {
    console.error("Error fetching article:", error);
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

  // Fetch categories for dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">Makale Düzenle</h1>
          <p className="admin-page-description">
            {article.title}
          </p>
        </div>
      </div>

      <ArticleEditorAdvanced
        article={{ ...article, category: category ? { id: category.id, name: category.name, slug: category.slug, description: category.description } : undefined }}
        categories={categories || []}
        locale={locale}
      />
    </div>
  );
}
