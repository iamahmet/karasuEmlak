"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@karasu/ui";
import { ImageUpload } from "./ImageUpload";
import { Search, Upload, Image as ImageIcon, Copy, Trash2 } from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  className?: string;
}

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  created_at: string;
}

export function MediaLibrary({ onSelect, className }: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.storage
        .from("content-images")
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Failed to fetch media:", error);
        return;
      }

      const items = (data || []).map((file) => ({
        id: file.id || file.name,
        name: file.name,
        url: supabase.storage.from("content-images").getPublicUrl(file.name).data.publicUrl,
        size: file.metadata?.size || 0,
        created_at: file.created_at || new Date().toISOString(),
      }));

      setMediaItems(items);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    setIsUploadOpen(false);
    fetchMedia();
    if (onSelect) {
      onSelect(url);
    }
    toast.success("Görsel yüklendi");
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL panoya kopyalandı");
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`"${item.name}" görselini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("content-images")
        .remove([item.name]);

      if (error) {
        throw error;
      }

      setMediaItems(mediaItems.filter((m) => m.id !== item.id));
      toast.success("Görsel silindi");
    } catch (error: any) {
      toast.error(error.message || "Silme başarısız");
    }
  };

  const filteredItems = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground">
            Medya Kütüphanesi
          </h3>
          <p className="text-xs text-muted-foreground font-ui mt-1">
            {mediaItems.length} görsel
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-gradient-to-r from-design-dark to-design-dark/90 hover:from-design-dark/95 hover:to-design-dark/90 text-white rounded-xl font-ui hover-scale micro-bounce shadow-lg">
              <Upload className="h-4 w-4 mr-2" />
              Yükle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-display font-bold text-foreground">
                Görsel Yükle
              </DialogTitle>
            </DialogHeader>
            <ImageUpload
              onUpload={handleUpload}
              className="mt-4"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Görsel ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 text-sm border border-border/40 dark:border-border/40 rounded-xl font-ui input-modern"
        />
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="card-modern animate-pulse">
              <CardContent className="p-0 aspect-square">
                <div className="w-full h-full bg-[#E7E7E7] dark:bg-muted rounded-xl"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="card-professional">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E7E7E7] to-[#E7E7E7]/80 dark:from-[#062F28] dark:to-[#062F28]/80 flex items-center justify-center shadow-lg">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-ui font-medium">
              {searchQuery ? "Görsel bulunamadı" : "Henüz görsel yok"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="card-professional hover-lift group relative overflow-hidden"
            >
              <CardContent className="p-0 aspect-square relative">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  {onSelect && (
                    <Button
                      size="icon"
                      onClick={() => onSelect(item.url)}
                      className="h-9 w-9 rounded-full bg-white hover:bg-white/90 text-design-dark hover-scale micro-bounce"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(item.url)}
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white hover-scale"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(item)}
                    className="h-9 w-9 rounded-full hover-scale micro-bounce"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <div className="p-2">
                <p className="text-[10px] font-ui font-semibold text-foreground line-clamp-1 mb-1">
                  {item.name}
                </p>
                <p className="text-[9px] text-muted-foreground font-ui">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

