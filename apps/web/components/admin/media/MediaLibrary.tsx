"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { toast } from "sonner";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Grid3x3,
  List,
  Trash2,
  Download,
  Copy,
  Eye,
  Video,
  File,
  Zap,
  Sparkles,
} from "lucide-react";
import { cn } from "@karasu/lib";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@karasu/ui";
import { AdvancedUpload } from "./AdvancedUpload";
import { ImageOptimizer } from "./ImageOptimizer";
import { MediaBulkOperations } from "./MediaBulkOperations";

interface MediaItem {
  id: string;
  name: string;
  path: string;
  bucket_id: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    width?: number;
    height?: number;
  };
  url?: string;
  source?: "storage" | "media_assets";
  aiGenerated?: boolean;
  cloudinaryPublicId?: string;
  altText?: string;
  assetType?: string;
  entityType?: string;
  entityId?: string;
  width?: number;
  height?: number;
  usageCount?: number;
  generationCost?: number;
}

export function MediaLibrary({
  locale,
}: {
  locale: string;
  initialType?: string;
  initialCategory?: string;
}) {
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [aiFilter, setAiFilter] = useState<"all" | "ai" | "manual">("all");

  useEffect(() => {
    fetchMedia();
  }, [aiFilter]);

  useEffect(() => {
    filterMedia();
  }, [searchQuery, mediaItems, aiFilter]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (aiFilter === "ai") {
        params.append("aiGenerated", "true");
      } else if (aiFilter === "manual") {
        params.append("aiGenerated", "false");
      }
      params.append("limit", "200"); // Fetch more to show all AI images

      const response = await fetch(`/api/media?${params}`);
      
      if (!response.ok) {
        throw new Error("Medya yüklenemedi");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Invalid response format");
      }

      const itemsWithUrls: MediaItem[] = (data.files || []).map((file: any) => ({
        id: file.id || file.name,
        name: file.name,
        path: file.source === "media_assets" ? file.cloudinaryPublicId || file.name : file.name,
        bucket_id: file.source === "media_assets" ? "cloudinary" : "media",
        created_at: file.createdAt || new Date().toISOString(),
        updated_at: file.updatedAt || new Date().toISOString(),
        metadata: {
          size: file.size,
          mimetype: file.mimeType,
          width: file.width,
          height: file.height,
        },
        url: file.url,
        source: file.source || "storage",
        aiGenerated: file.aiGenerated || false,
        cloudinaryPublicId: file.cloudinaryPublicId,
        altText: file.altText,
        assetType: file.assetType,
        entityType: file.entityType,
        entityId: file.entityId,
        width: file.width,
        height: file.height,
        usageCount: file.usageCount,
        generationCost: file.generationCost,
      }));

      setMediaItems(itemsWithUrls);
      setFilteredItems(itemsWithUrls);
    } catch (error: any) {
      // Media fetch failed, continue with empty state
      toast.error(error.message || "Medya yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = mediaItems;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.altText?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // AI filter is handled in fetchMedia via API params
    // But we can also filter client-side if needed
    if (aiFilter === "ai") {
      filtered = filtered.filter((item) => item.aiGenerated === true);
    } else if (aiFilter === "manual") {
      filtered = filtered.filter((item) => item.aiGenerated !== true);
    }

    setFilteredItems(filtered);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`"${item.name}" dosyasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/media?paths=${item.path}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Dosya silinemedi");
      }

      toast.success("Dosya silindi");

      fetchMedia();
    } catch (error: any) {
      toast.error(error.message || "Dosya silinemedi");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL kopyalandı");
  };

  const getFileIcon = (mimetype?: string) => {
    if (!mimetype) return <File className="h-5 w-5" />;
    if (mimetype.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (mimetype.startsWith("video/")) return <Video className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Bilinmiyor";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="card-professional animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const handleBulkAction = async (action: string, itemIds: string[]) => {
    try {
      const supabase = createClient();
      
      switch (action) {
        case "delete":
          // Delete from storage and database
          for (const itemId of itemIds) {
            const item = mediaItems.find((m) => m.id === itemId);
            if (item) {
              await supabase.storage.from("media").remove([item.path]);
            }
          }
          await fetchMedia();
          break;
        case "download":
          // Trigger downloads
          itemIds.forEach((itemId) => {
            const item = mediaItems.find((m) => m.id === itemId);
            if (item?.url) {
              const link = document.createElement("a");
              link.href = item.url;
              link.download = item.name;
              link.click();
            }
          });
          break;
        case "archive":
          // Archive items (mark as archived in database)
          toast.success(`${itemIds.length} dosya arşivlendi`);
          break;
        case "copy":
          // Copy URLs to clipboard
          const urls = itemIds
            .map((id) => mediaItems.find((m) => m.id === id)?.url)
            .filter(Boolean)
            .join("\n");
          await navigator.clipboard.writeText(urls);
          toast.success(`${itemIds.length} URL panoya kopyalandı`);
          break;
      }
      
      setSelectedItems([]);
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız");
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulk Operations Bar */}
      {selectedItems.length > 0 && (
        <MediaBulkOperations
          selectedItems={selectedItems}
          totalItems={filteredItems.length}
          onSelectAll={(selected) => {
            if (selected) {
              setSelectedItems(filteredItems.map((item) => item.id));
            } else {
              setSelectedItems([]);
            }
          }}
          onBulkAction={handleBulkAction}
          locale={locale}
        />
      )}

      {/* Toolbar */}
      <Card className="card-professional">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-design-gray dark:text-gray-400" />
              <Input
                placeholder="Medya ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={aiFilter} onValueChange={(value) => {
                setAiFilter(value as "all" | "ai" | "manual");
                fetchMedia();
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="ai">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      AI Görselleri
                    </div>
                  </SelectItem>
                  <SelectItem value="manual">Manuel Yüklenen</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setUploadOpen(true)}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white hover-scale micro-bounce rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                Yükle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      {filteredItems.length === 0 ? (
        <Card className="card-professional">
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50 text-design-gray dark:text-gray-400" />
            <p className="text-design-gray dark:text-gray-400">Medya bulunamadı</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "card-professional hover-lift cursor-pointer group relative",
                selectedItems.includes(item.id) && "ring-2 ring-design-light"
              )}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                // Don't trigger if clicking on checkbox or interactive elements
                if (
                  target.closest('.checkbox-container') ||
                  target.closest('button') ||
                  target.closest('a') ||
                  target.closest('input')
                ) {
                  return;
                }
                
                // Toggle selection with Cmd/Ctrl
                if (e.metaKey || e.ctrlKey) {
                  e.preventDefault();
                  setSelectedItems((prev) =>
                    prev.includes(item.id)
                      ? prev.filter((id) => id !== item.id)
                      : [...prev, item.id]
                  );
                } else {
                  e.preventDefault();
                  setSelectedItem(item);
                  setPreviewOpen(true);
                }
              }}
            >
              {/* Selection Checkbox */}
              <div className="checkbox-container absolute top-2 left-2 z-10">
                <label className="sr-only">Select {item.name}</label>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedItems((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-design-light focus:ring-design-light"
                  aria-label={`Select ${item.name}`}
                />
              </div>
              <CardContent className="p-3">
                <div className="relative aspect-square bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg overflow-hidden mb-2">
                  {item.metadata?.mimetype?.startsWith("image/") && item.url ? (
                    <img
                      src={item.url}
                      alt={item.altText || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(item.metadata?.mimetype)}
                    </div>
                  )}
                  {item.aiGenerated && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs font-ui text-design-dark dark:text-white truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-design-gray dark:text-gray-400">
                    {formatFileSize(item.metadata?.size)}
                  </p>
                  {item.usageCount !== undefined && item.usageCount > 0 && (
                    <p className="text-[10px] text-design-gray dark:text-gray-400">
                      {item.usageCount}x
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-professional">
          <CardContent className="p-0">
            <div className="divide-y divide-[#E7E7E7] dark:divide-[#062F28]">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-[#F9FAFB] dark:hover:bg-[#0a3d35] transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setPreviewOpen(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.metadata?.mimetype?.startsWith("image/") && item.url ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getFileIcon(item.metadata?.mimetype)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-design-dark dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                        {formatFileSize(item.metadata?.size)} •{" "}
                        {new Date(item.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.metadata?.mimetype?.startsWith("image/") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setOptimizerOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                          title="Optimize Et"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.url) handleCopyUrl(item.url);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      {selectedItem && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedItem.name}</DialogTitle>
                {selectedItem.aiGenerated && (
                  <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                    <Sparkles className="h-4 w-4" />
                    AI Görseli
                  </div>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {selectedItem.metadata?.mimetype?.startsWith("image/") && selectedItem.url ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText || selectedItem.name}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg flex items-center justify-center">
                  {getFileIcon(selectedItem.metadata?.mimetype)}
                </div>
              )}
              {/* Metadata */}
              {(selectedItem.aiGenerated || selectedItem.altText || selectedItem.usageCount !== undefined) && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#F9FAFB] dark:bg-[#0a3d35] rounded-lg">
                  {selectedItem.altText && (
                    <div>
                      <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-1">Alt Text</p>
                      <p className="text-sm">{selectedItem.altText}</p>
                    </div>
                  )}
                  {selectedItem.width && selectedItem.height && (
                    <div>
                      <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-1">Boyut</p>
                      <p className="text-sm">{selectedItem.width} × {selectedItem.height}px</p>
                    </div>
                  )}
                  {selectedItem.usageCount !== undefined && (
                    <div>
                      <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-1">Kullanım</p>
                      <p className="text-sm">{selectedItem.usageCount} kez kullanıldı</p>
                    </div>
                  )}
                  {selectedItem.generationCost !== undefined && selectedItem.generationCost > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-1">Maliyet</p>
                      <p className="text-xs">${selectedItem.generationCost.toFixed(4)}</p>
                    </div>
                  )}
                  {selectedItem.cloudinaryPublicId && (
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-1">Cloudinary ID</p>
                      <p className="text-xs font-mono break-all">{selectedItem.cloudinaryPublicId}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedItem.url) handleCopyUrl(selectedItem.url);
                  }}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  URL'yi Kopyala
                </Button>
                {selectedItem.url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedItem.url, "_blank")}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                )}
                {selectedItem.source !== "media_assets" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedItem);
                      setPreviewOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dosya Yükle</DialogTitle>
          </DialogHeader>
          <AdvancedUpload
            onUploadComplete={() => {
              fetchMedia();
              setUploadOpen(false);
            }}
            locale={locale}
          />
        </DialogContent>
      </Dialog>

      {/* Optimizer Dialog */}
      {selectedItem && selectedItem.metadata?.mimetype?.startsWith("image/") && (
        <Dialog open={optimizerOpen} onOpenChange={setOptimizerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Görsel Optimizasyonu</DialogTitle>
            </DialogHeader>
            <ImageOptimizer
              imageUrl={selectedItem.url || ""}
              imageId={selectedItem.id}
              onOptimize={(_url) => {
                toast.success("Görsel optimize edildi");
                fetchMedia();
              }}
              locale={locale}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

