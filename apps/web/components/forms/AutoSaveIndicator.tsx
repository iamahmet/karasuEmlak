"use client";

import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@karasu/lib";

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  className?: string;
}

export function AutoSaveIndicator({
  isDirty,
  isSaving,
  lastSaved,
  error,
  className,
}: AutoSaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-red-600 dark:text-red-400", className)}>
        <AlertCircle className="h-4 w-4" />
        <span>Save failed: {error}</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-gray-500", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (isDirty) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400", className)}>
        <Clock className="h-4 w-4" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-green-600 dark:text-green-400", className)}>
        <CheckCircle2 className="h-4 w-4" />
        <span>Saved at {formatTime(lastSaved)}</span>
      </div>
    );
  }

  return null;
}
