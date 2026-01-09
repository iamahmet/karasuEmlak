"use client";

import { useState } from "react";
import { Image, Search } from "lucide-react";
import { Input } from "@karasu/ui";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
}

interface MediaLibraryProps {
  onSelect?: (media: MediaItem | string) => void;
  onClose?: () => void;
}

export function MediaLibrary({ onSelect, onClose }: MediaLibraryProps) {
  const [search, setSearch] = useState("");
  const [items] = useState<MediaItem[]>([]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No media items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer border rounded-lg p-2 hover:border-primary"
              onClick={() => onSelect?.(item)}
            >
              <img src={item.url} alt={item.name} className="w-full h-24 object-cover rounded" />
              <p className="text-xs truncate mt-1">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
