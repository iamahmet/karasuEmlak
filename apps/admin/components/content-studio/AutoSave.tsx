"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@karasu/ui";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@karasu/lib";

interface AutoSaveProps {
  onSave: () => Promise<void>;
  isDirty: boolean;
  saveInterval?: number; // milliseconds
  className?: string;
}

export function AutoSave({
  onSave,
  isDirty,
  saveInterval = 30000, // 30 seconds default
  className,
}: AutoSaveProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!isDirty) {
      setStatus("idle");
      return;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up auto-save interval
    intervalRef.current = setInterval(async () => {
      if (isDirty) {
        setStatus("saving");
        try {
          await onSave();
          setStatus("saved");
          lastSaveRef.current = new Date();
          
          // Reset to idle after 2 seconds
          setTimeout(() => {
            if (status === "saved") {
              setStatus("idle");
            }
          }, 2000);
        } catch (error) {
          setStatus("error");
          console.error("Auto-save failed:", error);
        }
      }
    }, saveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDirty, onSave, saveInterval]);

  if (!isDirty && status === "idle") {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {status === "saving" && (
        <Badge
          variant="outline"
          className="h-6 px-2 text-[10px] font-ui font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        >
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Kaydediliyor...
        </Badge>
      )}
      {status === "saved" && (
        <Badge
          variant="outline"
          className="h-6 px-2 text-[10px] font-ui font-semibold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          <Check className="h-3 w-3 mr-1" />
          Kaydedildi
        </Badge>
      )}
      {status === "error" && (
        <Badge
          variant="outline"
          className="h-6 px-2 text-[10px] font-ui font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Hata
        </Badge>
      )}
      {lastSaveRef.current && status === "saved" && (
        <span className="text-[10px] text-muted-foreground font-ui">
          {lastSaveRef.current.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}

