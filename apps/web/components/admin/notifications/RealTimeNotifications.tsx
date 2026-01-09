"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { toast } from "sonner";
import { formatDateTime } from "@karasu/ui";

interface Notification {
  id: string;
  user_id: string | null;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  is_read: boolean;
  read?: boolean; // Legacy support
  created_at: string;
  metadata?: Record<string, any>;
}

interface RealTimeNotificationsProps {
  userId: string;
  locale?: string;
}

export function RealTimeNotifications({ userId }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Show toast notification
            toast(newNotification.title, {
              description: newNotification.message,
              icon: getNotificationIcon(newNotification.type),
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const updatedNotification = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === updatedNotification.id ? updatedNotification : n
              )
            );
            if (updatedNotification.is_read ?? updatedNotification.read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      const fetchedNotifications = (data || []) as Notification[];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n) => !(n.is_read ?? n.read ?? false)).length);
    } catch (error) {
      // Notifications fetch failed, continue with empty state
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      toast.error(error.message || "Bildirim okundu olarak işaretlenemedi");
    }
  };

  const markAllAsRead = async () => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      setUnreadCount(0);
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    } catch (error: any) {
      toast.error(error.message || "Bildirimler güncellenemedi");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      const deletedNotification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (deletedNotification && !(deletedNotification.is_read ?? deletedNotification.read ?? false)) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      toast.error(error.message || "Bildirim silinemedi");
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "error":
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-design-light" />
            Gerçek Zamanlı Bildirimler
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white text-[10px] px-2 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-3 text-xs"
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-design-gray dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Henüz bildirim yok</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-modern">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                  (notification.is_read ?? notification.read ?? false)
                    ? "bg-white dark:bg-[#0a3d35] border-[#E7E7E7] dark:border-[#062F28] opacity-60"
                    : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/20"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                      {notification.title}
                    </p>
                    <Badge className={cn("text-[10px] px-2 py-0.5", getNotificationColor(notification.type))}>
                      {notification.type === "success" ? "Başarılı" :
                       notification.type === "warning" ? "Uyarı" :
                       notification.type === "error" ? "Hata" : "Bilgi"}
                    </Badge>
                  </div>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-design-gray dark:text-gray-400 font-ui">
                    {formatDateTime(notification.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!(notification.is_read ?? notification.read ?? false) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                      title="Okundu İşaretle"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-6 w-6 p-0 text-red-600"
                    title="Sil"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

