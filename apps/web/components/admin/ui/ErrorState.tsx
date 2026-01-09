"use client";

import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { cn } from "@karasu/lib";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  showHomeButton?: boolean;
  className?: string;
  variant?: "default" | "compact" | "minimal";
}

export function ErrorState({
  title = "Bir hata oluştu",
  message,
  action,
  showHomeButton = false,
  className,
  variant = "default",
}: ErrorStateProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("text-center py-8", className)}>
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500 opacity-75" />
        <p className="text-sm text-red-600 dark:text-red-400 font-ui">{message}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("card-professional", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 px-6">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3 animate-fade-in-up">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-heading-3 text-design-dark dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-caption text-design-gray dark:text-gray-400 text-center max-w-md mb-4">
            {message}
          </p>
          <div className="flex items-center gap-2">
            {action && (
              <Button
                onClick={action.onClick}
                size="sm"
                className="btn-primary-professional h-8 px-3 text-xs rounded-lg hover-scale micro-bounce focus-professional"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                {action.label}
              </Button>
            )}
            {showHomeButton && (
              <Link href="/admin/dashboard">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-secondary-professional h-8 px-3 text-xs rounded-lg hover-scale micro-bounce focus-professional"
                >
                  <Home className="h-3 w-3 mr-1.5" />
                  Ana Sayfa
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-professional", className)}>
      <CardContent className="error-state-professional">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4 animate-fade-in-up">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-heading-2 text-red-800 dark:text-red-400 mb-2">
          {title}
        </h3>
        <p className="text-body text-red-700 dark:text-red-300 text-center max-w-md mb-6">
          {message}
        </p>
        <div className="flex items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              className="btn-primary-professional h-10 px-5 text-sm rounded-lg hover-scale micro-bounce focus-professional"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          )}
          {showHomeButton && (
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="btn-secondary-professional h-10 px-5 text-sm rounded-lg hover-scale micro-bounce focus-professional"
              >
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
