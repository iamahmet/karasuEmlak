"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { Activity, Zap, TrendingUp, Users, FileText } from "lucide-react";
import { cn } from "@karasu/lib";

interface RealTimeUpdate {
  id: string;
  type: "article" | "listing" | "user" | "comment";
  action: "created" | "updated" | "deleted";
  title: string;
  timestamp: Date;
}

export function RealTimeUpdates() {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to articles changes
    const articlesChannel = supabase
      .channel("realtime-articles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        (payload) => {
          const action = payload.eventType === "INSERT" ? "created" : payload.eventType === "UPDATE" ? "updated" : "deleted";
          setUpdates((prev) => [
            {
              id: `article-${payload.new?.id || payload.old?.id}-${Date.now()}`,
              type: "article",
              action,
              title: payload.new?.title || payload.old?.title || "Makale",
              timestamp: new Date(),
            },
            ...prev.slice(0, 9), // Keep last 10 updates
          ]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // Subscribe to listings changes
    const listingsChannel = supabase
      .channel("realtime-listings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
        },
        (payload) => {
          const action = payload.eventType === "INSERT" ? "created" : payload.eventType === "UPDATE" ? "updated" : "deleted";
          setUpdates((prev) => [
            {
              id: `listing-${payload.new?.id || payload.old?.id}-${Date.now()}`,
              type: "listing",
              action,
              title: payload.new?.title || payload.old?.title || "İlan",
              timestamp: new Date(),
            },
            ...prev.slice(0, 9),
          ]);
        }
      )
      .subscribe();

    return () => {
      articlesChannel.unsubscribe();
      listingsChannel.unsubscribe();
    };
  }, []);

  const getTypeIcon = (type: RealTimeUpdate["type"]) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4" />;
      case "listing":
        return <TrendingUp className="h-4 w-4" />;
      case "user":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: RealTimeUpdate["action"]) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "updated":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "deleted":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const getActionLabel = (action: RealTimeUpdate["action"]) => {
    switch (action) {
      case "created":
        return "Oluşturuldu";
      case "updated":
        return "Güncellendi";
      case "deleted":
        return "Silindi";
    }
  };

  return (
    <Card className="card-professional bg-white dark:bg-[#0a3d35] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-design-light/5 to-transparent rounded-full blur-3xl"></div>
      <CardHeader className="pb-4 px-5 pt-5 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-display font-bold text-design-dark dark:text-white flex items-center gap-3">
            <span className="w-1 h-6 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full shadow-lg"></span>
            Canlı Güncellemeler
          </CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-design-gray dark:text-gray-400 font-ui">
              {isConnected ? "Bağlı" : "Bağlantı yok"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 relative z-10">
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-design-gray dark:text-gray-400 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
              Henüz güncelleme yok
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {updates.map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#062F28]/50 border border-slate-200/50 dark:border-[#0a3d35]/50 hover:border-design-light/50 dark:hover:border-design-light/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-design-light/20 to-design-light/10 group-hover:from-design-light/30 group-hover:to-design-light/20 transition-all">
                  {getTypeIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-design-dark dark:text-white truncate">
                      {update.title}
                    </p>
                    <Badge
                      className={cn(
                        "text-[10px] px-2 py-0.5",
                        getActionColor(update.action)
                      )}
                    >
                      {getActionLabel(update.action)}
                    </Badge>
                  </div>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                    {update.timestamp.toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
