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
// Using API route instead of direct Supabase client to avoid console errors
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
        // Use API route instead of direct Supabase client to avoid console errors
        const response = await fetch("/api/notifications?limit=10");
        
        if (!response.ok) {
          // Table doesn't exist or other error - gracefully degrade silently
          setNotifications([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        // Handle both response formats for backward compatibility
        if (data.success) {
          // New format: { success: true, notifications: [...] }
          // Old format: { success: true, data: { notifications: [...] } }
          const notifications = data.notifications || data.data?.notifications || [];
          setNotifications(notifications as Notification[]);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        // Notifications fetch failed, show empty state silently
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Note: Real-time subscriptions disabled when using API route
    // To enable real-time, we'd need to use Supabase client directly
    // but that causes console errors when table doesn't exist
  }, []);

  const unreadCount = notifications.filter((n) => !(n.is_read ?? n.read ?? false)).length;

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
        );
      }
    } catch (error) {
      // Mark as read failed, non-critical
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update local state optimistically
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      
      // Try to update on server (non-blocking)
      await fetch("/api/notifications/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      }).catch(() => {
        // Non-critical, already updated locally
      });
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
        return "text-primary";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-105 group micro-bounce"
        >
          <Bell className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary border-2 border-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 rounded-lg border border-border shadow-xl z-[100] bg-card backdrop-blur-xl"
      >
        <div className="p-4 border-b border-border/40 dark:border-border/40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground font-ui">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground font-ui"
              >
                Mark all as read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary"
            >
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground font-ui">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground font-ui">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                      !(notification.is_read ?? notification.read ?? false) && "bg-primary/5"
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
                          <p className="text-sm font-medium text-foreground font-ui">
                            {notification.title}
                          </p>
                          {!(notification.is_read ?? notification.read ?? false) && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-ui line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-ui">
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

