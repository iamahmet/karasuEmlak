"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@karasu/lib";

interface EnhancedLoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EnhancedLoadingState({
  message = "Yükleniyor...",
  className,
  size = "md",
}: EnhancedLoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 md:py-16 px-4",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-[#006AFF] mb-4",
        sizeClasses[size]
      )} />
      <p className={cn(
        "text-gray-600 dark:text-gray-400 font-medium",
        textSizes[size]
      )}>
        {message}
      </p>
    </div>
  );
}
