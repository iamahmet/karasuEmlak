"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Eye,
  MessageSquare,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface UserAnalyticsData {
  totalArticles: number;
  totalViews: number;
  avgViewsPerArticle: number;
  totalComments: number;
  avgReadingTime: number;
  lastActivity: string | null;
  articlesThisMonth: number;
  articlesLastMonth: number;
  viewsChange: number;
  commentsChange: number;
}

interface UserAnalyticsProps {
  userId: string;
  locale?: string;
}

export function UserAnalytics({ userId, locale = "tr" }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient();
      
      // Get current date ranges
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch user's articles
      const { data: allArticles } = await supabase
        .from("articles")
        .select("id, views, reading_time, created_at")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });

      // Fetch this month's articles
      const { data: thisMonthArticles } = await supabase
        .from("articles")
        .select("id")
        .eq("author_id", userId)
        .gte("created_at", thisMonthStart.toISOString());

      // Fetch last month's articles
      const { data: lastMonthArticles } = await supabase
        .from("articles")
        .select("id")
        .eq("author_id", userId)
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString());

      // Fetch comments on user's articles
      const articleIds = allArticles?.map((a) => a.id) || [];
      const { data: comments } = articleIds.length > 0
        ? await supabase
            .from("content_comments")
            .select("id")
            .in("content_id", articleIds)
        : { data: null };

      // Fetch last activity
      const { data: lastActivity } = await supabase
        .from("audit_logs")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const totalArticles = allArticles?.length || 0;
      const totalViews = allArticles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;
      const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;
      const totalComments = comments?.length || 0;
      const avgReadingTime = allArticles && allArticles.length > 0
        ? Math.round(allArticles.reduce((sum, a) => sum + (a.reading_time || 0), 0) / allArticles.length)
        : 0;
      
      const articlesThisMonth = thisMonthArticles?.length || 0;
      const articlesLastMonth = lastMonthArticles?.length || 0;
      const viewsChange = articlesLastMonth > 0
        ? Math.round(((articlesThisMonth - articlesLastMonth) / articlesLastMonth) * 100)
        : articlesThisMonth > 0 ? 100 : 0;
      const commentsChange = 0; // Can be calculated with historical data

      setAnalytics({
        totalArticles,
        totalViews,
        avgViewsPerArticle,
        totalComments,
        avgReadingTime,
        lastActivity: lastActivity?.created_at || null,
        articlesThisMonth,
        articlesLastMonth,
        viewsChange,
        commentsChange,
      });
    } catch (error) {
      console.error("Failed to fetch user analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-5">
              <div className="h-16 bg-[#E7E7E7] dark:bg-[#062F28] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="card-professional">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
            Analitik verisi bulunamadı
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Toplam Makale",
      value: analytics.totalArticles,
      change: analytics.viewsChange,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Toplam Görüntülenme",
      value: analytics.totalViews.toLocaleString("tr-TR"),
      change: analytics.viewsChange,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Ortalama Görüntülenme",
      value: analytics.avgViewsPerArticle.toLocaleString("tr-TR"),
      change: 0,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      label: "Toplam Yorum",
      value: analytics.totalComments,
      change: analytics.commentsChange,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      label: "Ortalama Okuma Süresi",
      value: `${analytics.avgReadingTime} dk`,
      change: 0,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    },
    {
      label: "Bu Ay Eklenen",
      value: analytics.articlesThisMonth,
      change: analytics.viewsChange,
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-design-light" />
            Kullanıcı Analitiği
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const isPositive = metric.change > 0;
              
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
                      {metric.change !== 0 && (
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
          
          {analytics.lastActivity && (
            <div className="mt-4 pt-4 border-t border-[#E7E7E7] dark:border-[#062F28]">
              <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                Son Aktivite: {new Date(analytics.lastActivity).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

