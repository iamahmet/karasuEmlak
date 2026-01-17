"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Download, Upload, Filter, Settings } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  position?: "top" | "bottom" | "floating";
  className?: string;
}

export function QuickActionsBar({
  actions,
  position = "top",
  className,
}: QuickActionsBarProps) {
  const [expanded, setExpanded] = useState(false);

  if (position === "floating") {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col-reverse gap-2">
          {expanded && (
            <div className="flex flex-col gap-2 mb-2">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size="sm"
                    onClick={action.onClick}
                    className={cn(
                      "h-10 w-10 rounded-full shadow-lg",
                      action.className
                    )}
                    title={action.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          )}
          <Button
            variant="default"
            size="lg"
            onClick={() => setExpanded(!expanded)}
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className={cn("h-5 w-5 transition-transform duration-200", expanded && "rotate-45")} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-card border-b border-border",
        position === "bottom" && "border-t border-b-0",
        className
      )}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant || "default"}
            size="sm"
            onClick={action.onClick}
            className={cn("gap-2", action.className)}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
