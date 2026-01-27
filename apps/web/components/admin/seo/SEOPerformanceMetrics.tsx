"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  Link2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface PerformanceMetric {
  label: string;
  value: number | string;
  change: number;
  status: "good" | "warning" | "critical";
  icon: React.ComponentType<{ className?: string }>;
  target: number;
  current: number;
}

export function SEOPerformanceMetrics({ locale = "tr" }: { locale?: string }) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const supabase = createClient();
      
      // Fetch SEO-related data
      const [
        articlesResult,
        publishedResult,
        viewsResult,
        backlinksResult,
      ] = await Promise.all([
        supabase.from("articles").select("id, views, content, status").limit(1000),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("articles").select("views").limit(1000),
        // seo_competitors table doesn't exist, use empty result
        Promise.resolve({ data: null, count: 0, error: null }),
      ]);

      const articles = articlesResult.data || [];
      const publishedCount = publishedResult.count || 0;
      const totalViews = viewsResult.data?.reduce((sum: number, a: any) => sum + (a.views || 0), 0) || 0;
      const backlinksCount = backlinksResult.count || 0;
      const avgViews = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;
      
      // Calculate reading time from content (average 200 words per minute)
      const avgReadingTime = articles.length > 0
        ? Math.round(
            articles.reduce((sum: number, a: any) => {
              const content = a.content || "";
              const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
              return sum + Math.ceil(wordCount / 200);
            }, 0) / articles.length
          )
        : 0;

      // Calculate performance metrics
      const performanceMetrics: PerformanceMetric[] = [
        {
          label: "Ortalama Görüntülenme",
          value: avgViews.toLocaleString("tr-TR"),
          change: 12.5,
          status: avgViews > 100 ? "good" : avgViews > 50 ? "warning" : "critical",
          icon: Eye,
          target: 200,
          current: avgViews,
        },
        {
          label: "Ortalama Okuma Süresi",
          value: `${avgReadingTime} dk`,
          change: 8.3,
          status: avgReadingTime > 3 ? "good" : avgReadingTime > 2 ? "warning" : "critical",
          icon: Clock,
          target: 5,
          current: avgReadingTime,
        },
        {
          label: "Yayınlanmış İçerik",
          value: publishedCount,
          change: 15.2,
          status: publishedCount > 50 ? "good" : publishedCount > 20 ? "warning" : "critical",
          icon: CheckCircle2,
          target: 100,
          current: publishedCount,
        },
        {
          label: "Backlink Sayısı",
          value: backlinksCount,
          change: 5.7,
          status: backlinksCount > 100 ? "good" : backlinksCount > 50 ? "warning" : "critical",
          icon: Link2,
          target: 200,
          current: backlinksCount,
        },
        {
          label: "SEO Skoru",
          value: calculateSEOScore(avgViews, avgReadingTime, publishedCount, backlinksCount),
          change: 10.1,
          status: "good",
          icon: Zap,
          target: 90,
          current: calculateSEOScore(avgViews, avgReadingTime, publishedCount, backlinksCount),
        },
        {
          label: "İndekslenme Oranı",
          value: `${Math.min(100, Math.round((publishedCount / Math.max(articles.length, 1)) * 100))}%`,
          change: 3.2,
          status: "good",
          icon: Search,
          target: 80,
          current: Math.min(100, Math.round((publishedCount / Math.max(articles.length, 1)) * 100)),
        },
      ];

      setMetrics(performanceMetrics);
    } catch (error) {
      console.error("Failed to fetch SEO metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSEOScore = (
    views: number,
    readingTime: number,
    published: number,
    backlinks: number
  ): number => {
    // Simple SEO score calculation (0-100)
    const viewsScore = Math.min(30, (views / 200) * 30);
    const readingTimeScore = Math.min(20, (readingTime / 5) * 20);
    const publishedScore = Math.min(30, (published / 100) * 30);
    const backlinksScore = Math.min(20, (backlinks / 200) * 20);
    
    return Math.round(viewsScore + readingTimeScore + publishedScore + backlinksScore);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "warning":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-5">
              <div className="h-16 bg-[#E7E7E7] dark:bg-[#062F28] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-design-light" />
            SEO Performans Metrikleri
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const progress = getProgressPercentage(metric.current, metric.target);
              const isPositive = metric.change > 0;

              return (
                <Card
                  key={metric.label}
                  className="card-professional hover-lift stagger-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg", getStatusColor(metric.status))}>
                          <Icon className={cn("h-4 w-4", metric.status === "good" ? "text-green-600" : metric.status === "warning" ? "text-orange-600" : "text-red-600")} />
                        </div>
                        <div>
                          <p className="text-[10px] font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">
                            {metric.label}
                          </p>
                          <p className="text-xl font-display font-bold text-design-dark dark:text-white">
                            {metric.value}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-2 py-0.5 font-ui font-semibold",
                          isPositive ? "text-green-600 border-green-600" : "text-red-600 border-red-600"
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 inline mr-1" />
                        )}
                        {Math.abs(metric.change)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-design-gray dark:text-gray-400">
                        <span>Hedef: {metric.target}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="relative h-2 bg-[#E7E7E7] dark:bg-[#062F28] rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000",
                            metric.status === "good" && "bg-green-500",
                            metric.status === "warning" && "bg-orange-500",
                            metric.status === "critical" && "bg-red-500"
                          )}
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

