"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
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
  X,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Edit2,
  Save,
  RotateCw,
  Move,
  Loader2,
} from "lucide-react";
import { cn } from "@karasu/lib";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [viewMode, setViewMode] = useState<"grid" | "list" | "folders">("folders");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  // Preview enhancements
  const [zoomLevel, setZoomLevel] = useState(100);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedAltText, setEditedAltText] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isOptimizingSEO, setIsOptimizingSEO] = useState(false);
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false);
  const [aiFilter, setAiFilter] = useState<"all" | "ai" | "manual">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size" | "usage">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMedia();
  }, [aiFilter]);

  // Reset zoom and position when preview opens/closes or item changes
  useEffect(() => {
    if (previewOpen && selectedItem) {
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
      setEditedAltText(selectedItem.altText || "");
      setEditedTitle(selectedItem.name || "");
      setIsEditingMetadata(false);
    }
  }, [previewOpen, selectedItem]);

  // Keyboard navigation for preview
  useEffect(() => {
    if (!previewOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setPreviewOpen(false);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const currentIndex = filteredItems.findIndex(item => item.id === selectedItem?.id);
        if (currentIndex !== -1) {
          const nextIndex = e.key === "ArrowLeft" 
            ? (currentIndex - 1 + filteredItems.length) % filteredItems.length
            : (currentIndex + 1) % filteredItems.length;
          setSelectedItem(filteredItems[nextIndex]);
        }
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoomLevel(prev => Math.min(prev + 25, 500));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoomLevel(prev => Math.max(prev - 25, 25));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoomLevel(100);
        setImagePosition({ x: 0, y: 0 });
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen, selectedItem, filteredItems, isFullscreen]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!previewOpen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoomLevel(prev => Math.max(25, Math.min(500, prev + delta)));
  }, [previewOpen]);

  // Handle image drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel <= 100) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  }, [zoomLevel, imagePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 100) return;
    e.preventDefault();
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Save metadata edits
  const handleSaveMetadata = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      const supabase = createClient();
      const updates: any = {};
      
      if (editedAltText !== selectedItem.altText) {
        updates.alt_text = editedAltText;
      }
      
      // Update media_assets table if it exists
      if (selectedItem.source === "media_assets") {
        const { error } = await supabase
          .from("media_assets")
          .update(updates)
          .eq("id", selectedItem.id);
        
        if (error) throw error;
      }
      
      // Update local state
      setSelectedItem({ ...selectedItem, altText: editedAltText, name: editedTitle });
      setMediaItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, altText: editedAltText, name: editedTitle }
          : item
      ));
      
      setIsEditingMetadata(false);
      toast.success("Metadata güncellendi");
    } catch (error: any) {
      console.error("Metadata update error:", error);
      toast.error(error.message || "Metadata güncellenemedi");
    }
  }, [selectedItem, editedAltText, editedTitle]);

  // AI SEO Optimization
  const handleAISEOOptimize = useCallback(async () => {
    if (!selectedItem || !selectedItem.url) return;
    
    setIsOptimizingSEO(true);
    try {
      const response = await fetch("/api/media/seo-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: selectedItem.id,
          imageUrl: selectedItem.url,
          currentAltText: selectedItem.altText,
          filename: selectedItem.name,
        }),
      });

      if (!response.ok) {
        throw new Error("SEO optimizasyonu başarısız");
      }

      const data = await response.json();
      
      // Update local state
      setEditedAltText(data.altText || "");
      setSelectedItem({
        ...selectedItem,
        altText: data.altText,
        name: data.optimizedFilename || selectedItem.name,
      });
      setMediaItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, altText: data.altText, name: data.optimizedFilename || item.name }
          : item
      ));
      
      setIsEditingMetadata(true); // Auto-open edit mode to show results
      toast.success("Görsel SEO için optimize edildi");
    } catch (error: any) {
      console.error("SEO optimization error:", error);
      toast.error(error.message || "SEO optimizasyonu başarısız");
    } finally {
      setIsOptimizingSEO(false);
    }
  }, [selectedItem]);

  // Auto Optimize Image
  const handleAutoOptimize = useCallback(async () => {
    if (!selectedItem || !selectedItem.url) return;
    
    setIsAutoOptimizing(true);
    try {
      const response = await fetch(`/api/media/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: selectedItem.id,
          imageUrl: selectedItem.url,
        }),
      });

      if (!response.ok) {
        throw new Error("Optimizasyon başarısız");
      }

      const data = await response.json();
      toast.success("Görsel optimize edildi ve boyutu küçültüldü");
      fetchMedia(); // Refresh to get updated image
    } catch (error: any) {
      console.error("Auto optimize error:", error);
      toast.error(error.message || "Optimizasyon başarısız");
    } finally {
      setIsAutoOptimizing(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    filterMedia();
  }, [searchQuery, mediaItems, aiFilter, sortBy, sortOrder]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (aiFilter === "ai") {
        params.append("aiGenerated", "true");
      } else if (aiFilter === "manual") {
        params.append("aiGenerated", "false");
      }
      params.append("limit", "200"); // Fetch more to show all images

      const response = await fetch(`/api/media?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[MediaLibrary] API error:", response.status, errorText);
        throw new Error(`Medya yüklenemedi: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both response formats: {success: true, data: {...}} and direct {files: [...]}
      const files = data.data?.files || data.files || [];
      
      if (!Array.isArray(files)) {
        console.error("[MediaLibrary] Invalid response format:", data);
        throw new Error("Invalid response format: files is not an array");
      }

      const itemsWithUrls: MediaItem[] = files.map((file: any) => ({
        id: file.id || file.name || `${file.source}-${Date.now()}-${Math.random()}`,
        name: file.name || "Unnamed file",
        path: file.source === "media_assets" 
          ? (file.cloudinaryPublicId || file.cloudinary_public_id || file.name) 
          : (file.fullPath || file.path || file.name),
        bucket_id: file.source === "media_assets" ? "cloudinary" : "media",
        created_at: file.createdAt || file.created_at || new Date().toISOString(),
        updated_at: file.updatedAt || file.updated_at || new Date().toISOString(),
        metadata: {
          size: file.size || file.bytes || 0,
          mimetype: file.mimeType || file.mimetype || file.mime_type || "",
          width: file.width,
          height: file.height,
        },
        url: file.url,
        source: file.source || "storage",
        aiGenerated: file.aiGenerated || file.ai_generated || false,
        cloudinaryPublicId: file.cloudinaryPublicId || file.cloudinary_public_id,
        altText: file.altText || file.alt_text,
        assetType: file.assetType || file.asset_type,
        entityType: file.entityType || file.entity_type,
        entityId: file.entityId || file.entity_id,
        width: file.width,
        height: file.height,
        usageCount: file.usageCount || file.usage_count || 0,
        generationCost: file.generationCost || file.generation_cost,
      }));

      console.log(`[MediaLibrary] Loaded ${itemsWithUrls.length} media items`);
      setMediaItems(itemsWithUrls);
      setFilteredItems(itemsWithUrls);
    } catch (error: any) {
      console.error("[MediaLibrary] Fetch error:", error);
      // Media fetch failed, continue with empty state
      toast.error(error.message || "Medya yüklenemedi");
      setMediaItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Organize media items by folder structure
  interface FolderStructure {
    name: string;
    path: string;
    items: MediaItem[];
    subfolders: Map<string, FolderStructure>;
  }

  // Define organizeByFolders function (regular function, not useCallback to avoid dependency issues)
  const organizeByFolders = (items: MediaItem[]): FolderStructure => {
    const root: FolderStructure = {
      name: "Tüm Medyalar",
      path: "",
      items: [],
      subfolders: new Map(),
    };

    for (const item of items) {
      // Extract folder path from item.path or item.url
      let folderPath = "";
      
      // Extract folder path from item.path or item.url
      if (item.path && item.path.includes("/")) {
        // Path like "listings/aziziye-mahallesi/ilan-basligi/image.jpg"
        const parts = item.path.split("/");
        if (parts[0] === "listings") {
          // Remove "listings" prefix and filename
          folderPath = parts.slice(1, -1).join("/");
        } else {
          folderPath = parts.slice(0, -1).join("/");
        }
      } else if (item.url && item.url.includes("/listings/")) {
        // URL like "https://...supabase.co/.../media/listings/aziziye-mahallesi/ilan-basligi/image.jpg"
        const urlParts = item.url.split("/listings/");
        if (urlParts[1]) {
          const pathParts = urlParts[1].split("/");
          folderPath = pathParts.slice(0, -1).join("/"); // Remove filename
        }
      } else if (item.url && item.url.includes("/media/")) {
        // URL like "https://...supabase.co/.../media/listings/aziziye-mahallesi/ilan-basligi/image.jpg"
        const urlParts = item.url.split("/media/");
        if (urlParts[1]) {
          const pathParts = urlParts[1].split("/");
          if (pathParts[0] === "listings") {
            folderPath = pathParts.slice(1, -1).join("/");
          } else {
            folderPath = pathParts.slice(0, -1).join("/");
          }
        }
      }

      if (folderPath) {
        // Navigate/create folder structure
        const pathParts = folderPath.split("/").filter(p => p.length > 0);
        let current = root;
        
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          // Humanize folder name (replace hyphens with spaces, capitalize)
          const displayName = part
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          
          if (!current.subfolders.has(part)) {
            current.subfolders.set(part, {
              name: displayName,
              path: pathParts.slice(0, i + 1).join("/"),
              items: [],
              subfolders: new Map(),
            });
          }
          current = current.subfolders.get(part)!;
        }
        
        current.items.push(item);
      } else {
        // No folder structure, add to root
        root.items.push(item);
      }
    }

    return root;
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

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name, "tr");
          break;
        case "size":
          comparison = (a.metadata?.size || 0) - (b.metadata?.size || 0);
          break;
        case "usage":
          comparison = (a.usageCount || 0) - (b.usageCount || 0);
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredItems(filtered);
  };

  // Get folder structure for current filtered items (memoized)
  const folderStructure = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) {
      return {
        name: "Tüm Medyalar",
        path: "",
        items: [],
        subfolders: new Map(),
      };
    }
    return organizeByFolders(filteredItems);
  }, [filteredItems]);

  // Auto-expand root folders when switching to folder view
  useEffect(() => {
    if (viewMode === "folders" && filteredItems.length > 0 && folderStructure) {
      const allPaths = new Set<string>();
      const collectPaths = (folder: FolderStructure) => {
        if (folder.path && (folder.items.length > 0 || folder.subfolders.size > 0)) {
          allPaths.add(folder.path);
        }
        folder.subfolders.forEach((subfolder) => collectPaths(subfolder));
      };
      collectPaths(folderStructure);
      if (allPaths.size > 0 && expandedFolders.size === 0) {
        setExpandedFolders(allPaths);
      }
    }
  }, [viewMode, filteredItems.length, folderStructure, expandedFolders.size]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  // Render folder tree recursively
  const renderFolder = (folder: FolderStructure, level: number = 0): React.ReactNode => {
    const isExpanded = folder.path === "" || expandedFolders.has(folder.path);
    const hasSubfolders = folder.subfolders.size > 0;
    const hasItems = folder.items.length > 0;
    const hasContent = hasItems || hasSubfolders;
    
    // Calculate total items (including subfolders)
    const countItemsInSubfolders = (subfolder: FolderStructure): number => {
      let count = subfolder.items.length;
      subfolder.subfolders.forEach((sub) => {
        count += countItemsInSubfolders(sub);
      });
      return count;
    };
    
    const totalItems = folder.items.length + Array.from(folder.subfolders.values())
      .reduce((sum, subfolder) => sum + countItemsInSubfolders(subfolder), 0);

    // Don't render empty root if it has no content
    if (folder.path === "" && !hasContent) {
      return null;
    }

    return (
      <div key={folder.path || "root"} className="w-full">
        {/* Folder Header */}
        {folder.path !== "" && (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border border-transparent hover:border-border",
              level > 0 && "ml-4",
              isExpanded && "bg-muted/30"
            )}
            onClick={() => toggleFolder(folder.path)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-foreground flex-1 truncate">
              {folder.name}
            </span>
            {totalItems > 0 && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {totalItems} {totalItems === 1 ? 'dosya' : 'dosya'}
              </Badge>
            )}
          </div>
        )}
        
        {/* Folder Content */}
        {(isExpanded || folder.path === "") && hasContent && (
          <div className={cn(
            "space-y-3",
            folder.path !== "" && "ml-8 mt-2 border-l border-border pl-4"
          )}>
            {/* Render subfolders first */}
            {hasSubfolders && (
              <div className="space-y-1">
                {Array.from(folder.subfolders.values())
                  .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                  .map((subfolder) => renderFolder(subfolder, level + 1))}
              </div>
            )}
            
            {/* Render items in this folder */}
            {hasItems && (
              <div className={cn(
                "grid gap-3",
                "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              )}>
                {folder.items.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "border border-border hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden",
                      selectedItems.includes(item.id) && "ring-2 ring-primary border-primary"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedItems.includes(item.id)) {
                        setSelectedItems(selectedItems.filter((id) => id !== item.id));
                      } else {
                        setSelectedItems([...selectedItems, item.id]);
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                      setPreviewOpen(true);
                    }}
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EGörsel%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {selectedItems.includes(item.id) && (
                        <div className="absolute inset-0 bg-primary/20 border-2 border-primary z-10" />
                      )}
                      {item.aiGenerated && (
                        <Badge
                          variant="default"
                          className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] z-10"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setPreviewOpen(true);
                          }}
                          className="text-white hover:text-white hover:bg-white/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Önizle
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium text-foreground truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.metadata?.size ? formatFileSize(item.metadata.size) : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="border border-border animate-pulse">
            <CardContent className="p-3">
              <div className="aspect-square bg-muted rounded-lg mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
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
    <div className="flex gap-4 h-[calc(100vh-8rem)] overflow-hidden">
      {/* Left Panel - Media Library */}
      <div className={cn(
        "flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        selectedItem ? "w-1/2" : "w-full"
      )}>
        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
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
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Medya ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={aiFilter} onValueChange={(value) => {
                setAiFilter(value as "all" | "ai" | "manual");
                fetchMedia();
              }}>
                <SelectTrigger className="w-[160px]">
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
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value as "date" | "name" | "size" | "usage");
              }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Tarih</SelectItem>
                  <SelectItem value="name">İsim</SelectItem>
                  <SelectItem value="size">Boyut</SelectItem>
                  <SelectItem value="usage">Kullanım</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-9"
                title={sortOrder === "asc" ? "Artan" : "Azalan"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
              <Button
                variant={viewMode === "folders" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("folders");
                  // Expand all folders when switching to folder view
                  setTimeout(() => {
                    const allPaths = new Set<string>();
                    const collectPaths = (folder: FolderStructure) => {
                      if (folder.path) allPaths.add(folder.path);
                      folder.subfolders.forEach((subfolder) => collectPaths(subfolder));
                    };
                    if (folderStructure) {
                      collectPaths(folderStructure);
                      setExpandedFolders(allPaths);
                    }
                  }, 0);
                }}
                className="h-9"
                title="Klasör görünümü"
              >
                <Folder className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9"
                title="Grid görünümü"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9"
                title="Liste görünümü"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowUploadSection(!showUploadSection)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Upload className="h-4 w-4 mr-2" />
                {showUploadSection ? "Yüklemeyi Gizle" : "Yükle"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section - Inline, not modal */}
      {showUploadSection && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Dosya Yükle
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Görselleri yükleyin. Dosya adları otomatik optimize edilir ve SEO için alt text oluşturulur.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadSection(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AdvancedUpload
              onUploadComplete={() => {
                fetchMedia();
                setShowUploadSection(false);
              }}
              locale={locale}
            />
          </CardContent>
        </Card>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="font-medium text-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? 'dosya' : 'dosya'}
          </span>
          {selectedItems.length > 0 && (
            <span className="text-primary">
              {selectedItems.length} seçili
            </span>
          )}
        </div>
        {filteredItems.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span>Toplam boyut:</span>
            <span className="font-medium">
              {formatFileSize(
                filteredItems.reduce((sum, item) => sum + (item.metadata?.size || 0), 0)
              )}
            </span>
          </div>
        )}
      </div>

      {/* Media Grid/List/Folders */}
      {filteredItems.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
              {searchQuery ? "Medya bulunamadı" : "Henüz medya yok"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? "Arama kriterlerinizi değiştirmeyi deneyin" 
                : "İlk medyanızı yüklemek için 'Yükle' butonuna tıklayın"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowUploadSection(true)} className="bg-primary">
                <Upload className="h-4 w-4 mr-2" />
                İlk Medyayı Yükle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "folders" ? (
        <div className="space-y-4">
          {folderStructure.subfolders.size === 0 && folderStructure.items.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">
                  Klasör yapısı bulunamadı
                </p>
                <p className="text-sm text-muted-foreground">
                  Görseller klasör yapısına göre organize edilecek
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Root level items if any */}
                  {folderStructure.items.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Kök Klasör
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {folderStructure.items.map((item) => (
                          <Card
                            key={item.id}
                            className={cn(
                              "border border-border hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden",
                              selectedItems.includes(item.id) && "ring-2 ring-primary"
                            )}
                            onClick={() => {
                              if (selectedItems.includes(item.id)) {
                                setSelectedItems(selectedItems.filter((id) => id !== item.id));
                              } else {
                                setSelectedItems([...selectedItems, item.id]);
                              }
                            }}
                            onDoubleClick={() => {
                              setSelectedItem(item);
                              setPreviewOpen(true);
                            }}
                          >
                            <div className="relative aspect-square bg-muted overflow-hidden">
                              {item.url ? (
                                <img
                                  src={item.url}
                                  alt={item.altText || item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              {selectedItems.includes(item.id) && (
                                <div className="absolute inset-0 bg-primary/20 border-2 border-primary" />
                              )}
                            </div>
                            <CardContent className="p-2">
                              <p className="text-xs font-medium text-foreground truncate" title={item.name}>
                                {item.name}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Render all subfolders */}
                  {Array.from(folderStructure.subfolders.values())
                    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                    .map((subfolder) => renderFolder(subfolder, 0))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "border border-border hover:border-primary/50 cursor-pointer group relative transition-all",
                selectedItems.includes(item.id) && "ring-2 ring-primary"
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
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                  {item.metadata?.mimetype?.startsWith("image/") && item.url ? (
                    <img
                      src={item.url}
                      alt={item.altText || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      {getFileIcon(item.metadata?.mimetype)}
                    </div>
                  )}
                  {item.aiGenerated && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      AI
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 hover:bg-white text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground truncate mb-1" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(item.metadata?.size)}
                  </p>
                  {item.usageCount !== undefined && item.usageCount > 0 && (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      {item.usageCount}x
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setPreviewOpen(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.metadata?.mimetype?.startsWith("image/") && item.url ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-muted-foreground">
                          {getFileIcon(item.metadata?.mimetype)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        {item.aiGenerated && (
                          <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                        {item.usageCount !== undefined && item.usageCount > 0 && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                            {item.usageCount}x
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.metadata?.size)} •{" "}
                        {new Date(item.created_at).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
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
                        title="URL'yi Kopyala"
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
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Sil"
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
        </div>
      </div>

      {/* Optimizer Dialog */}
      {selectedItem && selectedItem.metadata?.mimetype?.startsWith("image/") && (
        <Dialog open={optimizerOpen} onOpenChange={setOptimizerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Görsel Optimizasyonu</DialogTitle>
              <DialogDescription>
                Görseli optimize edin ve boyutunu küçültün
              </DialogDescription>
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

      {/* Right Panel - Inline Preview - Redesigned Layout */}
      {selectedItem && (
        <div className={cn(
          "w-1/2 border-l border-border bg-card flex flex-col transition-all duration-300 ease-in-out",
          "lg:block hidden" // Desktop'ta göster, mobilde gizle
        )}>
          {/* Header with controls */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {filteredItems.length > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id);
                      const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
                      setSelectedItem(filteredItems[prevIndex]);
                    }}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {filteredItems.findIndex(item => item.id === selectedItem.id) + 1} / {filteredItems.length}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id);
                      const nextIndex = (currentIndex + 1) % filteredItems.length;
                      setSelectedItem(filteredItems[nextIndex]);
                    }}
                    className="h-8 w-8"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{selectedItem.name}</h3>
              </div>
              {selectedItem.aiGenerated && (
                <Badge variant="default" className="bg-primary shrink-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            
            {/* Zoom controls */}
            {selectedItem.metadata?.mimetype?.startsWith("image/") && (
              <div className="flex items-center gap-2 px-4 border-x border-border">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}
                  className="h-8 w-8"
                  title="Yakınlaştır (-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium text-foreground min-w-12 text-center">
                  {zoomLevel}%
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setZoomLevel(prev => Math.min(500, prev + 25))}
                  className="h-8 w-8"
                  title="Uzaklaştır (+)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setZoomLevel(100);
                    setImagePosition({ x: 0, y: 0 });
                  }}
                  className="h-8 w-8"
                  title="Sıfırla (0)"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setSelectedItem(null);
                  setPreviewOpen(false);
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main content area - NEW LAYOUT: Image on top, details below */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Image preview area - Full width, single row */}
            <div className="w-full h-[60%] overflow-auto bg-muted/30 flex items-center justify-center relative border-b border-border">
              {selectedItem.metadata?.mimetype?.startsWith("image/") && selectedItem.url ? (
                <div
                  ref={imageContainerRef}
                  className="w-full h-full overflow-hidden relative cursor-move p-4"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: zoomLevel > 100 ? (isDragging ? "grabbing" : "grab") : "default" }}
                >
                  <img
                    ref={imageRef}
                    src={selectedItem.url}
                    alt={selectedItem.altText || selectedItem.name}
                    className={cn(
                      "transition-transform duration-200 origin-center max-w-full max-h-full object-contain",
                      zoomLevel > 100 && "select-none"
                    )}
                    style={{
                      transform: `scale(${zoomLevel / 100}) translate(${imagePosition.x / (zoomLevel / 100)}px, ${imagePosition.y / (zoomLevel / 100)}px)`,
                    }}
                    draggable={false}
                  />
                  {zoomLevel > 100 && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Move className="h-3 w-3" />
                      Sürükleyerek hareket ettirin
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  {getFileIcon(selectedItem.metadata?.mimetype)}
                </div>
              )}
            </div>

            {/* Details/Metadata/Actions - Below image */}
            <div className="flex-1 overflow-y-auto bg-card">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full rounded-none border-b border-border sticky top-0 bg-card z-10">
                  <TabsTrigger value="details" className="flex-1">Detaylar</TabsTrigger>
                  <TabsTrigger value="metadata" className="flex-1">Metadata</TabsTrigger>
                  <TabsTrigger value="actions" className="flex-1">İşlemler</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="p-4 space-y-4 m-0">
                  {/* AI SEO Optimization Button */}
                  {selectedItem.metadata?.mimetype?.startsWith("image/") && (
                    <div className="flex gap-2 mb-4">
                      <Button
                        onClick={handleAISEOOptimize}
                        disabled={isOptimizingSEO}
                        className="flex-1 bg-primary hover:bg-primary/90"
                        variant="default"
                      >
                        {isOptimizingSEO ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Optimize Ediliyor...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI ile SEO Uyumlu Yap
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleAutoOptimize}
                        disabled={isAutoOptimizing}
                        variant="outline"
                        className="flex-1"
                      >
                        {isAutoOptimizing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Optimize Ediliyor...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Otomatik Optimize Et
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Dosya Adı
                    </label>
                    {isEditingMetadata ? (
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground break-words">{selectedItem.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Alt Text
                      </label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (isEditingMetadata) {
                            handleSaveMetadata();
                          } else {
                            setIsEditingMetadata(true);
                          }
                        }}
                        className="h-6 text-xs"
                      >
                        {isEditingMetadata ? (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            Kaydet
                          </>
                        ) : (
                          <>
                            <Edit2 className="h-3 w-3 mr-1" />
                            Düzenle
                          </>
                        )}
                      </Button>
                    </div>
                    {isEditingMetadata ? (
                      <Textarea
                        value={editedAltText}
                        onChange={(e) => setEditedAltText(e.target.value)}
                        placeholder="Alt text girin..."
                        className="text-sm min-h-[80px]"
                      />
                    ) : (
                      <p className="text-sm text-foreground break-words">
                        {selectedItem.altText || "Alt text yok"}
                      </p>
                    )}
                  </div>

                    {selectedItem.width && selectedItem.height && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Genişlik</p>
                          <p className="text-sm text-foreground">{selectedItem.width}px</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Yükseklik</p>
                          <p className="text-sm text-foreground">{selectedItem.height}px</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="p-4 space-y-4 m-0">
                    <div className="grid grid-cols-2 gap-3">
                      {selectedItem.metadata?.size && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Dosya Boyutu</p>
                          <p className="text-sm text-foreground">{formatFileSize(selectedItem.metadata.size)}</p>
                        </div>
                      )}
                      {selectedItem.usageCount !== undefined && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Kullanım</p>
                          <p className="text-sm text-foreground">{selectedItem.usageCount} kez</p>
                        </div>
                      )}
                      {selectedItem.created_at && (
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Oluşturulma</p>
                          <p className="text-sm text-foreground">
                            {new Date(selectedItem.created_at).toLocaleString("tr-TR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      )}
                      {selectedItem.generationCost !== undefined && selectedItem.generationCost > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Maliyet</p>
                          <p className="text-sm text-foreground">${selectedItem.generationCost.toFixed(4)}</p>
                        </div>
                      )}
                      {selectedItem.cloudinaryPublicId && (
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Cloudinary ID</p>
                          <p className="text-xs font-mono break-all text-foreground bg-muted p-2 rounded border border-border">
                            {selectedItem.cloudinaryPublicId}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="p-4 space-y-2 m-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedItem.url) handleCopyUrl(selectedItem.url);
                      }}
                      className="w-full justify-start"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      URL'yi Kopyala
                    </Button>
                    {selectedItem.url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedItem.url, "_blank")}
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Yeni Sekmede Aç
                      </Button>
                    )}
                    {selectedItem.metadata?.mimetype?.startsWith("image/") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOptimizerOpen(true);
                        }}
                        className="w-full justify-start"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Optimize Et
                      </Button>
                    )}
                    {selectedItem.source !== "media_assets" && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDelete(selectedItem);
                          setPreviewOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </Button>
                    )}
                    <div className="pt-4 border-t border-border mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Klavye Kısayolları</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Önceki/Sonraki:</span>
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">← →</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Yakınlaştır/Uzaklaştır:</span>
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">+ -</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Sıfırla:</span>
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">0</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Tam Ekran:</span>
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">F</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Kapat:</span>
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">ESC</kbd>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Preview - Overlay Dialog */}
      {selectedItem && typeof window !== "undefined" && (
        <Dialog open={previewOpen && window.innerWidth < 1024} onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
            setPreviewOpen(false);
          }
        }}>
          <DialogContent className="max-w-7xl w-full p-0 gap-0 h-[90vh]">
            {/* Same preview content as desktop but in dialog for mobile */}
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {filteredItems.length > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id);
                          const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
                          setSelectedItem(filteredItems[prevIndex]);
                        }}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground px-2">
                        {filteredItems.findIndex(item => item.id === selectedItem.id) + 1} / {filteredItems.length}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id);
                          const nextIndex = (currentIndex + 1) % filteredItems.length;
                          setSelectedItem(filteredItems[nextIndex]);
                        }}
                        className="h-8 w-8"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-foreground truncate">{selectedItem.name}</DialogTitle>
                  </div>
                  {selectedItem.aiGenerated && (
                    <Badge variant="default" className="bg-primary shrink-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setSelectedItem(null);
                    setPreviewOpen(false);
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Content - Same as desktop */}
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center relative">
                  {selectedItem.metadata?.mimetype?.startsWith("image/") && selectedItem.url ? (
                    <div
                      ref={imageContainerRef}
                      className="w-full h-full overflow-hidden relative cursor-move p-4"
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{ cursor: zoomLevel > 100 ? (isDragging ? "grabbing" : "grab") : "default" }}
                    >
                      <img
                        ref={imageRef}
                        src={selectedItem.url}
                        alt={selectedItem.altText || selectedItem.name}
                        className={cn(
                          "transition-transform duration-200 origin-center max-w-full max-h-full",
                          zoomLevel > 100 && "select-none"
                        )}
                        style={{
                          transform: `scale(${zoomLevel / 100}) translate(${imagePosition.x / (zoomLevel / 100)}px, ${imagePosition.y / (zoomLevel / 100)}px)`,
                        }}
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                      {getFileIcon(selectedItem.metadata?.mimetype)}
                    </div>
                  )}
                </div>
                <div className="w-80 border-l border-border bg-card overflow-y-auto shrink-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full rounded-none border-b border-border">
                      <TabsTrigger value="details" className="flex-1">Detaylar</TabsTrigger>
                      <TabsTrigger value="metadata" className="flex-1">Metadata</TabsTrigger>
                      <TabsTrigger value="actions" className="flex-1">İşlemler</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="p-4 space-y-4 m-0">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Dosya Adı
                        </label>
                        {isEditingMetadata ? (
                          <Input
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-sm text-foreground break-words">{selectedItem.name}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Alt Text
                          </label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (isEditingMetadata) {
                                handleSaveMetadata();
                              } else {
                                setIsEditingMetadata(true);
                              }
                            }}
                            className="h-6 text-xs"
                          >
                            {isEditingMetadata ? (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                Kaydet
                              </>
                            ) : (
                              <>
                                <Edit2 className="h-3 w-3 mr-1" />
                                Düzenle
                              </>
                            )}
                          </Button>
                        </div>
                        {isEditingMetadata ? (
                          <Textarea
                            value={editedAltText}
                            onChange={(e) => setEditedAltText(e.target.value)}
                            placeholder="Alt text girin..."
                            className="text-sm min-h-[80px]"
                          />
                        ) : (
                          <p className="text-sm text-foreground break-words">
                            {selectedItem.altText || "Alt text yok"}
                          </p>
                        )}
                      </div>
                      {selectedItem.width && selectedItem.height && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Genişlik</p>
                            <p className="text-sm text-foreground">{selectedItem.width}px</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Yükseklik</p>
                            <p className="text-sm text-foreground">{selectedItem.height}px</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="metadata" className="p-4 space-y-4 m-0">
                      <div className="grid grid-cols-2 gap-3">
                        {selectedItem.metadata?.size && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Dosya Boyutu</p>
                            <p className="text-sm text-foreground">{formatFileSize(selectedItem.metadata.size)}</p>
                          </div>
                        )}
                        {selectedItem.usageCount !== undefined && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Kullanım</p>
                            <p className="text-sm text-foreground">{selectedItem.usageCount} kez</p>
                          </div>
                        )}
                        {selectedItem.created_at && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Oluşturulma</p>
                            <p className="text-sm text-foreground">
                              {new Date(selectedItem.created_at).toLocaleString("tr-TR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        )}
                        {selectedItem.generationCost !== undefined && selectedItem.generationCost > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Maliyet</p>
                            <p className="text-sm text-foreground">${selectedItem.generationCost.toFixed(4)}</p>
                          </div>
                        )}
                        {selectedItem.cloudinaryPublicId && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Cloudinary ID</p>
                            <p className="text-xs font-mono break-all text-foreground bg-muted p-2 rounded border border-border">
                              {selectedItem.cloudinaryPublicId}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="actions" className="p-4 space-y-2 m-0">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (selectedItem.url) handleCopyUrl(selectedItem.url);
                        }}
                        className="w-full justify-start"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        URL'yi Kopyala
                      </Button>
                      {selectedItem.url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedItem.url, "_blank")}
                          className="w-full justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Yeni Sekmede Aç
                        </Button>
                      )}
                      {selectedItem.metadata?.mimetype?.startsWith("image/") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setOptimizerOpen(true);
                          }}
                          className="w-full justify-start"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Optimize Et
                        </Button>
                      )}
                      {selectedItem.source !== "media_assets" && (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDelete(selectedItem);
                            setSelectedItem(null);
                            setPreviewOpen(false);
                          }}
                          className="w-full justify-start"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

          {/* Upload Section - Inline, not modal */}
          {showUploadSection && (
            <Card className="mb-6 border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Dosya Yükle
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Görselleri yükleyin. Dosya adları otomatik optimize edilir ve SEO için alt text oluşturulur.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadSection(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdvancedUpload
                  onUploadComplete={() => {
                    fetchMedia();
                    setShowUploadSection(false);
                  }}
                  locale={locale}
                />
              </CardContent>
            </Card>
          )}

      {/* Optimizer Dialog */}
      {selectedItem && selectedItem.metadata?.mimetype?.startsWith("image/") && (
        <Dialog open={optimizerOpen} onOpenChange={setOptimizerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Görsel Optimizasyonu</DialogTitle>
              <DialogDescription>
                Görseli optimize edin ve boyutunu küçültün
              </DialogDescription>
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

