"use client";

import { Card, CardContent } from "@karasu/ui";
import { LucideIcon } from "lucide-react";
import { cn } from "@karasu/lib";

interface CompactStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function CompactStatsCard({
  label,
  value,
  icon: Icon,
  change,
  subtitle,
  trend,
  className,
}: CompactStatsCardProps) {
  return (
    <Card className={cn("card-professional hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {change && (
                <span
                  className={cn(
                    "text-xs font-semibold px-1.5 py-0.5 rounded",
                    trend === "up" && "text-green-600 bg-green-50 dark:bg-green-950/20",
                    trend === "down" && "text-red-600 bg-red-50 dark:bg-red-950/20",
                    trend === "stable" && "text-muted-foreground bg-muted"
                  )}
                >
                  {change}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
