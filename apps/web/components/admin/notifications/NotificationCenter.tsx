"use client";

import { useState, useEffect } from "react";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { Bell, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";
import { formatDateTime } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  is_read: boolean;
  read?: boolean; // Legacy support
  created_at: string;
  action_url?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          // Table doesn't exist - gracefully degrade
          if (error.code === "PGRST116" || error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation") || error.message?.includes("not found")) {
            setNotifications([]);
            return;
          }
          // For other errors, also gracefully degrade
          console.warn("Notifications fetch error:", error);
          setNotifications([]);
          return;
        }

        if (data) {
          setNotifications(data as Notification[]);
        }
      } catch (error) {
        // Notifications fetch failed, show empty state
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription (only if table exists)
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
          }
        )
        .subscribe();
    } catch (error) {
      // Table doesn't exist, skip real-time subscription
      console.warn("Cannot subscribe to notifications (table may not exist)");
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const unreadCount = notifications.filter((n) => !(n.is_read ?? n.read ?? false)).length;

  const markAsRead = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
      );
    } catch (error) {
      // Mark as read failed, non-critical
    }
  };

  const markAllAsRead = async () => {
    try {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      // Mark all as read failed, non-critical
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle2;
      case "warning":
        return AlertCircle;
      case "error":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-design-light";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-design-gray dark:text-gray-400";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg hover:bg-[#E7E7E7] dark:hover:bg-[#0a3d35] transition-all duration-200 hover:scale-105 group micro-bounce"
        >
          <Bell className="h-4 w-4 text-design-gray dark:text-gray-400 group-hover:text-design-dark dark:group-hover:text-design-light transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-design-light dark:bg-design-dark border-2 border-white dark:border-[#062F28] animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] shadow-xl"
      >
        <div className="p-4 border-b border-[#E7E7E7] dark:border-[#062F28]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-design-dark dark:text-white font-ui">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs text-design-gray dark:text-gray-400 hover:text-design-dark dark:hover:text-white font-ui"
              >
                Mark all as read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5 bg-design-light/20 text-design-dark dark:text-design-light"
            >
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-design-gray dark:text-gray-400 font-ui">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-design-gray dark:text-gray-400 font-ui">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-[#E7E7E7] dark:divide-[#062F28]">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-design-light/5 dark:hover:bg-design-light/10 transition-colors cursor-pointer",
                      !notification.read && "bg-design-light/5 dark:bg-design-light/10"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          getNotificationColor(notification.type)
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-design-dark dark:text-white font-ui">
                            {notification.title}
                          </p>
                          {!(notification.is_read ?? notification.read ?? false) && (
                            <div className="w-2 h-2 rounded-full bg-design-light flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-design-gray dark:text-gray-400 font-ui line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-design-gray dark:text-gray-400 mt-1 font-ui">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

