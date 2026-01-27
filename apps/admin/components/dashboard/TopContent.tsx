"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { Eye, TrendingUp, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TopContent {
  id: string;
  title: string;
  slug: string;
  views: number;
  category?: {
    name: string;
    slug: string;
  };
}

export function TopContent({ locale = "tr" }: { locale?: string }) {
  const [topArticles, setTopArticles] = useState<TopContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopContent();

    // Set up real-time subscription for article views
    const supabase = createClient();
    const channel = supabase
      .channel("articles-views-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "articles",
          filter: "views=gt.0",
        },
        () => {
          fetchTopContent();
        }
      )
      .subscribe();

    // Set up interval for periodic updates
    const interval = setInterval(fetchTopContent, 60000); // Update every minute

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchTopContent = async () => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id,
          title,
          slug,
          views,
          category_id,
          categories (
            name,
            slug
          )
        `)
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(5);

      if (error) {
        // Table might not exist or query failed, show empty state
        setTopArticles([]);
        return;
      }

      const articles = (data || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        views: article.views || 0,
        category: article.categories
          ? {
              name: article.categories.name,
              slug: article.categories.slug,
            }
          : undefined,
      }));

      setTopArticles(articles);
    } catch (error) {
      // Top content fetch failed, continue with empty state
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 skeleton-professional rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            En Çok Okunan İçerikler
          </CardTitle>
          <Link
            href={`/${locale}/seo/content-studio`}
            className="text-xs text-primary hover:text-green-600 transition-colors flex items-center gap-1"
          >
            Tümünü Gör
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {topArticles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>İçerik bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/${locale}/seo/content-studio/${article.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-card border border-border/40 dark:border-border/40 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-design-light to-green-600 flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    {article.category && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 mt-1">
                        {article.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {article.views.toLocaleString("tr-TR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

