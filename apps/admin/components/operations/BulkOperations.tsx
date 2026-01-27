"use client";

import { useState } from "react";
import {
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Archive,
  MoreVertical,
} from "lucide-react";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { cn } from "@karasu/lib";

interface BulkOperation {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive";
  requiresConfirmation?: boolean;
}

interface BulkOperationsProps {
  selectedCount: number;
  onAction: (action: string) => void;
  operations?: BulkOperation[];
  className?: string;
}

const defaultOperations: BulkOperation[] = [
  { id: "publish", label: "Yayınla", icon: Eye },
  { id: "unpublish", label: "Yayından Kaldır", icon: EyeOff },
  { id: "feature", label: "Öne Çıkar", icon: Star },
  { id: "unfeature", label: "Öne Çıkarmayı Kaldır", icon: StarOff },
  { id: "archive", label: "Arşivle", icon: Archive },
  { id: "delete", label: "Sil", icon: Trash2, variant: "destructive", requiresConfirmation: true },
  { id: "export", label: "Dışa Aktar", icon: Download },
];

export function BulkOperations({
  selectedCount,
  onAction,
  operations = defaultOperations,
  className,
}: BulkOperationsProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20",
        className
      )}
    >
      <Badge variant="secondary" className="font-semibold">
        {selectedCount} seçildi
      </Badge>

      <div className="flex items-center gap-2 flex-1">
        {operations.slice(0, 4).map((operation) => {
          const Icon = operation.icon;
          return (
            <Button
              key={operation.id}
              variant={operation.variant === "destructive" ? "destructive" : "outline"}
              size="sm"
              onClick={() => onAction(operation.id)}
              className="h-8 gap-2"
            >
              <Icon className="h-3.5 w-3.5" />
              {operation.label}
            </Button>
          );
        })}

        {operations.length > 4 && (
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="z-[100] bg-card border border-border shadow-xl rounded-lg backdrop-blur-xl"
            >
              {operations.slice(4).map((operation) => {
                const Icon = operation.icon;
                return (
                  <DropdownMenuItem
                    key={operation.id}
                    onClick={() => {
                      onAction(operation.id);
                      setShowMenu(false);
                    }}
                    className={cn(
                      operation.variant === "destructive" && "text-destructive"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {operation.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAction("clear")}
        className="h-8"
      >
        Temizle
      </Button>
    </div>
  );
}
