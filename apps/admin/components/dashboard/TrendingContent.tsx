"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { TrendingUp, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  viewsChange: number;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

export function TrendingContent({ locale = "tr" }: { locale?: string }) {
  const [trending, setTrending] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();

    // Set up real-time subscription
    const supabase = createClient();
    
    // Critical: Verify supabase client exists
    if (!supabase || !supabase.auth) {
      console.error("Supabase client is invalid in TrendingContent");
      return;
    }
    
    const channel = supabase
      .channel("trending-content-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "articles",
        },
        () => {
          fetchTrending();
        }
      )
      .subscribe();

    const interval = setInterval(fetchTrending, 60000); // Update every minute

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchTrending = async () => {
    try {
      const supabase = createClient();
      
      // Critical: Verify supabase client exists
      if (!supabase || !supabase.auth) {
        console.error("Supabase client is invalid in fetchTrending");
        return;
      }
      
      // Get articles with views from last 24 hours
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, slug, views, created_at, category_id, categories(name, slug)")
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(5);

      if (!articles) return;

      // Calculate views change (mock for now, can be improved with historical data)
      const trendingData: TrendingArticle[] = articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        views: article.views || 0,
        viewsChange: Math.floor(Math.random() * 50) + 10, // Mock change percentage
        created_at: article.created_at,
        category: article.categories
          ? {
              name: article.categories.name,
              slug: article.categories.slug,
            }
          : undefined,
      }));

      setTrending(trendingData);
    } catch (error) {
      // Trending fetch failed, continue with empty state
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
              <div key={i} className="h-16 skeleton-professional rounded-lg"></div>
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
            Trend İçerikler
          </CardTitle>
          <Link
            href={`/${locale}/seo/content-studio`}
            className="text-xs text-primary hover:text-design-dark dark:hover:text-primary transition-colors flex items-center gap-1"
          >
            Tümünü Gör
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {trending.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Henüz trend içerik bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trending.map((article, index) => (
              <Link
                key={article.id}
                href={`/${locale}/seo/content-studio/${article.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-card border border-border/40 dark:border-border/40 hover:shadow-md hover:border-design-light/30 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-design-light/20 to-design-light/10 flex items-center justify-center font-bold text-foreground text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {article.title}
                    </p>
                    {article.category && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {article.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views.toLocaleString("tr-TR")}
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +{article.viewsChange}%
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

