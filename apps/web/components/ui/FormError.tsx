"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@karasu/lib";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 text-sm text-red-600 dark:text-red-400 mt-1",
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
