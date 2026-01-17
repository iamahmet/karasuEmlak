"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Activity, User, Home, FileText, Newspaper, Edit, Plus, Trash2, Clock } from "lucide-react";
// Simple date formatting without date-fns dependency
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (minutes > 0) return `${minutes} dakika önce`;
  return "Az önce";
};

interface ActivityItem {
  id: string;
  type: "listing" | "article" | "news" | "user" | "system";
  action: "created" | "updated" | "deleted" | "published" | "unpublished";
  title: string;
  user: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Fetch recent listings, articles, news
      const [listingsRes, articlesRes, newsRes] = await Promise.all([
        fetch("/api/listings?limit=10"),
        fetch("/api/articles?limit=10"),
        fetch("/api/news?limit=10"),
      ]);

      const listings = listingsRes.ok ? (await listingsRes.json()).data?.listings || [] : [];
      const articles = articlesRes.ok ? (await articlesRes.json()).data?.articles || [] : [];
      const news = newsRes.ok ? (await newsRes.json()).data?.news || [] : [];

      // Transform to activity items
      const activityItems: ActivityItem[] = [
        ...listings.slice(0, 5).map((item: any) => ({
          id: `listing-${item.id}`,
          type: "listing" as const,
          action: item.published ? "published" : "created",
          title: item.title,
          user: "Admin",
          timestamp: item.updated_at || item.created_at,
          icon: Home,
          color: "text-blue-600",
        })),
        ...articles.slice(0, 3).map((item: any) => ({
          id: `article-${item.id}`,
          type: "article" as const,
          action: item.published ? "published" : "created",
          title: item.title,
          user: "Admin",
          timestamp: item.updated_at || item.created_at,
          icon: FileText,
          color: "text-green-600",
        })),
        ...news.slice(0, 2).map((item: any) => ({
          id: `news-${item.id}`,
          type: "news" as const,
          action: item.published ? "published" : "created",
          title: item.title,
          user: "Admin",
          timestamp: item.updated_at || item.created_at,
          icon: Newspaper,
          color: "text-purple-600",
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setActivities(activityItems);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return Plus;
      case "updated":
        return Edit;
      case "deleted":
        return Trash2;
      case "published":
        return Activity;
      default:
        return Clock;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "created":
        return "oluşturuldu";
      case "updated":
        return "güncellendi";
      case "deleted":
        return "silindi";
      case "published":
        return "yayınlandı";
      case "unpublished":
        return "yayından kaldırıldı";
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Son Aktiviteler</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Sistemdeki son değişiklikler</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Henüz aktivite yok</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = activity.icon;
              const ActionIcon = getActionIcon(activity.action);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors ${activity.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ActionIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {activity.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getActionText(activity.action)}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(new Date(activity.timestamp))}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
