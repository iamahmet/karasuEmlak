"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import {
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ListingSchedulerProps {
  listing: {
    id: string;
    published: boolean;
    published_at?: string | null;
  };
  onSchedule?: (schedule: ScheduleData) => void;
  className?: string;
}

interface ScheduleData {
  publishAt: string | null;
  unpublishAt: string | null;
  reminderAt: string | null;
  autoRenew: boolean;
}

export function ListingScheduler({ listing, onSchedule, className }: ListingSchedulerProps) {
  const [schedule, setSchedule] = useState<ScheduleData>({
    publishAt: null,
    unpublishAt: null,
    reminderAt: null,
    autoRenew: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSchedule?.(schedule);
      toast.success("Zamanlama ayarları kaydedildi");
    } catch (error) {
      toast.error("Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Zamanlama
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Publish Schedule */}
        {!listing.published && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
              <Label className="text-sm font-semibold text-green-900 dark:text-green-100">
                Yayınlama Zamanı
              </Label>
            </div>
            <div className="space-y-2">
              <Input
                type="datetime-local"
                value={schedule.publishAt || ""}
                onChange={(e) => setSchedule({ ...schedule, publishAt: e.target.value || null })}
                min={getMinDateTime()}
                className="input-modern"
              />
              {schedule.publishAt && (
                <div className="flex items-center gap-2 text-xs text-green-800 dark:text-green-200">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(schedule.publishAt).toLocaleString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSchedule({ ...schedule, publishAt: null })}
                    className="ml-auto p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
                    title="Kaldır"
                    aria-label="Yayınlama zamanını kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unpublish Schedule */}
        {listing.published && (
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <Label className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                Yayından Kaldırma Zamanı
              </Label>
            </div>
            <div className="space-y-2">
              <Input
                type="datetime-local"
                value={schedule.unpublishAt || ""}
                onChange={(e) => setSchedule({ ...schedule, unpublishAt: e.target.value || null })}
                min={getMinDateTime()}
                className="input-modern"
              />
              {schedule.unpublishAt && (
                <div className="flex items-center gap-2 text-xs text-yellow-800 dark:text-yellow-200">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(schedule.unpublishAt).toLocaleString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSchedule({ ...schedule, unpublishAt: null })}
                    className="ml-auto p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    title="Kaldır"
                    aria-label="Yayından kaldırma zamanını kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reminder */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Hatırlatıcı
            </Label>
          </div>
          <div className="space-y-2">
            <Input
              type="datetime-local"
              value={schedule.reminderAt || ""}
              onChange={(e) => setSchedule({ ...schedule, reminderAt: e.target.value || null })}
              min={getMinDateTime()}
              className="input-modern"
            />
            {schedule.reminderAt && (
              <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(schedule.reminderAt).toLocaleString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => setSchedule({ ...schedule, reminderAt: null })}
                  className="ml-auto p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  title="Kaldır"
                  aria-label="Hatırlatıcı zamanını kaldır"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Auto Renew */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
          <div>
            <Label className="text-sm font-ui font-semibold">
              Otomatik Yenileme
            </Label>
            <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
              İlan süresi dolduğunda otomatik olarak yenile
            </p>
          </div>
          <Switch
            checked={schedule.autoRenew}
            onCheckedChange={(checked) => setSchedule({ ...schedule, autoRenew: checked })}
          />
        </div>

        {/* Save Button */}
        {(schedule.publishAt || schedule.unpublishAt || schedule.reminderAt || schedule.autoRenew) && (
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Zamanlamayı Kaydet
              </>
            )}
          </Button>
        )}

        {/* Active Schedules */}
        {(schedule.publishAt || schedule.unpublishAt || schedule.reminderAt) && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-2">
              Aktif Zamanlamalar:
            </p>
            <div className="space-y-1 text-xs text-design-gray dark:text-gray-400">
              {schedule.publishAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Yayınlama: {new Date(schedule.publishAt).toLocaleString("tr-TR")}</span>
                </div>
              )}
              {schedule.unpublishAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-yellow-600" />
                  <span>Yayından Kaldırma: {new Date(schedule.unpublishAt).toLocaleString("tr-TR")}</span>
                </div>
              )}
              {schedule.reminderAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <span>Hatırlatıcı: {new Date(schedule.reminderAt).toLocaleString("tr-TR")}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
