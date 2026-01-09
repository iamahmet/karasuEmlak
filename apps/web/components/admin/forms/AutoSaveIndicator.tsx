"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, Save } from "lucide-react";
import { cn } from "@karasu/lib";

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  error?: string;
  className?: string;
}

export function AutoSaveIndicator({
  isDirty,
  isSaving,
  lastSaved,
  error,
  className,
}: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved && !isDirty && !isSaving) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, isDirty, isSaving]);

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-red-600 dark:text-red-400", className)}>
        <AlertCircle className="h-4 w-4" />
        <span>Kayıt hatası: {error}</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-design-gray dark:text-gray-400", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Kaydediliyor...</span>
      </div>
    );
  }

  if (showSaved && lastSaved) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-green-600 dark:text-green-400 animate-fade-in", className)}>
        <CheckCircle2 className="h-4 w-4" />
        <span>
          Kaydedildi {lastSaved.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    );
  }

  if (isDirty) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400", className)}>
        <Save className="h-4 w-4" />
        <span>Kaydedilmemiş değişiklikler</span>
      </div>
    );
  }

  return null;
}
