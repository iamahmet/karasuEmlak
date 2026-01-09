"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Eye, TrendingUp, Clock, ThumbsUp, Share2, Link2 } from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";
import { formatDateTime } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface ContentAnalyticsProps {
  contentItemId: string;
  locale: string;
}

interface AnalyticsData {
  views: number;
  avgReadingTime: number;
  engagement: number;
  shares: number;
  backlinks: number;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export function ContentAnalytics({ contentItemId, locale }: ContentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createClient();
        
        // Get article by content_item_id (via slug mapping or direct relation)
        const { data: article } = await supabase
          .from("articles")
          .select("views, reading_time, updated_at")
          .eq("slug", contentItemId) // Assuming slug matches or we need to add content_item_id to articles
          .single();

        if (article) {
          // Mock analytics data (in production, fetch from analytics table)
          setAnalytics({
            views: article.views || 0,
            avgReadingTime: article.reading_time || 0,
            engagement: Math.floor((article.views || 0) * 0.15), // Mock calculation
            shares: Math.floor((article.views || 0) * 0.05), // Mock calculation
            backlinks: 0,
            lastUpdated: article.updated_at || new Date().toISOString(),
            trend: "up",
            trendPercentage: 12.5,
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [contentItemId, locale]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-[#E7E7E7] dark:bg-[#062F28] rounded mb-2"></div>
              <div className="h-8 bg-[#E7E7E7] dark:bg-[#062F28] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
          Analitik verisi bulunamadı
        </p>
      </div>
    );
  }

  const metrics = [
    {
      label: "Görüntülenme",
      value: analytics.views.toLocaleString("tr-TR"),
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      trend: analytics.trend,
      trendValue: analytics.trendPercentage,
    },
    {
      label: "Ortalama Okuma Süresi",
      value: `${analytics.avgReadingTime} dk`,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Etkileşim",
      value: analytics.engagement.toLocaleString("tr-TR"),
      icon: ThumbsUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      label: "Paylaşım",
      value: analytics.shares.toLocaleString("tr-TR"),
      icon: Share2,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      label: "Backlink",
      value: analytics.backlinks.toLocaleString("tr-TR"),
      icon: Link2,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Son Güncelleme",
      value: formatDateTime(analytics.lastUpdated),
      icon: TrendingUp,
      color: "text-design-gray",
      bgColor: "bg-[#E7E7E7] dark:bg-[#062F28]",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.label}
              className="card-professional hover-lift stagger-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                    <Icon className={cn("h-4 w-4", metric.color)} />
                  </div>
                  {metric.trend && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-2 py-0.5 font-ui font-semibold",
                        metric.trend === "up" && "text-green-600 border-green-600",
                        metric.trend === "down" && "text-red-600 border-red-600"
                      )}
                    >
                      {metric.trend === "up" ? "↑" : "↓"} {metric.trendValue}%
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="text-xl font-display font-bold text-design-dark dark:text-white">
                    {metric.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="card-professional">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
            Performans Trendi
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="h-48 flex items-center justify-center bg-gradient-to-br from-[#E7E7E7]/30 to-transparent dark:from-[#062F28]/30 dark:to-transparent rounded-xl">
            <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
              Grafik yakında eklenecek
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

