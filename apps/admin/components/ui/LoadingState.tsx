"use client";

import { Card, CardContent } from "@karasu/ui";
import { Loader2 } from "lucide-react";
import { cn } from "@karasu/lib";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
  skeletonCount?: number;
  variant?: "spinner" | "skeleton" | "cards";
}

export function LoadingState({
  message = "Yükleniyor...",
  fullScreen = false,
  className,
  skeletonCount = 5,
  variant = "spinner",
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="card-professional">
            <CardContent className="p-6">
              <div className="h-4 skeleton-professional w-3/4 mb-2" style={{ animationDelay: `${i * 0.1}s` }}></div>
              <div className="h-4 skeleton-professional w-1/2" style={{ animationDelay: `${i * 0.1 + 0.05}s` }}></div>
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
              <div className="h-16 skeleton-professional rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
            </CardContent>
          </Card>
        ))}
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
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground font-ui">{message}</p>
    </div>
  );
}

