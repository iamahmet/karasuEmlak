"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@karasu/ui";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface EnhancedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showCloseButton?: boolean;
  className?: string;
  headerActions?: ReactNode;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-[95vw]",
};

export function EnhancedModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  className,
  headerActions,
}: EnhancedModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-hidden p-0 gap-0 rounded-2xl border-2 border-border/40/60 dark:border-[#0a3d35]/60 shadow-2xl bg-white/98 dark:bg-card/98 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || description || headerActions || showCloseButton) && (
          <DialogHeader className="px-6 py-5 border-b border-border/40 dark:border-[#0a3d35] bg-gradient-to-r from-white/50 to-transparent dark:from-[#0a3d35]/50 sticky top-0 z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {title && (
                  <DialogTitle className="text-xl font-display font-bold text-foreground mb-1 pr-8">
                    {title}
                  </DialogTitle>
                )}
                {description && (
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerActions}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8 rounded-lg hover:bg-[#E7E7E7]/50 dark:hover:bg-card/50 transition-all duration-300 hover:scale-110"
                    aria-label="Kapat"
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
        )}

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-80px)] scrollbar-modern">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
