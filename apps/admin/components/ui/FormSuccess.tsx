"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@karasu/lib";

interface FormSuccessProps {
  message: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-1",
        className
      )}
    >
      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
      <span className="font-ui">{message}</span>
    </div>
  );
}

