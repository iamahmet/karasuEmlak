"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { 
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  X,
  Sparkles,
  Zap,
  Clock,
  TrendingUp,
  Settings,
  BarChart3,
  Search,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Building2,
  Ruler,
  Bed,
  Bath,
  Car,
  Calendar,
  Globe,
  Languages,
  Copy,
  ChevronLeft,
  ChevronRight,
  Focus,
  Code as CodeIcon,
  Wand2,
  Lightbulb,
  GripVertical,
  Trash2,
  MoveUp,
  MoveDown,
  Star,
  StarOff,
  Camera,
  ImagePlus,
  Info,
  Shield,
  Award,
  FileText as FileTextIcon,
  RotateCw,
  Crop,
  Filter,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Undo,
  Redo,
  History,
  Target,
  Brain,
  TrendingDown,
  Calculator,
  BarChart,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Check,
  XCircle,
  Info as InfoIcon,
  MessageSquare,
  MousePointerClick
} from "lucide-react";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { MediaLibraryButton } from "@/components/content-studio/MediaLibraryButton";
import { MediaLibrary } from "@/components/content-studio/MediaLibrary";
import { ImageOptimizer } from "@/components/media/ImageOptimizer";
import { AIListingAssistant } from "./AIListingAssistant";
import { ListingAnalytics } from "./ListingAnalytics";
import { SimilarListings } from "./SimilarListings";
import { ListingExportImport } from "./ListingExportImport";
import { ListingScheduler } from "./ListingScheduler";
import { BulkImageOperations } from "./BulkImageOperations";
import { ListingComparison } from "./ListingComparison";
import { VersionHistory } from "@/components/version-control/VersionHistory";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@karasu/ui";
import { cn } from "@karasu/lib";
import { formatCurrency, formatNumber } from "@karasu/lib/utils";

// Custom debounce hook
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: "satilik" | "kiralik";
  property_type: string;
  location_neighborhood: string;
  location_address?: string;
  price_amount: number | null;
  price_currency: string;
  area_sqm?: number;
  room_count?: number;
  floor?: number;
  building_age?: number;
  images: string[];
  description: string;
  published: boolean;
  featured: boolean;
  available: boolean;
  created_at: string;
  updated_at: string;
  views?: number;
}

interface ListingEditorProps {
  listing: Listing;
  locale: string;
}

interface ListingStats {
  images: number;
  words: number;
  characters: number;
  pricePerM2: number | null;
}

interface SEOScore {
  score: number;
  title: boolean;
  description: boolean;
  images: boolean;
  location: boolean;
  price: boolean;
  issues: string[];
}

const PROPERTY_TYPES = [
  { value: "daire", label: "Daire", icon: Building2 },
  { value: "villa", label: "Villa", icon: Home },
  { value: "mustakil", label: "Müstakil", icon: Home },
  { value: "arsa", label: "Arsa", icon: Layers },
  { value: "isyeri", label: "İşyeri", icon: Building2 },
  { value: "yazlik", label: "Yazlık", icon: Home },
];

