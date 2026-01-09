"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { GripVertical, X, Settings } from "lucide-react";
import { cn } from "@karasu/lib";

interface DashboardWidgetProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  onRemove?: () => void;
  onSettings?: () => void;
  className?: string;
  draggable?: boolean;
}

export function DashboardWidget({
  id,
  title,
  children,
  onRemove,
  onSettings,
  className,
  draggable = false,
}: DashboardWidgetProps) {
  const [isDragging] = useState(false);

  return (
    <Card
      className={cn(
        "card-modern relative group",
        isDragging && "opacity-50",
        className
      )}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {draggable && (
              <div className="cursor-move text-design-gray dark:text-gray-400 hover:text-design-dark dark:hover:text-white transition-colors">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettings}
                className="h-7 w-7 rounded-lg hover-scale"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-7 w-7 rounded-lg hover:text-red-600 dark:hover:text-red-400 hover-scale"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

