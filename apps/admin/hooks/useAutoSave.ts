"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
  onError,
}: UseAutoSaveOptions) {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [error, setError] = useState<string | undefined>();
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<any>();

  // Check if data has changed
  useEffect(() => {
    if (!enabled) return;

    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged && previousDataRef.current !== undefined) {
      setIsDirty(true);
      setError(undefined);
    }

    previousDataRef.current = data;
  }, [data, enabled]);

  // Auto-save when dirty
  useEffect(() => {
    if (!enabled || !isDirty || isSaving) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(data);
        setIsDirty(false);
        setLastSaved(new Date());
        setError(undefined);
      } catch (err: any) {
        const errorMessage = err.message || "Kayıt başarısız";
        setError(errorMessage);
        if (onError) {
          onError(err);
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isDirty, data, onSave, debounceMs, enabled, isSaving, onError]);

  const manualSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(data);
      setIsDirty(false);
      setLastSaved(new Date());
      setError(undefined);
      toast.success("Başarıyla kaydedildi");
    } catch (err: any) {
      const errorMessage = err.message || "Kayıt başarısız";
      setError(errorMessage);
      if (onError) {
        onError(err);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave, isSaving, onError]);

  return {
    isDirty,
    isSaving,
    lastSaved,
    error,
    manualSave,
  };
}
