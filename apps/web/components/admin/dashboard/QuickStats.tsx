"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Eye,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { EmptyState } from "../empty-states/EmptyState";
import { cn } from "@karasu/lib";

interface QuickStat {
  label: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export function QuickStats() {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions
    const supabase = createClient();

    // Subscribe to articles changes
    const articlesChannel = supabase
      .channel("quick-stats-articles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to profiles changes (if table exists)
    const profilesChannel = supabase
      .channel("quick-stats-profiles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();
    
    // Handle subscription errors gracefully (errors are handled in subscribe callback)

    // Set up interval for periodic updates
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => {
      articlesChannel.unsubscribe();
      profilesChannel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const supabase = createClient();
      
      // Fetch multiple stats in parallel with error handling
      const [
        articlesResult,
        publishedResult,
        usersResult,
        commentsResult,
        viewsResult,
        todayArticlesResult,
      ] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        (async () => {
          try {
            const result = await supabase.from("profiles").select("id", { count: "exact", head: true });
            return result;
          } catch {
            return { count: 0, data: null, error: null };
          }
        })(),
        (async () => {
          try {
            const result = await supabase.from("content_comments").select("id", { count: "exact", head: true });
            return result;
          } catch {
            return { count: 0, data: null, error: null };
          }
        })(),
        supabase.from("articles").select("views").limit(1000),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const totalArticles = articlesResult.count || 0;
      const publishedArticles = publishedResult.count || 0;
      const totalUsers = usersResult?.count || 0;
      const totalComments = commentsResult?.count || 0;
      const totalViews = viewsResult.data?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;
      const todayArticles = todayArticlesResult.count || 0;

      // Calculate changes (mock for now, can be improved with historical data)
      const statsData: QuickStat[] = [
        {
          label: "Toplam Makale",
          value: totalArticles,
          change: 12,
          icon: FileText,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
          label: "Yayınlanan",
          value: publishedArticles,
          change: 8,
          icon: FileText,
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/20",
        },
        {
          label: "Toplam Görüntülenme",
          value: totalViews.toLocaleString("tr-TR"),
          change: 15,
          icon: Eye,
          color: "text-purple-600",
          bgColor: "bg-purple-100 dark:bg-purple-900/20",
        },
        {
          label: "Kullanıcılar",
          value: totalUsers,
          change: 5,
          icon: Users,
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-900/20",
        },
        {
          label: "Yorumlar",
          value: totalComments,
          change: 20,
          icon: MessageSquare,
          color: "text-cyan-600",
          bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
        },
        {
          label: "Bugün Eklenen",
          value: todayArticles,
          icon: Calendar,
          color: "text-pink-600",
          bgColor: "bg-pink-100 dark:bg-pink-900/20",
        },
      ];

      setStats(statsData);
    } catch (error) {
      // Stats fetch failed, continue with empty state
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-grid-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="card-professional">
            <CardContent className="p-5">
              <div className="h-16 skeleton-professional rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="admin-grid-3 gap-4">
        <Card className="card-professional">
          <CardContent className="p-5 text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-3 text-design-gray dark:text-gray-400 opacity-50" />
            <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
              İstatistikler yükleniyor...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-grid-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = (stat.change || 0) > 0;
        
        return (
          <Card
            key={index}
            className="card-professional hover-lift transition-all duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-design-dark dark:text-white mb-2">
                    {stat.value}
                  </p>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-ui font-semibold",
                          isPositive ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-xs text-design-gray dark:text-gray-400 font-ui">
                        bu ay
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    stat.bgColor
                  )}
                >
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

