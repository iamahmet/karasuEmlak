"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function SettingsTab({ locale: _locale }: { locale: string }) {
  
  const [settings, setSettings] = useState({
    errorThreshold: 0,
    warningThreshold: 10,
    scheduleEnabled: false,
    scheduleCron: "0 2 * * *", // Daily at 2 AM
  });

  const handleSave = async () => {
    try {
      const response = await fetch("/api/project-bot/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Ayarlar başarıyla kaydedildi!");
      } else {
        toast.error(data.error || "Ayarlar kaydedilemedi");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ayarlar kaydedilemedi";
      toast.error(errorMessage);
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="errorThreshold">Error Threshold</Label>
            <Input
              id="errorThreshold"
              type="number"
              value={settings.errorThreshold}
              onChange={(e) =>
                setSettings({ ...settings, errorThreshold: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum allowed errors before alert
            </p>
          </div>
          <div>
            <Label htmlFor="warningThreshold">Warning Threshold</Label>
            <Input
              id="warningThreshold"
              type="number"
              value={settings.warningThreshold}
              onChange={(e) =>
                setSettings({ ...settings, warningThreshold: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum allowed warnings before alert
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scheduleEnabled"
              checked={settings.scheduleEnabled}
              onChange={(e) =>
                setSettings({ ...settings, scheduleEnabled: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="scheduleEnabled">Enable scheduled scans</Label>
          </div>
          {settings.scheduleEnabled && (
            <div>
              <Label htmlFor="scheduleCron">Cron Expression</Label>
              <Input
                id="scheduleCron"
                value={settings.scheduleCron}
                onChange={(e) =>
                  setSettings({ ...settings, scheduleCron: e.target.value })
                }
                placeholder="0 2 * * *"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: minute hour day month weekday (e.g., "0 2 * * *" = daily at 2 AM)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Save Settings
      </Button>
    </div>
  );
}

