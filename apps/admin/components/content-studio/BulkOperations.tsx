"use client";

import { useState } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Checkbox } from "@karasu/ui";
import {
  Trash2,
  Archive,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
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

interface BulkOperationsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: (selected: boolean) => void;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  locale?: string;
}

export function BulkOperations({
  selectedItems,
  totalItems,
  onSelectAll,
  onBulkAction,
}: BulkOperationsProps) {
  const [loading, setLoading] = useState(false);
  const allSelected = selectedItems.length === totalItems && totalItems > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < totalItems;

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error("Lütfen en az bir öğe seçin");
      return;
    }

    const confirmMessages: Record<string, string> = {
      delete: `${selectedItems.length} öğeyi silmek istediğinize emin misiniz?`,
      archive: `${selectedItems.length} öğeyi arşivlemek istediğinize emin misiniz?`,
      publish: `${selectedItems.length} öğeyi yayınlamak istediğinize emin misiniz?`,
      unpublish: `${selectedItems.length} öğeyi yayından kaldırmak istediğinize emin misiniz?`,
    };

    if (confirmMessages[action] && !confirm(confirmMessages[action])) {
      return;
    }

    setLoading(true);
    try {
      await onBulkAction(action, selectedItems);
      toast.success(`${selectedItems.length} öğe için işlem tamamlandı`);
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
              <span className="text-sm font-semibold text-foreground">
                {selectedItems.length} öğe seçildi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("publish")}
              disabled={loading}
              className="h-8 px-3 text-xs gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Yayınla
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("unpublish")}
              disabled={loading}
              className="h-8 px-3 text-xs gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              Yayından Kaldır
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
                <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar
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

