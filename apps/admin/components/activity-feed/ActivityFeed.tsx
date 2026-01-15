"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Clock, User, FileText, Bot, Settings } from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";
import { formatDateTime } from "@karasu/ui";

interface Activity {
  id: string;
  type: "content" | "user" | "system" | "bot";
  action: string;
  description: string;
  user?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function ActivityFeed({ limit = 10, initialActivity = [] }: { limit?: number; initialActivity?: any[] }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivity);
  const [loading, setLoading] = useState(initialActivity.length === 0);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const supabase = createClient();

        // Fetch recent audit logs
        const { data: auditLogs } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (auditLogs) {
          const formattedActivities: Activity[] = auditLogs.map((log) => {
            let type: Activity["type"] = "system";

            if (log.category === "content") {
              type = "content";
            } else if (log.category === "auth") {
              type = "user";
            } else if (log.category === "bot") {
              type = "bot";
            }

            return {
              id: log.id,
              type,
              action: log.action,
              description: log.details?.description || log.action,
              user: log.user_id,
              timestamp: log.created_at,
              metadata: log.details,
            };
          });

          setActivities(formattedActivities);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        (payload) => {
          // Add new activity to the top
          const newActivity: Activity = {
            id: payload.new.id,
            type: payload.new.category === "content" ? "content" : "system",
            action: payload.new.action,
            description: payload.new.details?.description || payload.new.action,
            user: payload.new.user_id,
            timestamp: payload.new.created_at,
            metadata: payload.new.details,
          };
          setActivities((prev) => [newActivity, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "content":
        return FileText;
      case "user":
        return User;
      case "bot":
        return Bot;
      default:
        return Settings;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "content":
        return "bg-design-light/20 text-design-dark dark:text-design-light";
      case "user":
        return "bg-design-light/20 text-design-dark dark:text-design-light";
      case "bot":
        return "bg-design-light/20 text-design-dark dark:text-design-light";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className="card-modern">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base font-display font-bold text-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 skeleton-professional rounded-lg" />
                  <div className="h-2 w-1/2 skeleton-professional rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-design-light" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-design-light/5 dark:hover:bg-design-light/10 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-design-dark dark:text-white font-ui">
                        {activity.action}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0.5 ${getActivityColor(activity.type)}`}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-[10px] text-design-gray dark:text-gray-400 mt-1 font-ui">
                      {formatDateTime(activity.timestamp)}
                    </p>
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

