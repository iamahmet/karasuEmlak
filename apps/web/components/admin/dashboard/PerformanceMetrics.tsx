"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Zap,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface PerformanceMetric {
  label: string;
  value: number | string;
  target: number;
  status: "good" | "warning" | "critical";
  icon: React.ComponentType<{ className?: string }>;
  unit?: string;
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const supabase = createClient();
      
      // Fetch various performance metrics
      const [
        articlesResult,
        publishedResult,
        avgViewsResult,
        recentArticlesResult,
      ] = await Promise.all([
        supabase.from("articles").select("id, views, created_at").limit(100),
        supabase.from("articles").select("id").eq("status", "published").limit(100),
        supabase.from("articles").select("views").eq("status", "published").limit(100),
        supabase
          .from("articles")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const articles = articlesResult.data || [];
      const published = publishedResult.data || [];
      const avgViewsData = avgViewsResult.data || [];
      const avgViews = avgViewsData.length > 0 
        ? avgViewsData.reduce((sum: number, a: any) => sum + (a.views || 0), 0) / avgViewsData.length 
        : 0;
      
      // Calculate average time between articles
      const recentDates = recentArticlesResult.data?.map((a: any) => new Date(a.created_at).getTime()) || [];
      const avgTimeBetween = recentDates.length > 1
        ? (recentDates[0] - recentDates[recentDates.length - 1]) / (recentDates.length - 1)
        : 0;
      const avgDaysBetween = avgTimeBetween / (1000 * 60 * 60 * 24);

      const metricsData: PerformanceMetric[] = [
        {
          label: "Yayın Oranı",
          value: articles.length > 0 ? Math.round((published.length / articles.length) * 100) : 0,
          target: 80,
          status: (published.length / articles.length) * 100 >= 80 ? "good" : (published.length / articles.length) * 100 >= 50 ? "warning" : "critical",
          icon: FileText,
          unit: "%",
        },
        {
          label: "Ortalama Görüntülenme",
          value: Math.round(avgViews).toLocaleString("tr-TR"),
          target: 1000,
          status: avgViews >= 1000 ? "good" : avgViews >= 500 ? "warning" : "critical",
          icon: TrendingUp,
        },
        {
          label: "Ortalama Yayın Sıklığı",
          value: avgDaysBetween > 0 ? avgDaysBetween.toFixed(1) : "N/A",
          target: 1,
          status: avgDaysBetween <= 1 ? "good" : avgDaysBetween <= 3 ? "warning" : "critical",
          icon: Clock,
          unit: " gün",
        },
        {
          label: "Toplam İçerik",
          value: articles.length,
          target: 100,
          status: articles.length >= 100 ? "good" : articles.length >= 50 ? "warning" : "critical",
          icon: Zap,
        },
      ];

      setMetrics(metricsData);
    } catch (error) {
      // Metrics fetch failed, continue with empty state
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-grid-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-professional">
            <CardContent className="p-5">
              <div className="h-16 skeleton-professional rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (status: PerformanceMetric["status"]) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const getStatusIcon = (status: PerformanceMetric["status"]) => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="admin-grid-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const StatusIcon = getStatusIcon(metric.status);
        
        return (
          <Card
            key={index}
            className="card-professional hover-lift transition-all duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-design-light" />
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui font-semibold">
                    {metric.label}
                  </p>
                </div>
                <Badge className={cn("text-[10px] px-2 py-0.5", getStatusColor(metric.status))}>
                  {StatusIcon}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-design-dark dark:text-white">
                  {metric.value}
                </p>
                {metric.unit && (
                  <span className="text-sm text-design-gray dark:text-gray-400 font-ui">
                    {metric.unit}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-design-gray dark:text-gray-400 mb-1">
                  <span>Hedef: {metric.target}{metric.unit || ""}</span>
                  <span>
                    {typeof metric.value === "number"
                      ? Math.round((metric.value / metric.target) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#E7E7E7] dark:bg-[#062F28] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      metric.status === "good"
                        ? "bg-green-600"
                        : metric.status === "warning"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        typeof metric.value === "number"
                          ? (metric.value / metric.target) * 100
                          : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

