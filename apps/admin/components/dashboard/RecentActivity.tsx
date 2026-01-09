"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  FileText,
  User,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string | null;
  created_at: string;
  metadata?: Record<string, any>;
  user?: {
    email: string;
    name: string | null;
  };
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel("audit-logs-recent-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        (payload) => {
          if (payload.new) {
            // Fetch user profile for new activity
            const fetchUserProfile = async () => {
              if (payload.new.user_id) {
                try {
                  const { data: profile } = await supabase
                    .from("profiles")
                    .select("id, name, email")
                    .eq("id", payload.new.user_id)
                    .single();

                  const newActivity: Activity = {
                    id: payload.new.id,
                    action: payload.new.action,
                    entity_type: payload.new.resource_type || payload.new.entity_type || "unknown",
                    entity_id: payload.new.resource_id || payload.new.entity_id || "",
                    user_id: payload.new.user_id,
                    created_at: payload.new.created_at,
                    metadata: payload.new.details || payload.new.metadata || {},
                    user: profile
                      ? {
                          email: profile.email || "",
                          name: profile.name,
                        }
                      : undefined,
                  };

                  setActivities((prev) => [newActivity, ...prev].slice(0, 10));
                } catch (err: any) {
                  // Profiles table doesn't exist, continue without user data
                  const newActivity: Activity = {
                    id: payload.new.id,
                    action: payload.new.action,
                    entity_type: payload.new.resource_type || payload.new.entity_type || "unknown",
                    entity_id: payload.new.resource_id || payload.new.entity_id || "",
                    user_id: payload.new.user_id,
                    created_at: payload.new.created_at,
                    metadata: payload.new.details || payload.new.metadata || {},
                  };
                  setActivities((prev) => [newActivity, ...prev].slice(0, 10));
                }
              }
            };

            fetchUserProfile();
          }
        }
      )
      .subscribe();
    
    // Handle subscription errors gracefully (errors are handled in subscribe callback)

    // Set up interval for periodic updates
    const interval = setInterval(fetchActivities, 30000); // Update every 30 seconds

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const supabase = createClient();
      
      // Try to fetch audit logs with error handling
      let auditData: any = null;
      let auditError: any = null;
      try {
        const result = await supabase
          .from("audit_logs")
          .select("id, action, resource_type, resource_id, user_id, created_at, details")
          .order("created_at", { ascending: false })
          .limit(10);
        auditData = result.data;
        auditError = result.error;
      } catch (err: any) {
        auditError = { message: "Table not found" };
      }

      if (auditError || !auditData) {
        // Table doesn't exist or error occurred - gracefully handle
        setActivities([]);
        setLoading(false);
        return;
      }

      if (!auditData || auditData.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // Get user profiles for activities
      const userIds = [...new Set(auditData.map((a: any) => a.user_id).filter(Boolean))];
      let userProfiles: Record<string, any> = {};
      
      if (userIds.length > 0) {
        try {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", userIds);
          
          if (profiles && !profilesError) {
            userProfiles = profiles.reduce((acc: any, profile: any) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        } catch (err: any) {
          // Profiles table doesn't exist, continue without user data
        }
      }

      // Map audit logs to Activity format
      const activities: Activity[] = auditData.map((log: any) => ({
        id: log.id,
        action: log.action,
        entity_type: log.resource_type || log.entity_type || "unknown",
        entity_id: log.resource_id || log.entity_id || "",
        user_id: log.user_id,
        created_at: log.created_at,
        metadata: log.details || log.metadata || {},
        user: log.user_id && userProfiles[log.user_id]
          ? {
              email: userProfiles[log.user_id].email || "",
              name: userProfiles[log.user_id].name,
            }
          : undefined,
      }));

      setActivities(activities);
    } catch (error) {
      // Activities fetch failed, continue with empty state
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string, entityType: string) => {
    if (action.includes("create") || action.includes("insert")) {
      return <Plus className="h-4 w-4 text-green-600" />;
    }
    if (action.includes("update") || action.includes("edit")) {
      return <Edit className="h-4 w-4 text-blue-600" />;
    }
    if (action.includes("delete") || action.includes("remove")) {
      return <Trash2 className="h-4 w-4 text-red-600" />;
    }
    if (action.includes("approve") || action.includes("publish")) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (action.includes("reject")) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    if (entityType === "article") {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    if (entityType === "comment") {
      return <MessageSquare className="h-4 w-4 text-purple-600" />;
    }
    if (entityType === "user") {
      return <User className="h-4 w-4 text-orange-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getActionLabel = (action: string, _entityType: string) => {
    if (action.includes("create") || action.includes("insert")) {
      return "Oluşturuldu";
    }
    if (action.includes("update") || action.includes("edit")) {
      return "Güncellendi";
    }
    if (action.includes("delete") || action.includes("remove")) {
      return "Silindi";
    }
    if (action.includes("approve") || action.includes("publish")) {
      return "Onaylandı";
    }
    if (action.includes("reject")) {
      return "Reddedildi";
    }
    return action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      article: "Makale",
      comment: "Yorum",
      user: "Kullanıcı",
      content: "İçerik",
      category: "Kategori",
    };
    return labels[entityType] || entityType;
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
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
          Son Aktiviteler
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-design-gray dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Henüz aktivite bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActionIcon(activity.action, activity.entity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-design-dark dark:text-white">
                      {getActionLabel(activity.action, activity.entity_type)}
                    </p>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {getEntityLabel(activity.entity_type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-design-gray dark:text-gray-400">
                    {activity.user?.name || activity.user?.email || "Sistem"} •{" "}
                    {new Date(activity.created_at).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
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

