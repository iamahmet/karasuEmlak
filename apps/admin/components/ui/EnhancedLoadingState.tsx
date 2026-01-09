"use client";

import { Card, CardContent } from "@karasu/ui";
import { Loader2 } from "lucide-react";
import { cn } from "@karasu/lib";

interface EnhancedLoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: "spinner" | "skeleton" | "cards" | "pulse" | "dots";
  skeletonCount?: number;
  showMessage?: boolean;
}

export function EnhancedLoadingState({
  message = "Yükleniyor...",
  fullScreen = false,
  className,
  skeletonCount = 5,
  variant = "spinner",
  showMessage = true,
}: EnhancedLoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="card-professional">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 skeleton-professional w-3/4" style={{ animationDelay: `${i * 0.1}s` }}></div>
                <div className="h-4 skeleton-professional w-1/2" style={{ animationDelay: `${i * 0.1 + 0.05}s` }}></div>
                <div className="h-4 skeleton-professional w-2/3" style={{ animationDelay: `${i * 0.1 + 0.1}s` }}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={cn("admin-grid-3 gap-4", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="card-professional">
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="h-16 skeleton-professional rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
                <div className="h-4 skeleton-professional w-3/4" style={{ animationDelay: `${i * 0.1 + 0.05}s` }}></div>
                <div className="h-4 skeleton-professional w-1/2" style={{ animationDelay: `${i * 0.1 + 0.1}s` }}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          fullScreen ? "min-h-screen" : "py-12",
          className
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-design-light/20 to-transparent rounded-full animate-pulse"></div>
          <Loader2 className="h-12 w-12 animate-spin text-design-light relative z-10" />
        </div>
        {showMessage && (
          <p className="text-sm text-design-gray dark:text-gray-400 font-ui mt-4 animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          fullScreen ? "min-h-screen" : "py-12",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-design-light rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="h-3 w-3 bg-design-light rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="h-3 w-3 bg-design-light rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
        {showMessage && (
          <p className="text-sm text-design-gray dark:text-gray-400 font-ui mt-4">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen ? "min-h-screen" : "py-12",
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-design-light/20 to-transparent rounded-full animate-pulse"></div>
        <Loader2 className="h-8 w-8 animate-spin text-design-light relative z-10 mb-4" />
      </div>
      {showMessage && (
        <p className="text-sm text-design-gray dark:text-gray-400 font-ui">{message}</p>
      )}
    </div>
  );
}
