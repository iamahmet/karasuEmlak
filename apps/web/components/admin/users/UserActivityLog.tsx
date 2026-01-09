"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Clock,
  User,
  Edit,
  Trash2,
  Shield,
  Mail,
  CheckCircle2,
  XCircle,
  FileText,
  Settings,
  Loader2,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { formatDateTime } from "@karasu/ui";

interface ActivityLog {
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

interface UserActivityLogProps {
  userId: string;
  locale?: string;
}

export function UserActivityLog({ userId, locale = "tr" }: UserActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchActivities();
    
    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel(`user-activity-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            fetchUserProfile(payload.new.user_id).then((user) => {
              const newActivity: ActivityLog = {
                id: payload.new.id,
                action: payload.new.action || payload.new.event_type || '',
                entity_type: payload.new.entity_type || payload.new.resource_type || '',
                entity_id: payload.new.entity_id || payload.new.resource_id || '',
                user_id: payload.new.user_id,
                created_at: payload.new.created_at,
                metadata: payload.new.metadata,
                user,
              };
              setActivities((prev) => [newActivity, ...prev].slice(0, limit));
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, limit]);

  const fetchUserProfile = async (userId: string | null) => {
    if (!userId) return undefined;
    
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("id", userId)
        .single();

      return profile
        ? {
            email: profile.email || "",
            name: profile.name,
          }
        : undefined;
    } catch {
      return undefined;
    }
  };

  const fetchActivities = async () => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Fetch user profiles
      const userIds = (data || [])
        .filter((a) => a.user_id)
        .map((a) => a.user_id) as string[];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      const activitiesWithUsers = (data || []).map((activity: any) => {
        const profile = profiles?.find((p) => p.id === activity.user_id);
        return {
          ...activity,
          user: profile
            ? {
                email: profile.email || "",
                name: profile.name,
              }
            : undefined,
        };
      });

      setActivities(activitiesWithUsers);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string, entityType: string) => {
    if (action.includes("create") || action.includes("insert")) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (action.includes("update") || action.includes("edit")) {
      return <Edit className="h-4 w-4 text-blue-600" />;
    }
    if (action.includes("delete") || action.includes("remove")) {
      return <Trash2 className="h-4 w-4 text-red-600" />;
    }
    if (action.includes("login") || action.includes("auth")) {
      return <User className="h-4 w-4 text-purple-600" />;
    }
    if (action.includes("role") || action.includes("permission")) {
      return <Shield className="h-4 w-4 text-orange-600" />;
    }
    if (entityType === "article" || entityType === "content") {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getActionLabel = (action: string, entityType: string) => {
    if (action.includes("create") || action.includes("insert")) {
      return "Oluşturuldu";
    }
    if (action.includes("update") || action.includes("edit")) {
      return "Güncellendi";
    }
    if (action.includes("delete") || action.includes("remove")) {
      return "Silindi";
    }
    if (action.includes("login")) {
      return "Giriş yapıldı";
    }
    if (action.includes("role")) {
      return "Rol değiştirildi";
    }
    return action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      article: "Makale",
      content: "İçerik",
      comment: "Yorum",
      user: "Kullanıcı",
      profile: "Profil",
      settings: "Ayarlar",
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-design-light" />
            Aktivite Geçmişi
          </CardTitle>
          {activities.length >= limit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLimit(limit + 20)}
              className="h-8 px-3 text-xs"
            >
              Daha Fazla Yükle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-design-gray dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Henüz aktivite kaydı bulunmuyor</p>
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
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <p className="text-xs text-design-gray dark:text-gray-400 mb-1">
                      {JSON.stringify(activity.metadata)}
                    </p>
                  )}
                  <p className="text-xs text-design-gray dark:text-gray-400">
                    {formatDateTime(activity.created_at)}
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

