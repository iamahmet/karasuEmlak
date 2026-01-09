"use client";

import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@karasu/lib";

interface EnhancedErrorStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "compact" | "minimal" | "inline";
  error?: Error | string;
}

export function EnhancedErrorState({
  title = "Bir hata oluştu",
  message,
  action,
  showHomeButton = false,
  showRetryButton = true,
  onRetry,
  className,
  variant = "default",
  error,
}: EnhancedErrorStateProps) {
  const router = useRouter();

  const errorMessage = error instanceof Error ? error.message : error || message || "Beklenmeyen bir hata oluştu.";

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-red-600 dark:text-red-400", className)}>
        <AlertCircle className="h-4 w-4" />
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800", className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">{title}</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("card-professional bg-white dark:bg-[#0a3d35] border-red-200 dark:border-red-800", className)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-design-dark dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-design-gray dark:text-gray-400 mb-4">{errorMessage}</p>
              <div className="flex items-center gap-2">
                {showRetryButton && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tekrar Dene
                  </Button>
                )}
                {action && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={action.onClick}
                    className="gap-2"
                  >
                    {action.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        variant === "default" ? "min-h-[400px]" : "py-12",
        className
      )}
    >
      <Card className="card-professional bg-white dark:bg-[#0a3d35] border-red-200 dark:border-red-800 max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-design-dark dark:text-white mb-2">{title}</h2>
            <p className="text-sm text-design-gray dark:text-gray-400 mb-6">{errorMessage}</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {showRetryButton && onRetry && (
                <Button
                  variant="outline"
                  onClick={onRetry}
                  className="gap-2 w-full sm:w-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tekrar Dene
                </Button>
              )}
              {action && (
                <Button
                  variant="default"
                  onClick={action.onClick}
                  className="gap-2 w-full sm:w-auto"
                >
                  {action.label}
                </Button>
              )}
              {showHomeButton && (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Home className="h-4 w-4" />
                  Ana Sayfaya Dön
                </Button>
              )}
              {!showRetryButton && !action && !showHomeButton && (
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="gap-2 w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Geri Dön
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
