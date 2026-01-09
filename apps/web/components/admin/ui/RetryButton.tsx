"use client";

import { Button } from "@karasu/ui";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "lg" | "default" | "icon";
  className?: string;
}

/**
 * Retry Button Component
 * Provides retry functionality with loading state
 */
export function RetryButton({
  onRetry,
  label = "Yeniden Dene",
  variant = "outline",
  size = "default",
  className,
}: RetryButtonProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Button
      onClick={handleRetry}
      variant={variant}
      size={size}
      disabled={retrying}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? "animate-spin" : ""}`} />
      {retrying ? "Yenileniyor..." : label}
    </Button>
  );
}
