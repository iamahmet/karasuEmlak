"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@karasu/ui";
import { MediaLibrary } from "./MediaLibrary";
import { ImageIcon } from "lucide-react";

interface MediaLibraryButtonProps {
  onSelect: (url: string) => void;
  className?: string;
}

export function MediaLibraryButton({ onSelect, className }: MediaLibraryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={className}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Medya Kütüphanesi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-xl">
        <DialogHeader className="px-6 py-4 border-b border-border/40 dark:border-border/40">
          <DialogTitle className="text-lg font-display font-bold text-foreground">
            Medya Kütüphanesi
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto scrollbar-modern p-6">
          <MediaLibrary
            onSelect={(url) => {
              onSelect(url);
              setIsOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

