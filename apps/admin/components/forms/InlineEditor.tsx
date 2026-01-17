"use client";

import { useState, useEffect, useRef } from "react";
import { Edit2, Check, X, Save } from "lucide-react";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface InlineEditorProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  type?: "text" | "textarea";
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function InlineEditor({
  value: initialValue,
  onSave,
  type = "text",
  placeholder,
  className,
  autoSave = false,
  autoSaveDelay = 1000,
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === "text") {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
      setValue(initialValue); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);

    if (autoSave) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, autoSaveDelay);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!isEditing) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 group cursor-pointer",
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        <span className="flex-1">{value || placeholder || "Tıklayarak düzenle"}</span>
        <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {type === "text" ? (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
            if (e.key === "Escape") {
              handleCancel();
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-8"
          disabled={saving}
        />
      ) : (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleCancel();
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-h-[80px]"
          disabled={saving}
        />
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={saving || value === initialValue}
          className="h-7 w-7 p-0"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={saving}
          className="h-7 w-7 p-0"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
