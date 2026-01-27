/**
 * Metadata Editor Page
 * Edit meta titles, descriptions, and Open Graph tags for all pages
 */

import { createClient } from "@/lib/supabase/server";
import { MetadataEditor } from "@/components/seo/MetadataEditor";
import { TypeSelector } from "@/components/seo/TypeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Search } from "lucide-react";

import { setRequestLocale } from "next-intl/server";

export default async function MetadataEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const { locale } = await params;
  const { type = "articles", id: _id } = await searchParams;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const supabase = await createClient();

  // Get items based on type
  let items: any[] = [];
  if (type === "articles") {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, meta_title, meta_description, canonical_url")
      .order("created_at", { ascending: false })
      .limit(100);
    items = data || [];
  } else if (type === "content") {
    const { data } = await supabase
      .from("content_items")
      .select(`
        id,
        slug,
        content_locales (
          locale,
          title,
          meta_title,
          meta_description
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);
    items = data || [];
  }

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      {/* Header - Enhanced Modern */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2 tracking-tight">
            Metadata Editor
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-body font-medium">
            Edit meta titles, descriptions, and Open Graph tags for all pages
          </p>
        </div>
      </div>

      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex gap-2">
            <TypeSelector
              type={type}
              locale={locale}
              options={[
                { value: "articles", label: "Articles" },
                { value: "content", label: "Content Items" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <MetadataEditor items={items} type={type} locale={locale} />
    </div>
  );
}

