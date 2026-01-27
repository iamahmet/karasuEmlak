"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { toast } from "sonner";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Search,
  Settings,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface Notification {
  id: string;
  user_id: string | null;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  is_read: boolean;
  read?: boolean; // Legacy support
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export function NotificationsCenter({ locale: _locale }: { locale: string }) {
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    comment_notifications: true,
    content_notifications: true,
    system_notifications: true,
  });

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchQuery, notifications, activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications");
      
      if (!response.ok) {
        throw new Error("Bildirimler yüklenemedi");
      }

      const data = await response.json();
      
      // Handle both response formats for backward compatibility
      if (data.success) {
        // New format: { success: true, notifications: [...] }
        // Old format: { success: true, data: { notifications: [...] } }
        const notifications = data.notifications || data.data?.notifications || [];
        setNotifications(notifications);
        setFilteredNotifications(notifications);
      } else {
        // Error response or invalid format - set empty arrays
        setNotifications([]);
        setFilteredNotifications([]);
      }
    } catch (error: any) {
      // Notifications fetch failed, show empty state
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_preferences")
        .select("notification_settings")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (data?.notification_settings) {
        setSettings({ ...settings, ...data.notification_settings });
      }
    } catch (error) {
      // Settings fetch failed, use defaults
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === "unread") {
      filtered = filtered.filter((n) => !n.read);
    } else if (activeTab === "read") {
      filtered = filtered.filter((n) => n.read);
    } else if (activeTab !== "all") {
      filtered = filtered.filter((n) => n.type === activeTab);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      // Silently handle missing table
      if (error) {
        const errorCode = error.code || "";
        const errorMessage = error.message?.toLowerCase() || "";
        if (
          errorCode === "PGRST116" || 
          errorCode === "42P01" || 
          errorMessage.includes("does not exist") || 
          errorMessage.includes("relation") || 
          errorMessage.includes("not found")
        ) {
          // Table doesn't exist, silently update local state
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
          );
          return;
        }
        // For other errors, also silently handle
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
      );
    } catch (error: any) {
      // Mark as read failed, non-critical
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      // Silently handle missing table
      if (error) {
        const errorCode = error.code || "";
        const errorMessage = error.message?.toLowerCase() || "";
        if (
          errorCode === "PGRST116" || 
          errorCode === "42P01" || 
          errorMessage.includes("does not exist") || 
          errorMessage.includes("relation") || 
          errorMessage.includes("not found")
        ) {
          // Table doesn't exist, silently update local state
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
          setUnreadCount(0);
          return;
        }
        // For other errors, also silently handle
        return;
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    } catch (error: any) {
      // Mark all as read failed, non-critical
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("notifications").delete().eq("id", id);

      // Silently handle missing table
      if (error) {
        const errorCode = error.code || "";
        const errorMessage = error.message?.toLowerCase() || "";
        if (
          errorCode === "PGRST116" || 
          errorCode === "42P01" || 
          errorMessage.includes("does not exist") || 
          errorMessage.includes("relation") || 
          errorMessage.includes("not found")
        ) {
          // Table doesn't exist, silently update local state
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          return;
        }
        // For other errors, also silently handle
        return;
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Bildirim silindi");
    } catch (error: any) {
      // Delete failed, non-critical
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: Notification["type"]) => {
    const variants = {
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    return (
      <Badge className={cn("text-[10px] px-2 py-0.5", variants[type])}>
        {type === "info" ? "Bilgi" : type === "success" ? "Başarılı" : type === "warning" ? "Uyarı" : "Hata"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-[#E7E7E7] dark:bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    read: notifications.filter((n) => n.read).length,
  };

  return (
    <Tabs defaultValue="notifications" className="space-y-6">
      <TabsList className="bg-white dark:bg-card border border-border/40 dark:border-border/40 rounded-lg p-1">
        <TabsTrigger value="notifications" className="text-xs font-ui flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Bildirimler
        </TabsTrigger>
        <TabsTrigger value="settings" className="text-xs font-ui flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Ayarlar
        </TabsTrigger>
      </TabsList>

      {/* Notifications Tab */}
      <TabsContent value="notifications">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-professional">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-ui mb-1">Toplam</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <Bell className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-professional">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-ui mb-1">Okunmamış</p>
                    <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
                  </div>
                  <Bell className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-professional">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-ui mb-1">Okundu</p>
                    <p className="text-2xl font-bold text-foreground">{stats.read}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="card-professional">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Bildirim ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 input-modern"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={stats.unread === 0}
                  className="h-9"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Tümünü Okundu İşaretle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white dark:bg-card border border-border/40 dark:border-border/40 rounded-lg p-1">
              <TabsTrigger value="all" className="text-xs font-ui">Tümü</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs font-ui">Okunmamış</TabsTrigger>
              <TabsTrigger value="read" className="text-xs font-ui">Okundu</TabsTrigger>
              <TabsTrigger value="info" className="text-xs font-ui">Bilgi</TabsTrigger>
              <TabsTrigger value="success" className="text-xs font-ui">Başarılı</TabsTrigger>
              <TabsTrigger value="warning" className="text-xs font-ui">Uyarı</TabsTrigger>
              <TabsTrigger value="error" className="text-xs font-ui">Hata</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card className="card-professional">
                <CardHeader className="pb-4 px-5 pt-5">
                  <CardTitle className="text-base font-display font-bold text-foreground">
                    Bildirimler ({filteredNotifications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Bildirim bulunamadı</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all duration-200",
                            (notification.is_read ?? notification.read ?? false)
                              ? "bg-white dark:bg-card border-border/40 dark:border-border/40 opacity-60"
                              : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
                            "hover:shadow-md hover-lift"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-foreground">
                                  {notification.title}
                                </p>
                                {getTypeBadge(notification.type)}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(notification.created_at).toLocaleDateString("tr-TR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {notification.action_url && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => window.open(notification.action_url, "_self")}
                                  >
                                    Görüntüle →
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!(notification.is_read ?? notification.read ?? false) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                  title="Okundu işaretle"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notification.id)}
                                className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </TabsContent>

      {/* Settings Tab */}
      <TabsContent value="settings">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Bildirim Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="email_notifications" className="text-xs font-ui font-semibold">
                    E-posta Bildirimleri
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Önemli bildirimleri e-posta ile al
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="push_notifications" className="text-xs font-ui font-semibold">
                    Push Bildirimleri
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tarayıcı push bildirimlerini etkinleştir
                  </p>
                </div>
                <Switch
                  id="push_notifications"
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, push_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="comment_notifications" className="text-xs font-ui font-semibold">
                    Yorum Bildirimleri
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Yeni yorumlar için bildirim al
                  </p>
                </div>
                <Switch
                  id="comment_notifications"
                  checked={settings.comment_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, comment_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="content_notifications" className="text-xs font-ui font-semibold">
                    İçerik Bildirimleri
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    İçerik yayınlama bildirimlerini al
                  </p>
                </div>
                <Switch
                  id="content_notifications"
                  checked={settings.content_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, content_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="system_notifications" className="text-xs font-ui font-semibold">
                    Sistem Bildirimleri
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sistem güncellemeleri ve uyarıları al
                  </p>
                </div>
                <Switch
                  id="system_notifications"
                  checked={settings.system_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, system_notifications: checked })
                  }
                />
              </div>
            </div>
            <div className="pt-4 border-t border-border/40 dark:border-border/40">
              <Button
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
                onClick={async () => {
                  try {
                    const supabase = createClient();
                    const user = await supabase.auth.getUser();
                    await supabase.from("user_preferences").upsert({
                      user_id: user.data.user?.id,
                      notification_settings: settings,
                    });
                    toast.success("Ayarlar kaydedildi");
                  } catch (error: any) {
                    toast.error(error.message || "Ayarlar kaydedilemedi");
                  }
                }}
              >
                Ayarları Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

