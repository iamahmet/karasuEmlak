"use client";

import { useState } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Checkbox } from "@karasu/ui";
import {
  Trash2,
  Download,
  Archive,
  Copy,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface MediaBulkOperationsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: (selected: boolean) => void;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  locale?: string;
}

export function MediaBulkOperations({
  selectedItems,
  totalItems,
  onSelectAll,
  onBulkAction,
}: MediaBulkOperationsProps) {
  const [loading, setLoading] = useState(false);
  const allSelected = selectedItems.length === totalItems && totalItems > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < totalItems;

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error("Lütfen en az bir öğe seçin");
      return;
    }

    const confirmMessages: Record<string, string> = {
      delete: `${selectedItems.length} dosyayı silmek istediğinize emin misiniz?`,
      archive: `${selectedItems.length} dosyayı arşivlemek istediğinize emin misiniz?`,
      download: `${selectedItems.length} dosyayı indirmek istediğinize emin misiniz?`,
    };

    if (confirmMessages[action] && !confirm(confirmMessages[action])) {
      return;
    }

    setLoading(true);
    try {
      await onBulkAction(action, selectedItems);
      toast.success(`${selectedItems.length} dosya için işlem tamamlandı`);
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <Card className="card-professional sticky top-0 z-10 border-t-2 border-t-design-light shadow-lg">
      <CardContent className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                className={cn(
                  "h-4 w-4",
                  someSelected && "data-[state=checked]:bg-design-light/50"
                )}
              />
              <span className="text-sm font-semibold text-design-dark dark:text-white">
                {selectedItems.length} dosya seçildi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("download")}
              disabled={loading}
              className="h-8 px-3 text-xs gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              İndir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("archive")}
              disabled={loading}
              className="h-8 px-3 text-xs gap-1"
            >
              <Archive className="h-3.5 w-3.5" />
              Arşivle
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading} className="h-8 px-3 text-xs gap-1">
                  <MoreVertical className="h-3.5 w-3.5" />
                  Daha Fazla
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("copy")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction("delete")}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

