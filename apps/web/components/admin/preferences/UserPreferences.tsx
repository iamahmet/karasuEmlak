"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Save, User, Bell } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@karasu/lib/supabase/client";
import { safeJsonParse } from "@/lib/utils/safeJsonParse";

interface Preferences {
  locale: string;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pushNotifications: boolean;
  dashboardLayout: "grid" | "list";
  itemsPerPage: number;
}

export function UserPreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    locale: "tr",
    theme: "system",
    emailNotifications: true,
    pushNotifications: false,
    dashboardLayout: "grid",
    itemsPerPage: 20,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("user-preferences");
        if (stored) {
          const parsed = safeJsonParse(stored, {}, {
            context: "user-preferences",
            dedupeKey: "user-preferences",
          });
          setPreferences(parsed as Preferences);
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (data) {
            setPreferences({ ...preferences, ...data.preferences });
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("user-preferences", JSON.stringify(preferences));

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            preferences,
            updated_at: new Date().toISOString(),
          });
      }

      toast.success("Preferences saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-sm text-design-gray dark:text-gray-400 font-ui">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="card-modern">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-design-light" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400">Language</Label>
            <Select
              value={preferences.locale}
              onValueChange={(value) => setPreferences({ ...preferences, locale: value })}
            >
              <SelectTrigger className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="tr" className="text-sm font-ui">Türkçe</SelectItem>
                <SelectItem value="en" className="text-sm font-ui">English</SelectItem>
                <SelectItem value="et" className="text-sm font-ui">Eesti</SelectItem>
                <SelectItem value="ru" className="text-sm font-ui">Русский</SelectItem>
                <SelectItem value="ar" className="text-sm font-ui">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400">Dashboard Layout</Label>
            <Select
              value={preferences.dashboardLayout}
              onValueChange={(value: "grid" | "list") =>
                setPreferences({ ...preferences, dashboardLayout: value })
              }
            >
              <SelectTrigger className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="grid" className="text-sm font-ui">Grid</SelectItem>
                <SelectItem value="list" className="text-sm font-ui">List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400">Items Per Page</Label>
            <Input
              type="number"
              value={preferences.itemsPerPage}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  itemsPerPage: parseInt(e.target.value) || 20,
                })
              }
              min={10}
              max={100}
              step={10}
              className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="card-modern">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-design-light" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-ui font-medium text-design-dark dark:text-white">Email Notifications</Label>
              <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-ui font-medium text-design-dark dark:text-white">Push Notifications</Label>
              <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                Receive browser push notifications
              </p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, pushNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 bg-design-dark hover:bg-design-dark/90 text-white rounded-lg font-ui hover-scale micro-bounce"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

