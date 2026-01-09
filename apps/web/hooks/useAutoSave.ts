"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  manualSave: () => Promise<void>;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialDataRef = useRef<string>(JSON.stringify(data));
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef(data);
  const onSaveRef = useRef(onSave);

  // Update refs
  useEffect(() => {
    dataRef.current = data;
    onSaveRef.current = onSave;
  }, [data, onSave]);

  // Check if data is dirty
  useEffect(() => {
    const currentData = JSON.stringify(data);
    setIsDirty(currentData !== initialDataRef.current);
  }, [data]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !isDirty) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      await performSave();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, enabled, isDirty, debounceMs]);

  const performSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSaveRef.current(dataRef.current);
      setLastSaved(new Date());
      initialDataRef.current = JSON.stringify(dataRef.current);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  const manualSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await performSave();
  }, [performSave]);

  return {
    isDirty,
    isSaving,
    lastSaved,
    error,
    manualSave,
  };
}
