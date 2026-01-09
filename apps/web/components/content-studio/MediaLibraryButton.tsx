"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@karasu/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@karasu/ui";
import { MediaLibrary } from "./MediaLibrary";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
}

interface MediaLibraryButtonProps {
  onSelect?: (media: MediaItem) => void;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function MediaLibraryButton({
  onSelect,
  buttonText = "Media Library",
  variant = "outline",
  size = "default",
  className,
  disabled = false,
}: MediaLibraryButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (media: MediaItem) => {
    if (onSelect) {
      onSelect(media);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <MediaLibrary
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
