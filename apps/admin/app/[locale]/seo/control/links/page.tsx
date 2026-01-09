/**
 * Internal Links Manager Page
 * AI-powered internal linking suggestions and management
 */

import { createClient } from "@/lib/supabase/server";
import { InternalLinksManager } from "@/components/seo/InternalLinksManager";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Link2, Sparkles } from "lucide-react";

import { setRequestLocale } from "next-intl/server";

export default async function InternalLinksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { locale } = await params;
  const { id } = await searchParams;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const supabase = await createClient();

  // Get all articles for linking
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, content, excerpt")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);

  // Get specific article if ID provided
  let targetArticle = null;
  if (id) {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, content, excerpt")
      .eq("id", id)
      .single();
    targetArticle = data;
  }

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      {/* Header - Enhanced Modern */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight flex items-center gap-3">
            <Link2 className="h-8 w-8 text-design-light" />
            Internal Links Manager
          </h1>
          <p className="text-design-gray dark:text-gray-400 text-sm md:text-base font-body font-medium">
            AI-powered internal linking suggestions and management
          </p>
        </div>
      </div>

      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-design-light" />
            AI-Powered Link Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
            Automatically analyze your content and suggest relevant internal links to improve SEO and user engagement.
          </p>
        </CardContent>
      </Card>

      <InternalLinksManager
        articles={articles || []}
        targetArticle={targetArticle}
        locale={locale}
      />
    </div>
  );
}

