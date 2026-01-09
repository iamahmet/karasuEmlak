"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { Trash2, Archive, CheckCircle2, XCircle, Calendar, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, ids: string[]) => Promise<void>;
  className?: string;
}

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
  onBulkAction,
  className,
}: BulkActionsBarProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      await onBulkAction(action, selectedIds);
      toast.success(`${selectedIds.length} içerik ${action} işlemi tamamlandı`);
      onClearSelection();
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-fixed animate-slide-up",
        className
      )}
      style={{ zIndex: 'var(--z-fixed)' }}
    >
      <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] rounded-2xl shadow-2xl backdrop-blur-xl">
        <Badge
          variant="outline"
          className="px-3 py-1.5 bg-design-light/15 text-design-dark dark:text-design-light font-ui font-bold border-design-light/30"
        >
          {selectedIds.length} seçili
        </Badge>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("publish")}
            disabled={loading}
            className="h-9 px-3 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Yayınla
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("archive")}
            disabled={loading}
            className="h-9 px-3 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
          >
            <Archive className="h-4 w-4 mr-2" />
            Arşivle
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="h-9 px-3 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
              >
                Daha Fazla
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg">
              <DropdownMenuItem
                onClick={() => handleAction("duplicate")}
                className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2"
              >
                <Copy className="h-4 w-4" />
                Kopyala
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("schedule")}
                className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2"
              >
                <Calendar className="h-4 w-4" />
                Zamanla
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("reject")}
                className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2 text-red-600 dark:text-red-400"
              >
                <XCircle className="h-4 w-4" />
                Reddet
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("delete")}
                className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2 text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-9 px-3 text-sm rounded-lg font-ui hover-scale"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}

