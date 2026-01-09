"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Settings,
  Bell,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  email_types: {
    content_approved: boolean;
    content_rejected: boolean;
    comment_received: boolean;
    user_registered: boolean;
    system_alert: boolean;
  };
  push_types: {
    content_approved: boolean;
    content_rejected: boolean;
    comment_received: boolean;
    user_registered: boolean;
    system_alert: boolean;
  };
  in_app_types: {
    content_approved: boolean;
    content_rejected: boolean;
    comment_received: boolean;
    user_registered: boolean;
    system_alert: boolean;
  };
}

interface NotificationPreferencesProps {
  userId: string;
  locale?: string;
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    email_types: {
      content_approved: true,
      content_rejected: true,
      comment_received: true,
      user_registered: false,
      system_alert: true,
    },
    push_types: {
      content_approved: true,
      content_rejected: true,
      comment_received: true,
      user_registered: false,
      system_alert: true,
    },
    in_app_types: {
      content_approved: true,
      content_rejected: true,
      comment_received: true,
      user_registered: false,
      system_alert: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      const supabase = createClient();
      
      // Fetch from user_preferences table or use defaults
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data?.notification_preferences) {
        setPreferences({
          ...preferences,
          ...data.notification_preferences,
        });
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Bildirim tercihleri kaydedildi");
    } catch (error: any) {
      toast.error(error.message || "Tercihler kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (path: string, value: boolean) => {
    const keys = path.split(".");
    setPreferences((prev) => {
      const newPrefs = { ...prev };
      let current: any = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const notificationTypes = [
    { key: "content_approved", label: "İçerik Onaylandı", icon: CheckCircle2 },
    { key: "content_rejected", label: "İçerik Reddedildi", icon: AlertCircle },
    { key: "comment_received", label: "Yorum Alındı", icon: MessageSquare },
    { key: "user_registered", label: "Yeni Kullanıcı Kaydı", icon: Bell },
    { key: "system_alert", label: "Sistem Uyarısı", icon: AlertCircle },
  ];

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton-professional rounded-lg"></div>
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
          <Settings className="h-5 w-5 text-design-light" />
          Bildirim Tercihleri
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-6">
        {/* Global Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-design-light" />
              <div>
                <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                  E-posta Bildirimleri
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                  E-posta ile bildirim al
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => updatePreference("email_enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-design-light" />
              <div>
                <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                  Push Bildirimleri
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                  Tarayıcı push bildirimleri
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => updatePreference("push_enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-design-light" />
              <div>
                <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                  Uygulama İçi Bildirimler
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                  Panel içi bildirimler
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.in_app_enabled}
              onCheckedChange={(checked) => updatePreference("in_app_enabled", checked)}
            />
          </div>
        </div>

        {/* Email Types */}
        {preferences.email_enabled && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-design-dark dark:text-white font-ui flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-posta Bildirim Türleri
            </h4>
            <div className="space-y-2">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-design-gray dark:text-gray-400" />
                      <Label className="text-xs font-ui text-design-dark dark:text-white">
                        {type.label}
                      </Label>
                    </div>
                    <Switch
                      checked={preferences.email_types[type.key as keyof typeof preferences.email_types]}
                      onCheckedChange={(checked) =>
                        updatePreference(`email_types.${type.key}`, checked)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Push Types */}
        {preferences.push_enabled && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-design-dark dark:text-white font-ui flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Push Bildirim Türleri
            </h4>
            <div className="space-y-2">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-design-gray dark:text-gray-400" />
                      <Label className="text-xs font-ui text-design-dark dark:text-white">
                        {type.label}
                      </Label>
                    </div>
                    <Switch
                      checked={preferences.push_types[type.key as keyof typeof preferences.push_types]}
                      onCheckedChange={(checked) =>
                        updatePreference(`push_types.${type.key}`, checked)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* In-App Types */}
        {preferences.in_app_enabled && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-design-dark dark:text-white font-ui flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Uygulama İçi Bildirim Türleri
            </h4>
            <div className="space-y-2">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-design-gray dark:text-gray-400" />
                      <Label className="text-xs font-ui text-design-dark dark:text-white">
                        {type.label}
                      </Label>
                    </div>
                    <Switch
                      checked={preferences.in_app_types[type.key as keyof typeof preferences.in_app_types]}
                      onCheckedChange={(checked) =>
                        updatePreference(`in_app_types.${type.key}`, checked)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-[#E7E7E7] dark:border-[#062F28]">
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

