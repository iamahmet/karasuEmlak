"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@karasu/ui";
import { Trash2, Archive, CheckSquare, MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface BulkActionsProps<T> {
  selectedItems: T[];
  onBulkDelete?: (items: T[]) => Promise<void>;
  onBulkArchive?: (items: T[]) => Promise<void>;
  onBulkPublish?: (items: T[]) => Promise<void>;
  onBulkUnpublish?: (items: T[]) => Promise<void>;
  getItemId: (item: T) => string;
  getItemLabel?: (item: T) => string;
}

export function BulkActions<T>({
  selectedItems,
  onBulkDelete,
  onBulkArchive,
  onBulkPublish,
  onBulkUnpublish,
  getItemId: _getItemId,
  getItemLabel: _getItemLabel,
}: BulkActionsProps<T>) {
  
  const [loading, setLoading] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const handleBulkAction = async (
    action: (items: T[]) => Promise<void>,
    actionName: string
  ) => {
    if (!action) return;

    setLoading(true);
    try {
      await action(selectedItems);
      toast.success(`${actionName} ${selectedItems.length} öğe için tamamlandı`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `${actionName.toLowerCase()} başarısız`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-fixed bg-card border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-up" style={{ zIndex: 'var(--z-fixed)' }}>
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground font-ui">
          {selectedItems.length} selected
        </span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        {onBulkPublish && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(onBulkPublish, "Publish")}
            disabled={loading}
            className="h-8 px-3 text-xs border border-border rounded-lg font-ui hover-scale"
          >
            Publish
          </Button>
        )}

        {onBulkUnpublish && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(onBulkUnpublish, "Unpublish")}
            disabled={loading}
            className="h-8 px-3 text-xs border border-border rounded-lg font-ui hover-scale"
          >
            Unpublish
          </Button>
        )}

        {onBulkArchive && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(onBulkArchive, "Archive")}
            disabled={loading}
            className="h-8 px-3 text-xs border border-border rounded-lg font-ui hover-scale"
          >
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            Archive
          </Button>
        )}

        {onBulkDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(onBulkDelete, "Delete")}
            disabled={loading}
            className="h-8 px-3 text-xs border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-ui hover-scale"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border border-border rounded-lg font-ui hover-scale"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-lg">
            <DropdownMenuItem className="font-ui text-sm">
              Export Selected
            </DropdownMenuItem>
            <DropdownMenuItem className="font-ui text-sm">
              Duplicate Selected
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-ui text-sm text-red-600 dark:text-red-400">
              Clear Selection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

