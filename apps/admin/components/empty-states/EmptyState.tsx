"use client";

import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { LucideIcon } from "lucide-react";
import { cn } from "@karasu/lib";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "compact" | "minimal";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("text-center py-8", className)}>
        <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground font-ui">{description}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("card-professional", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 px-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-design-light/20 to-design-light/10 dark:from-design-light/10 dark:to-design-light/5 flex items-center justify-center mb-3 animate-fade-in-up">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-heading-3 text-foreground mb-1">
            {title}
          </h3>
          <p className="text-caption text-muted-foreground text-center max-w-md mb-4">
            {description}
          </p>
          {action && (
            <Button
              onClick={action.onClick}
              size="sm"
              className="btn-primary-professional h-8 px-3 text-xs rounded-lg hover-scale micro-bounce focus-professional"
            >
              {action.label}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-professional", className)}>
      <CardContent className="empty-state-professional">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-design-light/20 to-design-light/10 dark:from-design-light/10 dark:to-design-light/5 flex items-center justify-center mb-4 animate-fade-in-up">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-heading-3 text-foreground mb-2">
          {title}
        </h3>
        <p className="text-body text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
        {action && (
          <Button
            onClick={action.onClick}
            className="btn-primary-professional h-9 px-4 text-sm rounded-lg hover-scale micro-bounce focus-professional"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

