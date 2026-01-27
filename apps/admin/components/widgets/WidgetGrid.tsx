"use client";

// import { useState } from "react"; // TODO: Will be used for widget management
import { DashboardWidget } from "./DashboardWidget";
import { Button } from "@karasu/ui";
import { Plus } from "lucide-react";
import { SortableList } from "../drag-drop/SortableList";

interface Widget {
  id: string;
  title: string;
  component: React.ReactNode;
  type: string;
}

interface WidgetGridProps {
  widgets: Widget[];
  onReorder: (widgets: Widget[]) => void;
  onAddWidget?: () => void;
  onRemoveWidget?: (id: string) => void;
  onWidgetSettings?: (id: string) => void;
}

export function WidgetGrid({
  widgets,
  onReorder,
  onAddWidget,
  onRemoveWidget,
  onWidgetSettings,
}: WidgetGridProps) {
  return (
    <div className="space-y-4">
      {onAddWidget && (
        <div className="flex justify-end">
          <Button
            onClick={onAddWidget}
            variant="outline"
            className="h-9 px-3 text-sm border border-border/40 dark:border-border/40 rounded-lg font-ui hover-scale"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
      )}

      <SortableList
        items={widgets}
        onReorder={onReorder}
        getItemId={(widget) => widget.id}
        renderItem={(widget) => (
          <DashboardWidget
            id={widget.id}
            title={widget.title}
            onRemove={onRemoveWidget ? () => onRemoveWidget(widget.id) : undefined}
            onSettings={onWidgetSettings ? () => onWidgetSettings(widget.id) : undefined}
            draggable
          >
            {widget.component}
          </DashboardWidget>
        )}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      />
    </div>
  );
}

