/**
 * Schema Generator Page
 * Generate and manage JSON-LD structured data
 */

import { createClient } from "@/lib/supabase/server";
import { SchemaGenerator } from "@/components/seo/SchemaGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Code, Sparkles } from "lucide-react";

export default async function SchemaGeneratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const { locale } = await params;
  const { type = "articles", id: _id } = await searchParams;
  const supabase = await createClient();

  // Get items for schema generation
  let items: any[] = [];
  if (type === "articles") {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, content, featured_image, created_at, updated_at, author, category_id")
      .order("created_at", { ascending: false })
      .limit(50);
    
    // Get categories
    if (data) {
      const categoryIds = data.map(a => a.category_id).filter(Boolean);
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, slug")
        .in("id", categoryIds);
      
      items = data.map(article => ({
        ...article,
        category: categories?.find(c => c.id === article.category_id),
      }));
    }
  }

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      {/* Header - Enhanced Modern */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight flex items-center gap-3">
            <Code className="h-8 w-8 text-design-light" />
            Schema Generator
          </h1>
          <p className="text-design-gray dark:text-gray-400 text-sm md:text-base font-body font-medium">
            Generate and manage JSON-LD structured data for better SEO
          </p>
        </div>
      </div>

      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-design-light" />
            AI-Powered Schema Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
            Use AI to automatically generate optimized JSON-LD schema for your articles.
            Supports Article, NewsArticle, BreadcrumbList, and Organization schemas.
          </p>
        </CardContent>
      </Card>

      <SchemaGenerator items={items} locale={locale} />
    </div>
  );
}

