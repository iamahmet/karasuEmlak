"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@karasu/lib";

interface ScheduledContent {
  id: string;
  title: string;
  scheduled_at: string;
  status: "scheduled" | "published" | "failed";
  type: "article" | "news";
}

export function ContentCalendar() {
  const [scheduled, setScheduled] = useState<ScheduledContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduled();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel("scheduled-content-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        () => {
          fetchScheduled();
        }
      )
      .subscribe();

    const interval = setInterval(fetchScheduled, 60000); // Update every minute

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchScheduled = async () => {
    try {
      const supabase = createClient();
      
      // Get scheduled articles from content_items (where published_at is in the future)
      // Gracefully handle if table doesn't exist
      let contentItems: any = null;
      let contentItemsError: any = null;
      try {
        const result = await supabase
          .from("content_items")
          .select("id, slug, published_at, status")
          .not("published_at", "is", null)
          .gte("published_at", new Date().toISOString())
          .order("published_at", { ascending: true })
          .limit(7);
        contentItems = result.data;
        contentItemsError = result.error;
      } catch (err: any) {
        contentItemsError = { message: "Table not found" };
      }

      if (contentItemsError || !contentItems || contentItems.length === 0) {
        // Table doesn't exist or no scheduled content - gracefully handle
        setScheduled([]);
        setLoading(false);
        return;
      }

      // Get locale content for titles (gracefully handle if table doesn't exist)
      const contentIds = contentItems.map((item: any) => item.id);
      let locales: any = null;
      try {
        const result = await supabase
          .from("content_locales")
          .select("content_item_id, title")
          .in("content_item_id", contentIds)
          .eq("locale", "tr");
        locales = result.data;
      } catch (err: any) {
        locales = null;
      }

      const scheduledData: ScheduledContent[] = contentItems.map((item: any) => {
        const locale = locales?.find((l: any) => l.content_item_id === item.id);
        return {
          id: item.id,
          title: locale?.title || item.slug || "Başlıksız",
          scheduled_at: item.published_at,
          status: item.status === "published" ? "published" : "scheduled",
          type: "article",
        };
      });

      setScheduled(scheduledData);
    } catch (error) {
      // Scheduled content fetch failed, continue with empty state
      setScheduled([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
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
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-design-light" />
          Planlanmış İçerikler
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {scheduled.length === 0 ? (
          <div className="text-center py-12 text-design-gray dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Planlanmış içerik bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduled.map((item) => {
              const scheduledDate = new Date(item.scheduled_at);
              const now = new Date();
              const hoursUntil = Math.floor((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60));
              
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-design-dark dark:text-white truncate mb-1">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[10px] px-2 py-0.5", getStatusBadge(item.status))}>
                        {item.status === "published" ? "Yayınlandı" : item.status === "failed" ? "Başarısız" : "Planlandı"}
                      </Badge>
                      <span className="text-xs text-design-gray dark:text-gray-400">
                        {hoursUntil > 24
                          ? `${Math.floor(hoursUntil / 24)} gün sonra`
                          : hoursUntil > 0
                          ? `${hoursUntil} saat sonra`
                          : "Şimdi"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-design-gray dark:text-gray-400 text-right">
                    {scheduledDate.toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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

