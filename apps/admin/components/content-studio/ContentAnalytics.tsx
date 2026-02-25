"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Eye, TrendingUp, Clock, ThumbsUp, Share2, Link2 } from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";
import { formatDateTime } from "@karasu/ui";
import { cn } from "@karasu/lib";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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

interface TrendPoint {
  dateLabel: string;
  views: number;
  engagement: number;
  shares: number;
}

function formatTrendDateLabel(input: string | null | undefined) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function buildFallbackTrendData(analytics: Pick<AnalyticsData, "views" | "engagement" | "shares">): TrendPoint[] {
  const days = 7;
  const result: TrendPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const progress = (days - i) / days;
    const jitter = 0.92 + ((i % 3) * 0.04);

    result.push({
      dateLabel: date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      views: Math.max(0, Math.round(analytics.views * progress * jitter)),
      engagement: Math.max(0, Math.round(analytics.engagement * progress * (0.9 + ((i + 1) % 2) * 0.06))),
      shares: Math.max(0, Math.round(analytics.shares * progress * (0.88 + (i % 2) * 0.08))),
    });
  }

  return result;
}

export function ContentAnalytics({ contentItemId, locale }: ContentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [trendDataSource, setTrendDataSource] = useState<"content_metrics" | "estimated">("estimated");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createClient();
        if (!supabase || typeof supabase?.from !== "function") {
          throw new Error("Supabase client unavailable");
        }

        const [{ data: article }, { data: metricsRowsRaw }] = await Promise.all([
          supabase
            .from("articles")
            .select("views, reading_time, updated_at")
            .eq("slug", contentItemId)
            .maybeSingle(),
          supabase
            .from("content_metrics")
            .select("*")
            .eq("content_slug", contentItemId)
            .order("date", { ascending: false })
            .limit(14),
        ]);

        const metricsRows = Array.isArray(metricsRowsRaw)
          ? metricsRowsRaw.filter((row: any) => !row?.locale || row.locale === locale)
          : [];

        const latestMetric = metricsRows[0];
        const previousMetric = metricsRows[1];

        const views = Number(article?.views ?? latestMetric?.views ?? 0) || 0;
        const avgReadingTime = Math.max(
          0,
          Math.round(
            Number(article?.reading_time ?? (latestMetric?.avg_time_on_page ? latestMetric.avg_time_on_page / 60 : 0)) || 0
          )
        );
        const engagement = Number(
          latestMetric?.engagement ??
            latestMetric?.engagement_count ??
            latestMetric?.interactions ??
            Math.floor(views * 0.15)
        ) || 0;
        const shares = Number(latestMetric?.shares ?? latestMetric?.share_count ?? Math.floor(views * 0.05)) || 0;
        const backlinks = Number(latestMetric?.backlinks ?? latestMetric?.backlink_count ?? 0) || 0;

        const previousViews = Number(previousMetric?.views ?? 0) || 0;
        const trendPercentage = previousViews > 0 ? ((views - previousViews) / previousViews) * 100 : 0;
        const trend: AnalyticsData["trend"] =
          Math.abs(trendPercentage) < 0.5 ? "stable" : trendPercentage > 0 ? "up" : "down";

        const nextAnalytics: AnalyticsData = {
          views,
          avgReadingTime,
          engagement,
          shares,
          backlinks,
          lastUpdated: article?.updated_at || latestMetric?.date || new Date().toISOString(),
          trend,
          trendPercentage: Number.isFinite(trendPercentage) ? Math.round(trendPercentage * 10) / 10 : 0,
        };

        setAnalytics(nextAnalytics);

        const realTrend = metricsRows
          .filter((row: any) => row?.date)
          .slice(0, 14)
          .reverse()
          .map((row: any) => ({
            dateLabel: formatTrendDateLabel(row.date),
            views: Number(row.views ?? 0) || 0,
            engagement:
              Number(row.engagement ?? row.engagement_count ?? row.interactions ?? Math.floor((Number(row.views ?? 0) || 0) * 0.15)) || 0,
            shares: Number(row.shares ?? row.share_count ?? 0) || 0,
          }))
          .filter((row: TrendPoint) => Boolean(row.dateLabel));

        if (realTrend.length > 0) {
          setTrendData(realTrend);
          setTrendDataSource("content_metrics");
        } else {
          setTrendData(buildFallbackTrendData(nextAnalytics));
          setTrendDataSource("estimated");
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setTrendData([]);
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
              <div className="h-4 bg-[#E7E7E7] dark:bg-muted rounded mb-2"></div>
              <div className="h-8 bg-[#E7E7E7] dark:bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground font-ui">
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
      bgColor: "bg-[#E7E7E7] dark:bg-muted",
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
                  <p className="text-[10px] font-ui font-semibold text-muted-foreground uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="text-xl font-display font-bold text-foreground">
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-display font-bold text-foreground">
              Performans Trendi
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                {trendDataSource === "content_metrics" ? "Gerçek Veri" : "Tahmini Trend"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {trendData.length || 0} nokta
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {trendData.length > 0 ? (
            <div className="h-56 rounded-xl border border-border/50 bg-gradient-to-br from-[#E7E7E7]/20 to-transparent dark:from-[#062F28]/20 dark:to-transparent p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" opacity={0.45} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} stroke="#7B7B7B" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#7B7B7B"
                    width={42}
                    tickFormatter={(value: number) =>
                      value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E7E7E7",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      Number(value || 0).toLocaleString("tr-TR"),
                      name === "views" ? "Görüntülenme" : name === "engagement" ? "Etkileşim" : "Paylaşım",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="views"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    name="engagement"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="shares"
                    name="shares"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-[#E7E7E7]/30 to-transparent dark:from-[#062F28]/30 dark:to-transparent rounded-xl">
              <p className="text-sm text-muted-foreground font-ui">
                Trend verisi bulunamadı
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
