"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface KeyboardShortcutsProps {
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onSearch?: () => void;
  enabled?: boolean;
}

export function ContentKeyboardShortcuts({
  onSave,
  onPublish,
  onPreview,
  onSearch,
  enabled = true,
}: KeyboardShortcutsProps) {

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (onSave) {
          onSave();
          toast.success("İçerik kaydedildi");
        }
      }

      // Cmd/Ctrl + P: Publish
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        if (onPublish) {
          onPublish();
        }
      }

      // Cmd/Ctrl + Shift + P: Preview
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        if (onPreview) {
          onPreview();
        }
      }

      // Cmd/Ctrl + K: Search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (onSearch) {
          onSearch();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onSave, onPublish, onPreview, onSearch]);

  return null;
}

