"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { Lightbulb, AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { cn } from "@karasu/lib";

interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "tip";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function QuickInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const supabase = createClient();
      
      // Fetch various metrics to generate insights
      const [
        articlesResult,
        publishedResult,
        viewsResult,
        commentsResult,
      ] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("articles").select("views").limit(100),
        (async () => {
          try {
            const result = await supabase.from("content_comments").select("id", { count: "exact", head: true });
            return result;
          } catch {
            return { count: 0, data: null, error: null };
          }
        })(),
      ]);

      const totalArticles = articlesResult.count || 0;
      const publishedArticles = publishedResult.count || 0;
      const totalViews = viewsResult.data?.reduce((sum: number, a: any) => sum + (a.views || 0), 0) || 0;
      const totalComments = commentsResult.count || 0;
      const draftCount = totalArticles - publishedArticles;
      const avgViews = publishedArticles > 0 ? Math.round(totalViews / publishedArticles) : 0;

      const generatedInsights: Insight[] = [];

      // Success insights
      if (publishedArticles > 0) {
        generatedInsights.push({
          id: "published-success",
          type: "success",
          title: `${publishedArticles} içerik yayında`,
          description: "Harika! İçerikleriniz aktif olarak yayınlanıyor.",
        });
      }

      if (totalViews > 1000) {
        generatedInsights.push({
          id: "views-success",
          type: "success",
          title: `${totalViews.toLocaleString("tr-TR")} toplam görüntülenme`,
          description: `Ortalama ${avgViews.toLocaleString("tr-TR")} görüntülenme per içerik.`,
        });
      }

      // Warning insights
      if (draftCount > 5) {
        generatedInsights.push({
          id: "drafts-warning",
          type: "warning",
          title: `${draftCount} taslak bekliyor`,
          description: "Bekleyen taslaklarınızı gözden geçirmeyi unutmayın.",
          action: {
            label: "Taslakları Gör",
            href: "/tr/seo/content-studio?tab=draft",
          },
        });
      }

      if (publishedArticles === 0 && totalArticles > 0) {
        generatedInsights.push({
          id: "no-published-warning",
          type: "warning",
          title: "Henüz yayınlanmış içerik yok",
          description: "İçeriklerinizi yayınlamayı düşünün.",
          action: {
            label: "İçerikleri Yayınla",
            href: "/tr/seo/content-studio",
          },
        });
      }

      // Info insights
      if (totalComments > 0) {
        generatedInsights.push({
          id: "comments-info",
          type: "info",
          title: `${totalComments} yorum alındı`,
          description: "Kullanıcılarınız içeriklerinizle etkileşim kuruyor.",
        });
      }

      // Tips
      if (avgViews < 10 && publishedArticles > 0) {
        generatedInsights.push({
          id: "seo-tip",
          type: "tip",
          title: "SEO optimizasyonu önerisi",
          description: "İçeriklerinizin SEO performansını artırmak için SEO Booster'ı kullanın.",
          action: {
            label: "SEO Booster'ı Aç",
            href: "/tr/seo/booster",
          },
        });
      }

      setInsights(generatedInsights.slice(0, 4)); // Limit to 4 insights
    } catch (error) {
      // Insights fetch failed, continue with empty state
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "info":
        return <Target className="h-5 w-5 text-blue-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "warning":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
  };

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 skeleton-professional rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-design-light" />
          Hızlı İçgörüler
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {insights.length === 0 ? (
          <div className="text-center py-12 text-design-gray dark:text-gray-400">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Henüz içgörü bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-design-dark dark:text-white">
                      {insight.title}
                    </p>
                    <Badge className={cn("text-[10px] px-2 py-0.5", getInsightBadge(insight.type))}>
                      {insight.type === "success" ? "Başarı" : insight.type === "warning" ? "Uyarı" : insight.type === "info" ? "Bilgi" : "İpucu"}
                    </Badge>
                  </div>
                  <p className="text-xs text-design-gray dark:text-gray-400 mb-2">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <a
                      href={insight.action.href}
                      className="text-xs text-design-light hover:text-design-dark dark:hover:text-design-light font-semibold transition-colors"
                    >
                      {insight.action.label} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

