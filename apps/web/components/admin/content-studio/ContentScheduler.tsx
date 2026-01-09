"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Calendar, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ContentSchedulerProps {
  type: "article" | "news";
  contentId: string;
  currentSchedule?: string | null;
  onScheduleChange?: () => void;
  className?: string;
}

export function ContentScheduler({
  type,
  contentId,
  currentSchedule,
  onScheduleChange,
  className,
}: ContentSchedulerProps) {
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Parse current schedule if exists
  useEffect(() => {
    if (currentSchedule) {
      const date = new Date(currentSchedule);
      setScheduledDate(date.toISOString().split("T")[0]);
      setScheduledTime(date.toTimeString().slice(0, 5));
    } else {
      setScheduledDate("");
      setScheduledTime("");
    }
  }, [currentSchedule]);

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error("Lütfen tarih ve saat seçin");
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (scheduledDateTime <= new Date()) {
      toast.error("Gelecek bir tarih seçmelisiniz");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/content/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          id: contentId,
          scheduled_publish_at: scheduledDateTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Zamanlama başarısız");
      }

      toast.success(
        `İçerik ${scheduledDateTime.toLocaleString("tr-TR")} tarihinde yayınlanacak`
      );
      
      if (onScheduleChange) {
        onScheduleChange();
      }
    } catch (error: any) {
      toast.error(error.message || "Zamanlama başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/content/schedule?type=${type}&id=${contentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Zamanlama iptali başarısız");
      }

      toast.success("Zamanlama iptal edildi");
      setScheduledDate("");
      setScheduledTime("");
      
      if (onScheduleChange) {
        onScheduleChange();
      }
    } catch (error: any) {
      toast.error(error.message || "Zamanlama iptali başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          İçerik Zamanlama
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSchedule ? (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Zamanlanmış Yayın Tarihi
                </p>
                <p className="font-medium">
                  {new Date(currentSchedule).toLocaleString("tr-TR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSchedule}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                İptal Et
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule-date">Tarih</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="schedule-time">Saat</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleSchedule}
              disabled={loading || !scheduledDate || !scheduledTime}
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              {loading ? "Zamanlanıyor..." : "Zamanla"}
            </Button>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          İçerik belirlediğiniz tarih ve saatte otomatik olarak yayınlanacaktır.
        </p>
      </CardContent>
    </Card>
  );
}