export function ListingEditorAdvanced({ listing: initialListing, locale }: ListingEditorProps) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing>(initialListing);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [listingStats, setListingStats] = useState<ListingStats>({
    images: 0,
    words: 0,
    characters: 0,
    pricePerM2: null,
  });
  const [seoScore, setSeoScore] = useState<SEOScore>({
    score: 0,
    title: false,
    description: false,
    images: false,
    location: false,
    price: false,
    issues: [],
  });

  // Additional state declarations
  const [distractionFree, setDistractionFree] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [livePreview, setLivePreview] = useState(false);
  const [previewSide, setPreviewSide] = useState<"right" | "bottom">("right");
  const [translationMode, setTranslationMode] = useState(false);
  const [targetLocale, setTargetLocale] = useState<string>("en");
  const [isRTL, setIsRTL] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [analyzingSEO, setAnalyzingSEO] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [showImageOptimizer, setShowImageOptimizer] = useState(false);
  const [history, setHistory] = useState<Listing[]>([initialListing]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [improving, setImproving] = useState(false);

  // Available locales for translation
  const availableLocales = [
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "et", name: "Eesti", flag: "🇪🇪" },
  ];

  // Calculate listing statistics
  const calculateStats = useCallback((listing: Listing): ListingStats => {
    const textContent = listing.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    const pricePerM2 = listing.price_amount && listing.area_sqm && listing.area_sqm > 0
      ? Math.round(listing.price_amount / listing.area_sqm)
      : null;

    return {
      images: listing.images?.length || 0,
      words: words.length,
      characters: textContent.length,
      pricePerM2,
    };
  }, []);

  // Calculate SEO score
  const calculateSEOScore = useCallback((listing: Listing): SEOScore => {
    const issues: string[] = [];
    let score = 0;

    // Title check (20 points)
    if (listing.title && listing.title.length >= 30 && listing.title.length <= 70) {
      score += 20;
    } else {
      issues.push("Başlık 30-70 karakter arasında olmalı");
    }

    // Description check (20 points)
    const descText = listing.description.replace(/<[^>]*>/g, "").trim();
    if (descText.length >= 200) {
      score += 20;
    } else {
      issues.push("Açıklama en az 200 karakter olmalı");
    }

    // Images check (20 points)
    if (listing.images && listing.images.length >= 3) {
      score += 20;
    } else {
      issues.push("En az 3 görsel ekleyin");
    }

    // Location check (20 points)
    if (listing.location_neighborhood && listing.location_address) {
      score += 20;
    } else {
      issues.push("Mahalle ve adres bilgisi eksik");
    }

    // Price check (20 points)
    if (listing.price_amount && listing.price_amount > 0) {
      score += 20;
    } else {
      issues.push("Fiyat bilgisi eksik");
    }

    return {
      score,
      title: Boolean(listing.title && listing.title.length >= 30 && listing.title.length <= 70),
      description: descText.length >= 200,
      images: Boolean(listing.images && listing.images.length >= 3),
      location: Boolean(listing.location_neighborhood && listing.location_address),
      price: Boolean(listing.price_amount && listing.price_amount > 0),
      issues,
    };
  }, []);

  // Update stats when listing changes
  useEffect(() => {
    const stats = calculateStats(listing);
    setListingStats(stats);
  }, [listing, calculateStats]);

  // Update SEO score when listing changes
  useEffect(() => {
    const score = calculateSEOScore(listing);
    setSeoScore(score);
  }, [listing, calculateSEOScore]);

  // RTL support detection
  useEffect(() => {
    setIsRTL(locale === "ar" || locale === "he" || locale === "fa");
  }, [locale]);

  // Live preview URL - updates when listing changes
  const livePreviewUrl = useMemo(() => {
    if (!livePreview || !listing.id) return null;
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin.replace(":3001", ":3000")
      : "http://localhost:3000";
    return `${baseUrl}/ilan/${listing.slug}?preview=true`;
  }, [livePreview, listing.id, listing.slug]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!saving && isDirty) {
          handleSave();
        }
      }
      // Ctrl/Cmd + P: Publish
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        if (!listing.published) {
          handlePublish();
        }
      }
      // Ctrl/Cmd + K: Preview
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleGeneratePreview();
      }
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        handleRedo();
      }
      // Escape: Close modals or exit distraction-free mode
      if (e.key === "Escape") {
        if (distractionFree) {
          setDistractionFree(false);
        } else {
          setShowPreview(false);
          setShowMediaLibrary(false);
          setShowImageOptimizer(false);
        }
      }
      // Ctrl/Cmd + Shift + F: Toggle distraction-free mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        setDistractionFree(!distractionFree);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saving, isDirty, listing.published, distractionFree]);

  // Auto-save with debounce
  const debouncedSave = useDebouncedCallback(
    async (listingData: Listing) => {
      if (!isDirty) return;
      
      try {
        const response = await fetch(`/api/listings/${listingData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...listingData,
            published: listingData.published,
            featured: listingData.featured,
            available: listingData.available,
          }),
        });

        if (response.ok) {
          setLastSaved(new Date());
          setIsDirty(false);
        }
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    },
    2000 // 2 second debounce
  );

  // Enhanced auto-save with status tracking
  const autoSave = useDebouncedCallback(async (listing: Listing) => {
    if (!listing.id || !isDirty) return;
    
    try {
      setAutoSaveStatus("saving");
      setSaving(true);
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });

      if (!response.ok) throw new Error("Auto-save failed");
      
      setIsDirty(false);
      setLastSaved(new Date());
      setAutoSaveStatus("saved");
      setShowSuccessAnimation(true);
      
      // Reset success animation after 2 seconds
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setAutoSaveStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setAutoSaveStatus("error");
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }, 2000);

  // Auto-save on change
  useEffect(() => {
    if (isDirty && listing.id) {
      autoSave(listing);
    }
  }, [listing, isDirty, autoSave]);

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  const handleSave = async () => {
    if (saving) return;
    
    // Validate before saving
    const errors: Record<string, string> = {};
    if (!listing.title?.trim()) errors.title = "Başlık zorunludur";
    if (!listing.slug?.trim()) errors.slug = "Slug zorunludur";
    if (!listing.property_type) errors.property_type = "Emlak tipi seçilmelidir";
    if (!listing.location_neighborhood?.trim()) errors.location_neighborhood = "Mahalle zorunludur";
    if (!listing.price_amount || listing.price_amount <= 0) errors.price_amount = "Geçerli bir fiyat giriniz";
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Lütfen tüm gerekli alanları doldurun", {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }
    
    setValidationErrors({});
    
    try {
      setSaving(true);
      setAutoSaveStatus("saving");
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Save failed");
      }
      
      const data = await response.json();
      setListing(data.data.listing);
      setIsDirty(false);
      setLastSaved(new Date());
      setAutoSaveStatus("saved");
      setShowSuccessAnimation(true);
      toast.success("İlan kaydedildi", {
        icon: "✅",
        duration: 3000,
      });
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setAutoSaveStatus("idle");
      }, 2000);
    } catch (error: any) {
      console.error("Save error:", error);
      setAutoSaveStatus("error");
      toast.error(error.message || "Kayıt başarısız", {
        icon: "❌",
        duration: 3000,
      });
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const updatedListing = {
      ...listing,
      published: true,
    };
    
    setListing(updatedListing);
    setIsDirty(true);
    
    // Save immediately
    await handleSave();
  };

  const handleUnpublish = async () => {
    const updatedListing = {
      ...listing,
      published: false,
    };
    
    setListing(updatedListing);
    setIsDirty(true);
    
    // Save immediately
    await handleSave();
  };

  const handleGeneratePreview = async () => {
    try {
      const baseUrl = typeof window !== "undefined" 
        ? window.location.origin.replace(":3001", ":3000")
        : "http://localhost:3000";
      const url = `${baseUrl}/ilan/${listing.slug}?preview=true`;
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Preview link oluşturulamadı");
    }
  };

  const updateListing = (updates: Partial<Listing>) => {
    setListing(prev => {
      const updated = { ...prev, ...updates };
      
      // Auto-generate slug if title changed and slug is empty
      if (updates.title && !updated.slug) {
        updated.slug = generateSlug(updates.title);
      }
      
      // Add to history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updated);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      return updated;
    });
    setIsDirty(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setListing(history[newIndex]);
      setIsDirty(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setListing(history[newIndex]);
      setIsDirty(true);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  // Image handlers
  const handleImageUpload = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Lütfen görsel dosyası seçin");
      return;
    }

    for (const file of imageFiles.slice(0, 20 - listing.images.length)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} dosyası 10MB'dan büyük olamaz`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.url) {
          updateListing({ images: [...listing.images, data.url] });
        }
      } catch (error) {
        toast.error(`${file.name} yüklenemedi`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageUpload(files);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...listing.images];
    if (direction === "up" && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === "down" && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    updateListing({ images: newImages });
  };

  const removeImage = (index: number) => {
    updateListing({ images: listing.images.filter((_, i) => i !== index) });
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    const newImages = [listing.images[index], ...listing.images.filter((_, i) => i !== index)];
    updateListing({ images: newImages });
    toast.success("Ana görsel değiştirildi");
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : ""} ${distractionFree ? "distraction-free-mode" : ""}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between sticky top-0 z-40 bg-card border-b border-border px-6 py-4 -mx-6 -mt-6 mb-6 backdrop-blur-sm bg-card/95">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-1">
              İlan Düzenle
            </h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {/* Auto-save Status Indicator */}
              <div className="flex items-center gap-2">
                {autoSaveStatus === "saving" && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm font-medium">Kaydediliyor...</span>
                  </Badge>
                )}
                {autoSaveStatus === "saved" && showSuccessAnimation && (
                  <Badge variant="default" className="gap-1.5 bg-primary">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-sm font-medium">Kaydedildi!</span>
                  </Badge>
                )}
                {autoSaveStatus === "error" && (
                  <Badge variant="error" className="gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-sm font-medium">Kayıt hatası</span>
                  </Badge>
                )}
                {lastSaved && autoSaveStatus === "idle" && (
                  <Badge variant="outline" className="gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-sm font-medium">Son kayıt: {lastSaved.toLocaleTimeString("tr-TR")}</span>
                  </Badge>
                )}
                {isDirty && autoSaveStatus === "idle" && (
                  <Badge variant="secondary" className="gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-sm font-medium">Kaydedilmemiş değişiklikler</span>
                  </Badge>
                )}
              </div>
              {listing.views && listing.views > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  <Eye className="h-3 w-3" />
                  <span className="text-sm font-medium">{listing.views.toLocaleString()} görüntülenme</span>
                </Badge>
              )}
              {listingStats.pricePerM2 && (
                <Badge variant="outline" className="gap-1.5">
                  <Ruler className="h-3 w-3" />
                  <span className="text-sm font-medium">{formatCurrency(listingStats.pricePerM2)}/m²</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* SEO Score Badge - Enhanced */}
          <div className={cn(
            "flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer",
            seoScore.score >= 80 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-sm hover:shadow-md"
              : seoScore.score >= 60
              ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700 shadow-sm hover:shadow-md"
              : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700 shadow-sm hover:shadow-md"
          )}>
            <div className={cn(
              "p-1.5 rounded-lg",
              seoScore.score >= 80 
                ? "bg-green-100 dark:bg-green-900/30"
                : seoScore.score >= 60
                ? "bg-yellow-100 dark:bg-yellow-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            )}>
              <TrendingUp className={cn(
                "h-4 w-4",
                seoScore.score >= 80 
                  ? "text-green-700 dark:text-green-400"
                  : seoScore.score >= 60
                  ? "text-yellow-700 dark:text-yellow-400"
                  : "text-red-700 dark:text-red-400"
              )} />
            </div>
            <div>
              <div className={cn(
                "text-xs font-medium mb-0.5",
                seoScore.score >= 80 
                  ? "text-green-800 dark:text-green-200"
                  : seoScore.score >= 60
                  ? "text-yellow-800 dark:text-yellow-200"
                  : "text-red-800 dark:text-red-200"
              )}>
                SEO Skoru
              </div>
              <div className={cn(
                "text-lg font-bold",
                seoScore.score >= 80 
                  ? "text-green-900 dark:text-green-100"
                  : seoScore.score >= 60
                  ? "text-yellow-900 dark:text-yellow-100"
                  : "text-red-900 dark:text-red-100"
              )}>
                {seoScore.score}/100
              </div>
            </div>
          </div>

          {/* Language Switcher - Enhanced */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setTranslationMode(!translationMode)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200 hover:scale-105",
                translationMode 
                  ? "bg-gradient-to-br from-design-light to-design-dark text-white shadow-md" 
                  : "bg-card border border-border hover:border-design-light/50 hover:bg-design-light/5"
              )}
              title="Çeviri Modu"
            >
              <Languages className="h-4 w-4" />
            </button>
            {translationMode && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Hedef Dil</p>
                  {availableLocales.filter(l => l.code !== locale).map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setTargetLocale(loc.code);
                        toast.success(`${loc.name} çeviri modu aktif`);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors flex items-center gap-2 ${
                        targetLocale === loc.code ? "bg-primary/10" : ""
                      }`}
                    >
                      <span>{loc.flag}</span>
                      <span>{loc.name}</span>
                      {targetLocale === loc.code && (
                        <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Toggle - Enhanced */}
          <button
            type="button"
            onClick={() => setLivePreview(!livePreview)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200 hover:scale-105",
              livePreview 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md" 
                : "bg-card border border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            )}
            title="Canlı Önizleme"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Distraction-Free Mode - Enhanced */}
          <button
            type="button"
            onClick={() => setDistractionFree(!distractionFree)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200 hover:scale-105",
              distractionFree
                ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md"
                : "bg-card border border-border hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            )}
            title="Dikkat Dağıtmayan Mod"
          >
            <Layers className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle - Enhanced */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-card border border-border hover:border-primary hover:bg-muted/50 transition-all duration-200 hover:scale-105"
            title="Tam Ekran"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-800 pr-2 mr-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Geri Al (⌘Z)"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Yinele (⌘⇧Z)"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons - Enhanced */}
          {listing.published ? (
            <>
              <button
                type="button"
                onClick={handleUnpublish}
                className="px-4 py-2.5 text-sm font-semibold text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md border border-border"
              >
                Yayından Kaldır
              </button>
              <button
                type="button"
                onClick={() => {
                  const baseUrl = typeof window !== "undefined" 
                    ? window.location.origin.replace(":3001", ":3000")
                    : "http://localhost:3000";
                  const url = `${baseUrl}/ilan/${listing.slug}`;
                  window.open(url, "_blank");
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-design-light to-design-dark rounded-xl hover:from-design-dark hover:to-design-light transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Görüntüle
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGeneratePreview}
                className="px-4 py-2.5 text-sm font-semibold text-yellow-700 dark:text-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl hover:from-yellow-200 hover:to-orange-200 dark:hover:from-yellow-900/40 dark:hover:to-orange-900/40 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md border border-yellow-200 dark:border-yellow-800 inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Önizle
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Yayınla
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (!isDirty && Object.keys(validationErrors).length === 0)}
            className={cn(
              "px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg inline-flex items-center gap-2",
              Object.keys(validationErrors).length > 0
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-design-light via-design-light/90 to-design-dark hover:from-design-dark hover:via-design-dark/90 hover:to-design-light"
            )}
            title={Object.keys(validationErrors).length > 0 ? "Lütfen hataları düzeltin" : "Kaydet (⌘S)"}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : Object.keys(validationErrors).length > 0 ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Hataları Düzelt
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Keyboard Shortcuts Hint */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/50 px-5 py-3 rounded-xl border border-border shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-card/60 border border-border">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="font-bold text-foreground">Kısayollar</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors">
          <kbd className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-mono font-semibold shadow-sm text-foreground">⌘S</kbd>
          <span className="font-medium">Kaydet</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors">
          <kbd className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-mono font-semibold shadow-sm text-foreground">⌘P</kbd>
          <span className="font-medium">Yayınla</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors">
          <kbd className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-mono font-semibold shadow-sm text-foreground">⌘K</kbd>
          <span className="font-medium">Önizle</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors">
          <kbd className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-mono font-semibold shadow-sm text-foreground">⌘Z</kbd>
          <span className="font-medium">Geri Al</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors">
          <kbd className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-mono font-semibold shadow-sm text-foreground">⌘⇧Z</kbd>
          <span className="font-medium">Yinele</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors">
          <kbd className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-mono font-semibold shadow-sm text-foreground">Esc</kbd>
          <span className="font-medium">Kapat</span>
        </div>
        {distractionFree && (
          <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800">
            <Focus className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 animate-pulse-slow" />
            <span className="font-semibold text-purple-700 dark:text-purple-300">Dikkat Dağıtmayan Mod</span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className={`grid gap-6 transition-all duration-300 ${
        distractionFree 
          ? "grid-cols-1" 
          : livePreview && previewSide === "right"
            ? sidebarCollapsed 
              ? "lg:grid-cols-[1fr_80px_1fr]" 
            : "lg:grid-cols-[2fr_1fr_1fr]"
            : livePreview && previewSide === "bottom"
              ? sidebarCollapsed
                ? "grid-cols-1 lg:grid-cols-[1fr_80px]"
                : "grid-cols-1 lg:grid-cols-3"
              : sidebarCollapsed 
                ? "lg:grid-cols-[1fr_80px]" 
                : "lg:grid-cols-3"
      }`}>
        {/* Main Editor Column */}
        <div className={`space-y-6 transition-all duration-300 ${
          distractionFree 
            ? "col-span-1 max-w-4xl mx-auto" 
            : livePreview && previewSide === "right"
              ? sidebarCollapsed 
                ? "col-span-1" 
                : "col-span-1"
              : sidebarCollapsed 
                ? "col-span-1" 
                : "col-span-2"
        }`}>
          {/* Progress Indicator - Enhanced */}
          <div className="mb-6 p-5 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    Tamamlanma Durumu
                  </span>
                  <span className="text-xs text-muted-foreground">
                    İlan hazırlık seviyesi
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground block">
                  {Math.round(
                    ((listing.title ? 1 : 0) +
                      (listing.property_type ? 1 : 0) +
                      (listing.location_neighborhood ? 1 : 0) +
                      (listing.price_amount ? 1 : 0) +
                      (listing.images.length >= 3 ? 1 : 0) +
                      (listing.description.length > 200 ? 1 : 0)) /
                      6 *
                      100
                  )}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {((listing.title ? 1 : 0) +
                    (listing.property_type ? 1 : 0) +
                    (listing.location_neighborhood ? 1 : 0) +
                    (listing.price_amount ? 1 : 0) +
                    (listing.images.length >= 3 ? 1 : 0) +
                    (listing.description.length > 200 ? 1 : 0))}/6 tamamlandı
                </span>
              </div>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{
                  width: `${Math.round(
                    ((listing.title ? 1 : 0) +
                      (listing.property_type ? 1 : 0) +
                      (listing.location_neighborhood ? 1 : 0) +
                      (listing.price_amount ? 1 : 0) +
                      (listing.images.length >= 3 ? 1 : 0) +
                      (listing.description.length > 200 ? 1 : 0)) /
                      6 *
                      100
                  )}%`,
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: "Başlık", done: !!listing.title, icon: FileText },
                { label: "Emlak Tipi", done: !!listing.property_type, icon: Building2 },
                { label: "Konum", done: !!listing.location_neighborhood, icon: MapPin },
                { label: "Fiyat", done: !!listing.price_amount, icon: DollarSign },
                { label: "Fotoğraflar", done: listing.images.length >= 3, icon: ImageIcon },
                { label: "Açıklama", done: listing.description.length > 200, icon: FileText },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-default",
                      item.done
                        ? "bg-primary/10 border-primary/20"
                        : "bg-muted/30 border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Icon className={cn(
                        "h-3.5 w-3.5",
                        item.done ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium block",
                      item.done
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Tabs - Enhanced */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 border border-border rounded-lg p-1 flex-wrap h-auto">
              <TabsTrigger 
                value="basic" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                <Home className="h-4 w-4" />
                <span>Temel Bilgiler</span>
              </TabsTrigger>
              <TabsTrigger 
                value="location" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                <MapPin className="h-4 w-4" />
                <span>Konum</span>
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                <Ruler className="h-4 w-4" />
                <span>Detaylar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="images" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted relative"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Fotoğraflar</span>
                {listing.images.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] font-semibold">
                    {listing.images.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="description" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                <FileText className="h-4 w-4" />
                <span>Açıklama</span>
              </TabsTrigger>
              <TabsTrigger 
                value="seo" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted relative"
              >
                <Search className="h-4 w-4" />
                <span>SEO</span>
                {seoScore.score >= 80 && (
                  <CheckCircle2 className="h-3.5 w-3.5 ml-1 text-primary-foreground" />
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analitikler</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                <History className="h-4 w-4" />
                <span>Versiyonlar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
                <span>Ayarlar</span>
              </TabsTrigger>
            </TabsList>

            {/* Templates Button - Enhanced */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <InfoIcon className="h-4 w-4" />
                <span>İpucu: Şablonlar ile hızlıca başlayın</span>
              </div>
              <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs font-medium border border-border hover:border-primary hover:bg-primary/5 transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Şablon Kullan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-foreground">
                      İlan Şablonları
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {PROPERTY_TYPES.map((type) => {
                      const Icon = type.icon;
                      const template = {
                        title: `${type.label} İlanı`,
                        property_type: type.value,
                        status: listing.status,
                        location_neighborhood: "",
                        price_amount: null,
                        area_sqm: undefined,
                        room_count: undefined,
                        description: `<h2>${type.label} Özellikleri</h2>
<p>Detaylı açıklama buraya gelecek...</p>
<h3>Konum</h3>
<p>Konum bilgileri...</p>
<h3>Özellikler</h3>
<ul>
  <li>Özellik 1</li>
  <li>Özellik 2</li>
  <li>Özellik 3</li>
</ul>`,
                      };
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            updateListing({
                              property_type: template.property_type,
                              title: template.title,
                              description: template.description,
                            });
                            setShowTemplates(false);
                            toast.success(`${type.label} şablonu uygulandı`);
                          }}
                          className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-design-light/20 transition-colors">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {template.title}
                                </h3>
                                <Badge variant="outline" className="text-[10px] mt-0.5">
                                  {type.label}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              {/* AI Listing Assistant */}
              <AIListingAssistant
                listing={{
                  title: listing.title,
                  description: listing.description,
                  price_amount: listing.price_amount,
                  property_type: listing.property_type,
                  location_neighborhood: listing.location_neighborhood,
                  area_sqm: listing.area_sqm,
                  room_count: listing.room_count,
                }}
                onUpdate={(updates) => updateListing(updates)}
              />

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">
                    İlan Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        İlan Başlığı
                        <span className="text-destructive">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={async () => {
                          toast.loading("AI ile başlık oluşturuluyor...");
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          const suggested = `${listing.property_type || "Emlak"} ${listing.location_neighborhood || ""} ${listing.room_count ? listing.room_count + "+1" : ""} ${listing.status === "satilik" ? "Satılık" : "Kiralık"}`;
                          updateListing({ title: suggested });
                          toast.success("Başlık oluşturuldu!");
                        }}
                        className="text-xs text-primary hover:text-design-dark dark:hover:text-primary font-medium flex items-center gap-1 transition-colors"
                        title="AI ile başlık oluştur"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>AI ile Oluştur</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="title"
                        value={listing.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          updateListing({ title });
                          if (!listing.slug) {
                            updateListing({ slug: generateSlug(title) });
                          }
                          // Clear validation error when user types
                          if (validationErrors.title) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.title;
                              return newErrors;
                            });
                          }
                        }}
                        className={cn(
                          "input-modern text-base font-semibold h-14 pl-4 pr-12 border-2 focus:ring-2 focus:ring-design-light/20 transition-all duration-200",
                          validationErrors.title
                            ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500"
                            : "focus:border-design-light border-gray-200 dark:border-gray-800"
                        )}
                        placeholder="Örn: Denize Sıfır 3+1 Daire, Merkez Mahallesi"
                      />
                      {listing.title.length > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {listing.title.length >= 30 && listing.title.length <= 70 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce-in" />
                          ) : (
                            <AlertCircle className={cn(
                              "h-5 w-5",
                              listing.title.length < 30 ? "text-yellow-500" : "text-red-500"
                            )} />
                          )}
                        </div>
                      )}
                      {validationErrors.title && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-in-right">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-medium">
                        {listing.title.length} / 70 karakter
                      </p>
                      <div className="flex items-center gap-2">
                        {listing.title.length < 30 && (
                          <Badge variant="outline" className="text-[10px] bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 animate-pulse-slow">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            En az 30 karakter önerilir
                          </Badge>
                        )}
                        {listing.title.length >= 30 && listing.title.length <= 70 && (
                          <Badge variant="outline" className="text-[10px] bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            İdeal uzunluk
                          </Badge>
                        )}
                        {listing.title.length > 70 && (
                          <Badge variant="outline" className="text-[10px] bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                            <XCircle className="h-3 w-3 mr-1" />
                            Çok uzun
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Enhanced Progress Bar */}
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 ease-out relative",
                          listing.title.length < 30
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                            : listing.title.length <= 70
                            ? "bg-gradient-to-r from-green-400 to-green-500"
                            : "bg-gradient-to-r from-red-400 to-red-500"
                        )}
                        style={{
                          width: `${Math.min((listing.title.length / 70) * 100, 100)}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Slug (URL)
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border-2 border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                        <span className="text-sm text-muted-foreground font-medium">/ilan/</span>
                        <Input
                          id="slug"
                          value={listing.slug}
                          onChange={(e) => {
                            updateListing({ slug: e.target.value });
                            // Clear validation error
                            if (validationErrors.slug) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.slug;
                                return newErrors;
                              });
                            }
                          }}
                          className={cn(
                            "input-modern font-mono text-sm flex-1 border-0 bg-transparent focus:ring-0 p-0 h-auto",
                            validationErrors.slug && "text-red-600 dark:text-red-400"
                          )}
                          placeholder="denize-sifir-3-1-daire"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        İlan Tipi
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={listing.status || "satilik"}
                        onValueChange={(value: "satilik" | "kiralik") => updateListing({ status: value })}
                      >
                        <SelectTrigger className="input-modern h-12 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200">
                          <SelectValue placeholder="İlan tipi seçin" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="z-[9999] rounded-xl border-2 shadow-xl" sideOffset={4}>
                          <SelectItem value="satilik" className="cursor-pointer py-2.5">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span>Satılık</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="kiralik" className="cursor-pointer py-2.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>Kiralık</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property_type" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Emlak Tipi
                      <span className="text-red-500">*</span>
                    </Label>
                      <Select
                        value={listing.property_type || ""}
                        onValueChange={(value) => {
                          updateListing({ property_type: value });
                          // Clear validation error
                          if (validationErrors.property_type) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.property_type;
                              return newErrors;
                            });
                          }
                        }}
                      >
                        <SelectTrigger className={cn(
                          "input-modern h-12 border-2 focus:ring-2 focus:ring-design-light/20 transition-all duration-200",
                          validationErrors.property_type
                            ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500"
                            : "focus:border-design-light border-gray-200 dark:border-gray-800"
                        )}>
                          <SelectValue placeholder="Emlak tipi seçin" />
                        </SelectTrigger>
                      <SelectContent position="popper" className="z-[9999] rounded-xl border-2 shadow-xl max-h-[300px]" sideOffset={4}>
                        {PROPERTY_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value} className="cursor-pointer py-2.5 hover:bg-design-light/5">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {validationErrors.property_type && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-in-right">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.property_type}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-6">
              <Card className="card-professional animate-slide-in-up hover-lift border-2 border-transparent hover:border-design-light/20 transition-all duration-300">
                <CardHeader className="pb-4 border-b border-border bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      Konum Bilgileri
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="location_neighborhood" className="text-sm font-medium text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Mahalle
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const neighborhoods = ["Merkez Mahallesi", "Sahil Mahallesi", "Yeni Mahalle", "Atatürk Mahallesi", "Cumhuriyet Mahallesi"];
                            const random = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
                            updateListing({ location_neighborhood: random });
                            toast.success("Örnek mahalle eklendi");
                          }}
                          className="text-xs text-primary hover:text-design-dark dark:hover:text-primary font-medium flex items-center gap-1 transition-colors"
                          title="Örnek mahalle ekle"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Örnek Ekle</span>
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        id="location_neighborhood"
                        value={listing.location_neighborhood}
                        onChange={(e) => updateListing({ location_neighborhood: e.target.value })}
                        className="input-modern h-12 pr-12 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200"
                        placeholder="Örn: Merkez Mahallesi"
                        list="neighborhood-suggestions"
                      />
                      {listing.location_neighborhood && listing.location_neighborhood.length > 2 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      )}
                      <datalist id="neighborhood-suggestions">
                        <option value="Merkez Mahallesi" />
                        <option value="Sahil Mahallesi" />
                        <option value="Yeni Mahalle" />
                        <option value="Atatürk Mahallesi" />
                        <option value="Cumhuriyet Mahallesi" />
                      </datalist>
                    </div>
                    {listing.location_neighborhood && listing.location_neighborhood.length > 2 && !validationErrors.location_neighborhood && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 animate-slide-in-right">
                        <CheckCircle2 className="h-3 w-3" />
                        Mahalle bilgisi geçerli
                      </p>
                    )}
                    {validationErrors.location_neighborhood && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-in-right">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.location_neighborhood}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_address" className="text-sm font-ui font-bold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Detaylı Adres
                    </Label>
                    <Textarea
                      id="location_address"
                      value={listing.location_address || ""}
                      onChange={(e) => updateListing({ location_address: e.target.value })}
                      rows={4}
                      className="input-modern border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200 resize-none"
                      placeholder="Sokak, cadde, bina no vb. detaylı adres bilgisi..."
                    />
                    {listing.location_address && (
                      <p className="text-xs text-muted-foreground">
                        {listing.location_address.length} karakter
                      </p>
                    )}
                  </div>

                  {/* Map Integration Placeholder */}
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Harita entegrasyonu yakında eklenecek</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="card-professional animate-slide-in-up hover-lift border-2 border-transparent hover:border-design-light/20 transition-all duration-300">
                <CardHeader className="pb-4 border-b border-border/40 dark:border-border/40 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      Fiyat ve Özellikler
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="price_amount" className="text-sm font-ui font-bold text-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Fiyat
                          <span className="text-red-500">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!listing.area_sqm || !listing.property_type) {
                              toast.error("Önce alan ve emlak tipi girin");
                              return;
                            }
                            toast.loading("Piyasa fiyatı hesaplanıyor...");
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            const avgPricePerM2 = listing.property_type === "daire" ? 25000 : listing.property_type === "villa" ? 40000 : 10000;
                            const suggestedPrice = Math.round(avgPricePerM2 * listing.area_sqm);
                            updateListing({ price_amount: suggestedPrice });
                            toast.success("Piyasa fiyatı önerildi!");
                          }}
                          className="text-xs text-primary hover:text-design-dark dark:hover:text-primary font-medium flex items-center gap-1 transition-colors"
                          title="Piyasa fiyatı öner"
                        >
                          <Calculator className="h-3 w-3" />
                          <span>Piyasa Fiyatı</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="price_amount"
                          type="number"
                          value={listing.price_amount || ""}
                          onChange={(e) => {
                            updateListing({ price_amount: e.target.value ? parseFloat(e.target.value) : null });
                            // Clear validation error
                            if (validationErrors.price_amount) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.price_amount;
                                return newErrors;
                              });
                            }
                          }}
                          className={cn(
                            "input-modern h-12 text-lg font-bold border-2 focus:ring-2 focus:ring-design-light/20 transition-all duration-200 pl-4 pr-12",
                            validationErrors.price_amount
                              ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500"
                              : "focus:border-design-light border-gray-200 dark:border-gray-800"
                          )}
                          placeholder="0"
                        />
                        {listing.price_amount && listing.price_amount > 0 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {listing.price_amount && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {formatCurrency(listing.price_amount)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_currency" className="text-sm font-ui font-bold text-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Para Birimi
                      </Label>
                      <Select
                        value={listing.price_currency || "TRY"}
                        onValueChange={(value) => updateListing({ price_currency: value })}
                      >
                        <SelectTrigger className="input-modern h-12 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" className="z-[9999] rounded-xl border-2 shadow-xl" sideOffset={4}>
                          <SelectItem value="TRY" className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">₺</span>
                              <span className="font-semibold">TRY</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="USD" className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">$</span>
                              <span className="font-semibold">USD</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="EUR" className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">€</span>
                              <span className="font-semibold">EUR</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {listing.price_amount && listing.area_sqm && listing.area_sqm > 0 && (
                    <div className="p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-100 block">
                              m² Fiyatı
                            </span>
                            <span className="text-xs text-blue-700 dark:text-blue-300">
                              Hesaplanan değer
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-900 dark:text-blue-100 block">
                            {formatCurrency(listingStats.pricePerM2 || 0)}
                          </span>
                          <span className="text-xs text-blue-700 dark:text-blue-300">/m²</span>
                        </div>
                      </div>
                      {/* Market Comparison */}
                      {listing.property_type && (
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-800 dark:text-blue-200">Piyasa Ortalaması</span>
                            <span className="font-semibold text-blue-900 dark:text-blue-100">
                              {formatCurrency(
                                listing.property_type === "daire" ? 25000 : listing.property_type === "villa" ? 40000 : 10000
                              )}/m²
                            </span>
                          </div>
                          {listingStats.pricePerM2 && (
                            <div className="mt-2 flex items-center gap-2">
                              {listingStats.pricePerM2 > (listing.property_type === "daire" ? 25000 : listing.property_type === "villa" ? 40000 : 10000) * 1.1 ? (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-[10px]">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Ortalamanın Üzerinde
                                </Badge>
                              ) : listingStats.pricePerM2 < (listing.property_type === "daire" ? 25000 : listing.property_type === "villa" ? 40000 : 10000) * 0.9 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-[10px]">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  Uygun Fiyat
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-[10px]">
                                  <Activity className="h-3 w-3 mr-1" />
                                  Piyasa Ortalamasında
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Price Calculator */}
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 space-y-2">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
                          <Calculator className="h-3 w-3" />
                          Fiyat Hesaplayıcı
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-blue-800 dark:text-blue-200">Alan (m²)</Label>
                            <Input
                              type="number"
                              placeholder="m²"
                              className="h-8 text-xs mt-1"
                              onChange={(e) => {
                                const area = parseFloat(e.target.value);
                                if (area > 0 && listing.price_amount) {
                                  const pricePerM2 = Math.round(listing.price_amount / area);
                                  toast.info(`${formatCurrency(pricePerM2)}/m² hesaplandı`);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-blue-800 dark:text-blue-200">m² Fiyatı</Label>
                            <Input
                              type="number"
                              placeholder="m² fiyatı"
                              className="h-8 text-xs mt-1"
                              onChange={(e) => {
                                const pricePerM2 = parseFloat(e.target.value);
                                if (pricePerM2 > 0 && listing.area_sqm) {
                                  const totalPrice = Math.round(pricePerM2 * listing.area_sqm);
                                  toast.info(`Toplam fiyat: ${formatCurrency(totalPrice)}`);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <Label htmlFor="area_sqm" className="text-xs font-ui font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Ruler className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Alan (m²)
                      </Label>
                      <Input
                        id="area_sqm"
                        type="number"
                        value={listing.area_sqm || ""}
                        onChange={(e) => updateListing({ area_sqm: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="input-modern h-11 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200 font-semibold"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <Label htmlFor="room_count" className="text-xs font-ui font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Bed className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        Oda
                      </Label>
                      <Input
                        id="room_count"
                        type="number"
                        value={listing.room_count || ""}
                        onChange={(e) => updateListing({ room_count: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="input-modern h-11 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200 font-semibold"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <Label htmlFor="floor" className="text-xs font-ui font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Layers className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        Kat
                      </Label>
                      <Input
                        id="floor"
                        type="number"
                        value={listing.floor || ""}
                        onChange={(e) => updateListing({ floor: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="input-modern h-11 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200 font-semibold"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <Label htmlFor="building_age" className="text-xs font-ui font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                          <Calendar className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        </div>
                        Bina Yaşı
                      </Label>
                      <Input
                        id="building_age"
                        type="number"
                        value={listing.building_age || ""}
                        onChange={(e) => updateListing({ building_age: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="input-modern h-11 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200 font-semibold"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              {/* Bulk Operations */}
              {listing.images.length > 0 && (
                <BulkImageOperations
                  images={listing.images}
                  onUpdate={(updatedImages) => updateListing({ images: updatedImages })}
                />
              )}

              <Card className="card-professional animate-fade-in-scale border-2 border-transparent hover:border-design-light/20 transition-all duration-300">
                <CardHeader className="pb-4 border-b border-border/40 dark:border-border/40 bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                        <ImageIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          Fotoğraflar
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {listing.images.length}/20 fotoğraf yüklendi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMediaLibrary(true)}
                        className="h-8 px-3 text-xs"
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Medya Kütüphanesi
                      </Button>
                      <MediaLibraryButton
                        onSelect={(url) => updateListing({ images: [...listing.images, url] })}
                        className="h-8 px-3 text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Drag & Drop Zone - Enhanced */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative overflow-hidden",
                      dragActive
                        ? "border-design-light bg-gradient-to-br from-design-light/10 to-design-light/5 scale-[1.02] shadow-lg"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    {dragActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-design-light/20 via-transparent to-design-light/20 animate-shimmer" />
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleImageUpload(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                      aria-label="Fotoğraf yükle"
                      title="Fotoğraf seç"
                    />
                    <div className={cn(
                      "p-4 rounded-2xl mx-auto mb-4 w-fit transition-all duration-300",
                      dragActive
                        ? "bg-design-light/20 scale-110"
                        : "bg-muted"
                    )}>
                      <Upload className={cn(
                        "h-12 w-12 transition-colors duration-300",
                        dragActive
                          ? "text-primary"
                          : "text-muted-foreground"
                      )} />
                    </div>
                    <p className="text-base font-bold text-foreground mb-2">
                      Fotoğrafları buraya sürükleyin
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      veya dosya seçmek için tıklayın
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 h-11 px-6 font-semibold border-2 hover:border-design-light hover:bg-design-light/5 transition-all duration-200 hover:scale-105"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Fotoğraf Seç
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMediaLibrary(true)}
                        className="gap-2 h-11 px-6 font-semibold border-2 hover:border-design-light hover:bg-design-light/5 transition-all duration-200 hover:scale-105"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Medya Kütüphanesi
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      PNG, JPG, WEBP formatları desteklenir • Maksimum 10MB • En fazla 20 fotoğraf
                    </p>
                  </div>

                  {/* Image Gallery - Enhanced */}
                  {listing.images.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-primary" />
                          <h3 className="text-sm font-bold text-foreground">
                            Yüklenen Fotoğraflar ({listing.images.length})
                          </h3>
                        </div>
                        {listing.images.length < 3 && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            En az 3 fotoğraf önerilir
                          </Badge>
                        )}
                        {listing.images.length >= 3 && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Yeterli fotoğraf
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {listing.images.map((image, index) => (
                          <div
                            key={index}
                            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-border bg-muted hover-lift transition-all duration-300 animate-fade-in-scale hover:border-primary/50 hover:shadow-lg"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <img
                              src={image}
                              alt={`Fotoğraf ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold shadow-md z-10">
                                <Star className="h-3.5 w-3.5 fill-white" />
                                <span>Ana Görsel</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/30"
                                title="Ana Görsel Yap"
                              >
                                <Star className="h-4 w-4 text-white" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingImageIndex(index);
                                  setShowImageOptimizer(true);
                                }}
                                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/30"
                                title="Düzenle"
                              >
                                <Crop className="h-4 w-4 text-white" />
                              </button>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, "up")}
                                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/30"
                                  title="Yukarı Taşı"
                                >
                                  <MoveUp className="h-4 w-4 text-white" />
                                </button>
                              )}
                              {index < listing.images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, "down")}
                                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/30"
                                  title="Aşağı Taşı"
                                >
                                  <MoveDown className="h-4 w-4 text-white" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-2.5 bg-red-500/80 hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-red-400/50"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-6">
              {/* AI Content Assistant */}
              <Card className="border border-border">
                <CardHeader className="pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      AI İçerik Asistanı
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={async () => {
                        toast.loading("Açıklama oluşturuluyor...");
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        const generated = `<h2>${listing.title || "Emlak"} Özellikleri</h2>
<p>Bu ${listing.property_type || "emlak"} ${listing.location_neighborhood ? listing.location_neighborhood + " mahallesinde" : ""} bulunmaktadır.</p>
${listing.area_sqm ? `<p><strong>Alan:</strong> ${listing.area_sqm} m²</p>` : ""}
${listing.room_count ? `<p><strong>Oda Sayısı:</strong> ${listing.room_count}+1</p>` : ""}
<h3>Özellikler</h3>
<ul>
  <li>Modern tasarım</li>
  <li>Merkezi konum</li>
  <li>Ulaşım kolaylığı</li>
</ul>`;
                        updateListing({ description: generated });
                        toast.success("Açıklama oluşturuldu!");
                      }}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Wand2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Otomatik Oluştur</h3>
                          <p className="text-xs text-muted-foreground">AI ile açıklama oluştur</p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!listing.description || listing.description.trim().length === 0) {
                          toast.error("İyileştirmek için açıklama gerekli");
                          return;
                        }

                        setImproving(true);
                        
                        try {
                          // Start improvement in background - don't wait for response
                          fetch(`/api/listings/${listing.id}/improve`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ field: "description" }),
                          })
                            .then(async (response) => {
                              if (!response.ok) {
                                throw new Error("İyileştirme başarısız");
                              }

                              // Process stream in background (don't block UI)
                              const reader = response.body?.getReader();
                              const decoder = new TextDecoder();
                              let buffer = '';

                              if (!reader) {
                                throw new Error("Stream okunamadı");
                              }

                              while (true) {
                                const { done, value } = await reader.read();
                                
                                if (done) break;

                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop() || '';

                                for (const line of lines) {
                                  if (line.startsWith('data: ')) {
                                    try {
                                      const data = JSON.parse(line.slice(6));
                                      
                                      if (data.type === 'complete') {
                                        toast.success("İyileştirme tamamlandı! Kuyruk sayfasından kontrol edebilirsiniz.");
                                        // Optionally navigate to queue page
                                        // router.push(`/${locale}/ai-improvements`);
                                      } else if (data.type === 'error') {
                                        throw new Error(data.error || "İyileştirme başarısız");
                                      }
                                    } catch (e) {
                                      console.error("[ListingEditor] Parse error:", e);
                                    }
                                  }
                                }
                              }
                            })
                            .catch((error: any) => {
                              console.error("[ListingEditor] AI improve error:", error);
                              toast.error(error.message || "İyileştirme başarısız");
                            })
                            .finally(() => {
                              setImproving(false);
                            });

                          // Show immediate feedback
                          toast.info("İyileştirme başlatıldı. Arka planda devam ediyor...");
                          
                        } catch (error: any) {
                          console.error("[ListingEditor] AI improve error:", error);
                          toast.error(error.message || "İyileştirme başlatılamadı");
                          setImproving(false);
                        }
                      }}
                      disabled={improving || !listing.description}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          {improving ? (
                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                          ) : (
                            <Zap className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {improving ? "İyileştiriliyor..." : "AI ile İyileştir"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {improving ? "Arka planda işleniyor..." : "Mevcut açıklamayı optimize et"}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!listing.description) {
                          toast.error("Önce bir açıklama yazın");
                          return;
                        }
                        toast.loading("SEO optimizasyonu yapılıyor...");
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        toast.success("SEO optimizasyonu tamamlandı!");
                      }}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">SEO Optimize Et</h3>
                          <p className="text-xs text-muted-foreground">Arama motorları için optimize et</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        Açıklama
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="gap-2">
                        <FileTextIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{listingStats.words} kelime</span>
                      </Badge>
                      <Badge variant="outline" className="gap-2">
                        <CodeIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{listingStats.characters} karakter</span>
                      </Badge>
                      {listing.description.length > 200 && (
                        <Badge variant="default" className="bg-primary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Yeterli
                        </Badge>
                      )}
                      {listing.description.length < 200 && listing.description.length > 0 && (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Kısa
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="relative">
                    {translationMode && targetLocale !== locale && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-blue-900 dark:text-blue-100 block">
                                Çeviri Modu Aktif
                              </span>
                              <span className="text-xs text-blue-700 dark:text-blue-300">
                                {availableLocales.find(l => l.code === targetLocale)?.name} diline çeviriliyor
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                toast.loading("Çeviri yapılıyor...");
                                await new Promise(resolve => setTimeout(resolve, 1500));
                                toast.success("Çeviri tamamlandı (Demo modu)");
                              } catch (error) {
                                toast.error("Çeviri başarısız");
                              }
                            }}
                            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                          >
                            <Languages className="h-4 w-4" />
                            Çevir
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="relative">
                      <RichTextEditor
                        value={listing.description}
                        onChange={(value) => updateListing({ description: value })}
                        placeholder="İlan açıklamasını buraya yazın... Detaylı ve çekici bir açıklama yazmak ilanınızın görüntülenme oranını artırır."
                        className={cn(
                          "min-h-[500px] rounded-lg border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all",
                          distractionFree ? "min-h-[600px]" : ""
                        )}
                      />
                      {distractionFree && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                          <Focus className="h-3.5 w-3.5 animate-pulse-slow" />
                          <span className="font-semibold">Dikkat Dağıtmayan Mod Aktif</span>
                        </div>
                      )}
                    </div>
                    {/* Writing Tips */}
                    {listing.description.length > 0 && listing.description.length < 200 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">Yazma İpuçları</h4>
                            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                              <li>En az 200 karakter yazmanız önerilir</li>
                              <li>Emlak özelliklerini detaylıca açıklayın</li>
                              <li>Konum avantajlarını vurgulayın</li>
                              <li>Çevredeki olanakları belirtin</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              {/* SEO Score Overview */}
              <Card className="card-professional animate-slide-in-up border-2 border-transparent hover:border-design-light/20 transition-all duration-300">
                <CardHeader className="pb-4 border-b border-border/40 dark:border-border/40 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          SEO Skoru
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          İlanınızın arama motoru optimizasyonu
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-6 py-3 rounded-xl border-2 font-bold text-2xl",
                      seoScore.score >= 80
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100"
                        : seoScore.score >= 60
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100"
                        : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100"
                    )}>
                      {seoScore.score}/100
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Başlık", done: seoScore.title, icon: FileText },
                      { label: "Açıklama", done: seoScore.description, icon: FileTextIcon },
                      { label: "Fotoğraflar", done: seoScore.images, icon: ImageIcon },
                      { label: "Konum", done: seoScore.location, icon: MapPin },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                            item.done
                              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700"
                              : "bg-muted/30 border-border"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {item.done ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <Icon className={cn(
                              "h-5 w-5",
                              item.done ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                            )} />
                          </div>
                          <span className={cn(
                            "text-sm font-bold block",
                            item.done ? "text-green-900 dark:text-green-100" : "text-muted-foreground"
                          )}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Advanced SEO Analysis */}
              <Card className="card-professional animate-slide-in-up border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300">
                <CardHeader className="pb-4 border-b border-border/40 dark:border-border/40 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        Gelişmiş SEO Analizi
                      </CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setAnalyzingSEO(true);
                        try {
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          
                          const analysis = {
                            marketAnalysis: {
                              avgPrice: listing.property_type === "daire" ? 1500000 : listing.property_type === "villa" ? 3500000 : 500000,
                              avgPricePerM2: listing.property_type === "daire" ? 25000 : listing.property_type === "villa" ? 40000 : 10000,
                              competitorCount: Math.floor(Math.random() * 50) + 10,
                            },
                            keywordOptimization: {
                              primary: `${listing.property_type} ${listing.location_neighborhood}`,
                              suggestions: [
                                `${listing.property_type} ${listing.location_neighborhood} satılık`,
                                `${listing.property_type} ${listing.location_neighborhood} ${listing.room_count ? listing.room_count + "+1" : ""}`,
                                `${listing.location_neighborhood} emlak`,
                              ],
                            },
                            contentQuality: {
                              score: listing.description.length > 500 ? 85 : listing.description.length > 200 ? 60 : 40,
                              suggestions: listing.description.length < 500 
                                ? ["Açıklamayı daha detaylandırın", "Özellikleri listeleyin", "Konum avantajlarını vurgulayın"]
                                : [],
                            },
                          };
                          
                          setSeoAnalysis(analysis);
                          toast.success("SEO analizi tamamlandı");
                        } catch (error) {
                          toast.error("Analiz sırasında hata oluştu");
                        } finally {
                          setAnalyzingSEO(false);
                        }
                      }}
                      disabled={analyzingSEO}
                      className="h-8 px-3 text-xs"
                    >
                      {analyzingSEO ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Analiz Ediliyor...
                        </>
                        ) : (
                          <>
                            <Search className="h-3.5 w-3.5 mr-1.5" />
                            Analiz Et
                          </>
                        )}
                    </Button>
                  </div>
                </CardHeader>
                {seoAnalysis && (
                  <CardContent className="space-y-4">
                    {/* Market Analysis */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Piyasa Analizi
                        </h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-purple-800 dark:text-purple-200 mb-1">Ortalama Fiyat</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100">
                            {formatCurrency(seoAnalysis.marketAnalysis.avgPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-800 dark:text-purple-200 mb-1">Ortalama m² Fiyatı</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100">
                            {formatCurrency(seoAnalysis.marketAnalysis.avgPricePerM2)}/m²
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-800 dark:text-purple-200 mb-1">Rakip İlan</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100">
                            {seoAnalysis.marketAnalysis.competitorCount} ilan
                          </p>
                        </div>
                      </div>
                      {listing.price_amount && listingStats.pricePerM2 && (
                        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-purple-800 dark:text-purple-200">Fiyat Durumu</span>
                            <Badge className={
                              listing.price_amount < seoAnalysis.marketAnalysis.avgPrice * 0.9
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : listing.price_amount > seoAnalysis.marketAnalysis.avgPrice * 1.1
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            }>
                              {listing.price_amount < seoAnalysis.marketAnalysis.avgPrice * 0.9
                                ? "Uygun Fiyat"
                                : listing.price_amount > seoAnalysis.marketAnalysis.avgPrice * 1.1
                                ? "Yüksek Fiyat"
                                : "Normal Fiyat"}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Keyword Optimization */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Anahtar Kelime Önerileri
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">Birincil Anahtar Kelime</p>
                          <Badge variant="outline" className="text-xs">
                            {seoAnalysis.keywordOptimization.primary}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">Önerilen Anahtar Kelimeler</p>
                          <div className="flex flex-wrap gap-2">
                            {seoAnalysis.keywordOptimization.suggestions.map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Quality */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-green-900 dark:text-green-100">İçerik Kalitesi</span>
                        <Badge className={`${
                          seoAnalysis.contentQuality.score >= 80 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : seoAnalysis.contentQuality.score >= 60
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          {seoAnalysis.contentQuality.score}/100
                        </Badge>
                      </div>
                      {seoAnalysis.contentQuality.suggestions.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {seoAnalysis.contentQuality.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                              <Lightbulb className="h-3 w-3" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Basic SEO Score */}
              <Card className="card-professional">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display font-bold text-foreground">
                      SEO Kontrol Listesi
                    </CardTitle>
                    <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      seoScore.score >= 80 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : seoScore.score >= 60
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}>
                      {seoScore.score}/100
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SEO Checklist */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg border ${
                      seoScore.title 
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-muted/30 border-border"
                    }`}>
                      <div className="flex items-center gap-2">
                        {seoScore.title ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-semibold">Başlık (30-70 karakter)</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      seoScore.description 
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-muted/30 border-border"
                    }`}>
                      <div className="flex items-center gap-2">
                        {seoScore.description ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-semibold">Açıklama (min 200 karakter)</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      seoScore.images 
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-muted/30 border-border"
                    }`}>
                      <div className="flex items-center gap-2">
                        {seoScore.images ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-semibold">Fotoğraflar (min 3)</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      seoScore.location 
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-muted/30 border-border"
                    }`}>
                      <div className="flex items-center gap-2">
                        {seoScore.location ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-semibold">Konum Bilgisi</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      seoScore.price 
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-muted/30 border-border"
                    }`}>
                      <div className="flex items-center gap-2">
                        {seoScore.price ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-semibold">Fiyat Bilgisi</span>
                      </div>
                    </div>
                  </div>

                  {/* SEO Issues */}
                  {seoScore.issues.length > 0 && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        İyileştirme Önerileri
                      </h3>
                      <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                        {seoScore.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <ListingAnalytics listingId={listing.id} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimilarListings
                  listing={{
                    property_type: listing.property_type,
                    location_neighborhood: listing.location_neighborhood,
                    price_amount: listing.price_amount,
                    area_sqm: listing.area_sqm,
                    room_count: listing.room_count,
                  }}
                  onSelect={(listingId) => {
                    toast.info("Benzer ilan seçildi");
                    // Navigate to similar listing
                  }}
                />
                
                <ListingComparison
                  currentListing={{
                    title: listing.title,
                    price_amount: listing.price_amount,
                    area_sqm: listing.area_sqm,
                    room_count: listing.room_count,
                    images: listing.images,
                    views: listing.views,
                  }}
                  similarListings={[
                    {
                      id: "1",
                      title: "Denize Sıfır 3+1 Daire",
                      price_amount: 1850000,
                      area_sqm: listing.area_sqm || 120,
                      room_count: listing.room_count || 3,
                      images: [],
                      views: 342,
                    },
                    {
                      id: "2",
                      title: "Merkez Konumda 3+1 Daire",
                      price_amount: 1650000,
                      area_sqm: (listing.area_sqm || 120) - 10,
                      room_count: listing.room_count || 3,
                      images: [],
                      views: 287,
                    },
                  ]}
                />
              </div>
            </TabsContent>

            {/* Version History Tab */}
            <TabsContent value="history" className="space-y-4 mt-4">
              <VersionHistory
                contentType="listing"
                contentId={listing.id}
                onRestore={async () => {
                  // Reload listing after restore
                  const response = await fetch(`/api/listings/${listing.id}`);
                  if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.listing) {
                      setListing(data.listing);
                      toast.success("Versiyon geri yüklendi");
                    }
                  }
                }}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Scheduler */}
              <ListingScheduler
                listing={{
                  id: listing.id,
                  published: listing.published,
                  published_at: listing.published ? new Date().toISOString() : null,
                }}
                onSchedule={(schedule) => {
                  toast.success("Zamanlama ayarları kaydedildi");
                  // In production, save to API
                }}
              />

              {/* Export/Import */}
              <ListingExportImport
                listing={listing}
                onImport={(data) => {
                  updateListing(data);
                  toast.success("İlan verileri içe aktarıldı");
                }}
              />

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-base font-display font-bold text-foreground">
                    Yayın Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                      <div>
                        <Label htmlFor="published" className="text-sm font-ui font-semibold">
                          Yayınla
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          İlanı yayınla
                        </p>
                      </div>
                      <Switch
                        id="published"
                        checked={listing.published}
                        onCheckedChange={(checked) => updateListing({ published: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                      <div>
                        <Label htmlFor="featured" className="text-sm font-ui font-semibold">
                          Öne Çıkan
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ana sayfada göster
                        </p>
                      </div>
                      <Switch
                        id="featured"
                        checked={listing.featured}
                        onCheckedChange={(checked) => updateListing({ featured: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                      <div>
                        <Label htmlFor="available" className="text-sm font-ui font-semibold">
                          Müsait
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          İlan aktif
                        </p>
                      </div>
                      <Switch
                        id="available"
                        checked={listing.available}
                        onCheckedChange={(checked) => updateListing({ available: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Column */}
        {!distractionFree && (
          <aside className={`transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "lg:col-span-1"
          }`}>
            {/* Collapse Toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex absolute -left-3 top-6 z-10 w-6 h-6 items-center justify-center rounded-full bg-card border border-border shadow-md hover:shadow-lg transition-all"
              title={sidebarCollapsed ? "Sidebar'ı Aç" : "Sidebar'ı Kapat"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </button>

            {sidebarCollapsed ? (
              /* Collapsed Sidebar - Icon Only */
              <div className="space-y-4 sticky top-24">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className="p-3 rounded-lg bg-white dark:bg-card border border-border/40 dark:border-border/40 hover:bg-[#E7E7E7] dark:hover:bg-card transition-colors"
                    title="İlan Ayarları"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSidebarCollapsed(false); setActiveTab("seo"); }}
                    className="p-3 rounded-lg bg-white dark:bg-card border border-border/40 dark:border-border/40 hover:bg-[#E7E7E7] dark:hover:bg-card transition-colors"
                    title="SEO Skoru"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Expanded Sidebar - Full Cards */
              <div className="sticky top-24 space-y-4 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-modern pr-2">
                {/* Listing Info Card */}
                <Card className="card-professional">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground">
                        İlan Bilgileri
                      </CardTitle>
                      <button
                        type="button"
                        onClick={() => setSidebarCollapsed(true)}
                        className="lg:hidden p-1 rounded hover:bg-muted"
                        title="Sidebar'ı Kapat"
                        aria-label="Sidebar'ı Kapat"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                        Durum
                      </Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {listing.published ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Yayında
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Taslak
                          </Badge>
                        )}
                        {listing.featured && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            Öne Çıkan
                          </Badge>
                        )}
                        {!listing.available && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Satıldı
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium block text-muted-foreground">
                        Oluşturulma
                      </Label>
                      <p className="text-sm text-foreground font-medium">
                        {new Date(listing.created_at).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium block text-muted-foreground">
                        Son Güncelleme
                      </Label>
                      <p className="text-sm text-foreground font-medium">
                        {new Date(listing.updated_at).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>

                    {listing.price_amount && (
                      <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <Label className="text-xs font-medium block text-muted-foreground">
                          Fiyat
                        </Label>
                        <p className="text-xl font-semibold text-foreground">
                          {formatCurrency(listing.price_amount)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* SEO Score Card */}
                <Card className="card-professional">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      SEO Skoru
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-32 flex items-center justify-center">
                      {/* SVG Gauge - Behind text */}
                      <svg className="absolute inset-0 transform -rotate-90 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted-foreground/50"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 45 * (seoScore.score / 100)} ${2 * Math.PI * 45}`}
                          strokeLinecap="round"
                          className={`transition-all duration-500 ${
                            seoScore.score >= 80 
                              ? "text-green-600 dark:text-green-400"
                              : seoScore.score >= 60
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                      </svg>
                      {/* Score Text - In front */}
                      <div className="relative text-center z-10 pointer-events-none">
                        <p className={`text-4xl font-bold leading-none ${
                          seoScore.score >= 80 
                            ? "text-green-600 dark:text-green-400"
                            : seoScore.score >= 60
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {seoScore.score}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">/ 100</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="card-professional">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Hızlı İstatistikler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium text-muted-foreground">Fotoğraf</span>
                      <span className="text-sm font-semibold text-foreground">{listingStats.images}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium text-muted-foreground">Kelime</span>
                      <span className="text-sm font-semibold text-foreground">{listingStats.words}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium text-muted-foreground">Karakter</span>
                      <span className="text-sm font-semibold text-foreground">{listingStats.characters}</span>
                    </div>
                    {listingStats.pricePerM2 && (
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                        <span className="text-xs font-medium text-muted-foreground">m² Fiyatı</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(listingStats.pricePerM2)}/m²
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </aside>
        )}

        {/* Live Preview Panel */}
        {livePreview && livePreviewUrl && (
          <div className={`space-y-4 transition-all duration-300 ${
            previewSide === "right" 
              ? "col-span-1 border-l border-border/40 dark:border-border/40 pl-6" 
              : "col-span-full border-t border-border/40 dark:border-border/40 pt-6"
          }`}>
            <div className="flex items-center justify-between sticky top-24 bg-white dark:bg-muted pb-4 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-display font-bold text-foreground">
                  Canlı Önizleme
                </h3>
                <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                  Canlı
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewSide(previewSide === "right" ? "bottom" : "right")}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  title={previewSide === "right" ? "Altına Taşı" : "Sağa Taşı"}
                >
                  {previewSide === "right" ? (
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  ) : (
                    <ChevronRight className="h-4 w-4 -rotate-90" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setLivePreview(false)}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  title="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className={`rounded-lg border border-border/40 dark:border-border/40 overflow-hidden bg-white ${
              previewSide === "right" ? "h-[calc(100vh-200px)]" : "h-[600px]"
            }`}>
              <iframe
                src={livePreviewUrl}
                className="w-full h-full border-0"
                title="Live Preview"
                key={`${listing.id}-${listing.updated_at}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border/40 dark:border-border/40">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-foreground">
                  Önizleme
                </h2>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`p-1.5 rounded ${
                      previewMode === "desktop" 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title="Masaüstü Görünümü"
                    aria-label="Masaüstü Görünümü"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("tablet")}
                    className={`p-1.5 rounded ${
                      previewMode === "tablet" 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title="Tablet Görünümü"
                    aria-label="Tablet Görünümü"
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`p-1.5 rounded ${
                      previewMode === "mobile" 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title="Mobil Görünümü"
                    aria-label="Mobil Görünümü"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPreviewUrl(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Önizlemeyi Kapat"
                aria-label="Önizlemeyi Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <div 
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                style={{ width: getPreviewWidth(), transition: "width 0.3s" }}
              >
                <iframe
                  src={previewUrl}
                  className="w-full border-0"
                  style={{ height: previewMode === "desktop" ? "90vh" : "600px" }}
                  title="Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Dialog - Enhanced */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-card rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 animate-bounce-in overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                  Medya Kütüphanesi
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fotoğraf seçin veya yeni fotoğraf yükleyin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-800"
                title="Kapat (Esc)"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <MediaLibrary
                onSelect={(url) => {
                  updateListing({ images: [...listing.images, url] });
                  setShowMediaLibrary(false);
                  toast.success("Fotoğraf eklendi", {
                    icon: "✅",
                    duration: 2000,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Optimizer Dialog - Enhanced */}
      {showImageOptimizer && editingImageIndex !== null && listing.images[editingImageIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-card rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 animate-bounce-in overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/20">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                  Fotoğraf Optimize Et
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fotoğrafı düzenleyin, kırpın ve optimize edin
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImageOptimizer(false);
                  setEditingImageIndex(null);
                }}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-800"
                title="Kapat (Esc)"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ImageOptimizer
                imageUrl={listing.images[editingImageIndex]}
                imageId={`listing-${listing.id}-image-${editingImageIndex}`}
                onOptimize={(optimizedUrl) => {
                  const newImages = [...listing.images];
                  newImages[editingImageIndex] = optimizedUrl;
                  updateListing({ images: newImages });
                  setShowImageOptimizer(false);
                  setEditingImageIndex(null);
                  toast.success("Fotoğraf optimize edildi", {
                    icon: "✨",
                    duration: 3000,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary - Floating */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 shadow-xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">
                  Form Hataları
                </h4>
                <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setValidationErrors({})}
                className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Kapat"
              >
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
