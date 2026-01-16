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
  FileText, 
  Save, 
  Eye, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Calendar,
  Image as ImageIcon,
  Link2,
  Search,
  BarChart3,
  Settings,
  Zap,
  X,
  Plus,
  History,
  Tag,
  Users,
  Share2,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Layers,
  Code as CodeIcon,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Languages,
  Globe,
  AlignLeft as AlignLeftIcon,
  Focus
} from "lucide-react";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { ImageUpload } from "@/components/content-studio/ImageUpload";
import { MediaLibraryButton } from "@/components/content-studio/MediaLibraryButton";
import { ContentHistory } from "@/components/content-studio/ContentHistory";
import { MediaLibrary } from "@/components/content-studio/MediaLibrary";
import { AIContentAssistant } from "./AIContentAssistant";
import { RelatedArticles } from "./RelatedArticles";
import { ContentChecklist } from "./ContentChecklist";
import { AIContentOptimizer } from "./AIContentOptimizer";
import { OneClickSEOOptimizer } from "@/components/seo/OneClickSEOOptimizer";
import { ContentScheduler } from "@/components/content-studio/ContentScheduler";
import { ContentTemplates } from "./ContentTemplates";
import { ArticleEditorHeader } from "./ArticleEditorHeader";
import { ArticleEditorSidebar } from "./ArticleEditorSidebar";
import { ArticleFormFields } from "./ArticleFormFields";
import { ArticleQuickActions } from "./ArticleQuickActions";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@karasu/ui";

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

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category_id: string | null;
  category_slug: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_breaking: boolean;
  meta_description: string | null;
  seo_keywords: string | null;
  published_at: string | null;
  scheduled_publish_at: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  reading_time: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleEditorProps {
  article: Article;
  categories: Category[];
  locale: string;
}

interface ContentStats {
  words: number;
  characters: number;
  paragraphs: number;
  headings: number;
  images: number;
  links: number;
  readingTime: number;
}

interface SEOScore {
  score: number;
  title: boolean;
  metaDescription: boolean;
  keywords: boolean;
  slug: boolean;
  images: boolean;
  headings: boolean;
  links: boolean;
  issues: string[];
}

export function ArticleEditorAdvanced({ article: initialArticle, categories, locale }: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article>(initialArticle);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRevision, setSelectedRevision] = useState<any | null>(null);
  const [showRevisionCompare, setShowRevisionCompare] = useState(false);
  const [contentStats, setContentStats] = useState<ContentStats>({
    words: 0,
    characters: 0,
    paragraphs: 0,
    headings: 0,
    images: 0,
    links: 0,
    readingTime: 0,
  });
  const [seoScore, setSeoScore] = useState<SEOScore>({
    score: 0,
    title: false,
    metaDescription: false,
    keywords: false,
    slug: false,
    images: false,
    headings: false,
    links: false,
    issues: [],
  });

  // Additional state declarations
  const [distractionFree, setDistractionFree] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [livePreview, setLivePreview] = useState(false);
  const [previewSide, setPreviewSide] = useState<"right" | "bottom">("right");
  const [showTemplates, setShowTemplates] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [analyzingSEO, setAnalyzingSEO] = useState(false);
  const [translationMode, setTranslationMode] = useState(false);
  const [targetLocale, setTargetLocale] = useState<string>("en");
  const [isRTL, setIsRTL] = useState(false);

  // Available locales for translation
  const availableLocales = [
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "et", name: "Eesti", flag: "🇪🇪" },
  ];

  // Calculate content statistics
  const calculateStats = useCallback((content: string) => {
    const textContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    const characters = textContent.length;
    const paragraphs = (content.match(/<p[^>]*>/gi) || []).length;
    const headings = (content.match(/<h[1-6][^>]*>/gi) || []).length;
    const images = (content.match(/<img[^>]*>/gi) || []).length;
    const links = (content.match(/<a[^>]*>/gi) || []).length;
    const readingTime = Math.max(1, Math.ceil(words.length / 200));

    return {
      words: words.length,
      characters,
      paragraphs,
      headings,
      images,
      links,
      readingTime,
    };
  }, []);

  // Calculate SEO score
  const calculateSEOScore = useCallback((article: Article): SEOScore => {
    const issues: string[] = [];
    let score = 0;

    // Title check (20 points)
    if (article.title && article.title.length >= 30 && article.title.length <= 60) {
      score += 20;
    } else {
      issues.push("Başlık 30-60 karakter arasında olmalı");
    }

    // Meta description check (20 points)
    if (article.meta_description && article.meta_description.length >= 120 && article.meta_description.length <= 160) {
      score += 20;
    } else {
      issues.push("Meta açıklama 120-160 karakter arasında olmalı");
    }

    // Keywords check (15 points)
    const keywords = typeof article.seo_keywords === 'string' 
      ? article.seo_keywords.split(",").filter(k => k.trim())
      : Array.isArray(article.seo_keywords) 
        ? article.seo_keywords 
        : [];
    if (keywords.length >= 3) {
      score += 15;
    } else {
      issues.push("En az 3 SEO anahtar kelimesi ekleyin");
    }

    // Slug check (10 points)
    if (article.slug && article.slug.length > 0) {
      score += 10;
    } else {
      issues.push("Slug boş olamaz");
    }

    // Featured image check (15 points)
    if (article.featured_image) {
      score += 15;
    } else {
      issues.push("Öne çıkan görsel ekleyin");
    }

    // Headings check (10 points)
    const headings = (article.content.match(/<h[1-6][^>]*>/gi) || []).length;
    if (headings >= 2) {
      score += 10;
    } else {
      issues.push("En az 2 başlık (H2-H6) ekleyin");
    }

    // Links check (10 points)
    const links = (article.content.match(/<a[^>]*>/gi) || []).length;
    if (links >= 2) {
      score += 10;
    } else {
      issues.push("En az 2 iç/dış link ekleyin");
    }

    return {
      score,
      title: Boolean(article.title && article.title.length >= 30 && article.title.length <= 60),
      metaDescription: Boolean(article.meta_description && article.meta_description.length >= 120 && article.meta_description.length <= 160),
      keywords: (typeof article.seo_keywords === 'string' 
        ? article.seo_keywords.split(",").filter(k => k.trim())
        : Array.isArray(article.seo_keywords) 
          ? article.seo_keywords 
          : []).length >= 3,
      slug: !!article.slug,
      images: !!article.featured_image,
      headings: headings >= 2,
      links: links >= 2,
      issues,
    };
  }, []);

  // Update stats when content changes
  useEffect(() => {
    const stats = calculateStats(article.content);
    setContentStats(stats);
  }, [article.content, calculateStats]);

  // Update SEO score when article changes
  useEffect(() => {
    const score = calculateSEOScore(article);
    setSeoScore(score);
  }, [article, calculateSEOScore]);

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
        if (!article.is_published) {
          handlePublish();
        }
      }
      // Ctrl/Cmd + K: Preview
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleGeneratePreview();
      }
      // Escape: Close modals or exit distraction-free mode
      if (e.key === "Escape") {
        if (distractionFree) {
          setDistractionFree(false);
        } else {
          setShowPreview(false);
          setShowHistory(false);
          setShowTags(false);
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
  }, [saving, isDirty, article.is_published]);

  // Auto-save with debounce and retry
  const debouncedSave = useDebouncedCallback(
    async (articleData: Article, retryCount = 0) => {
      if (!isDirty) return;
      
      const maxRetries = 2; // Fewer retries for auto-save
      const baseDelay = 1000;
      
      try {
        const response = await fetch(`/api/articles/${articleData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...articleData,
            categorySlug: articleData.category_slug,
            categoryId: articleData.category_id,
            isPublished: articleData.is_published,
            isFeatured: articleData.is_featured,
            isBreaking: articleData.is_breaking,
            metaDescription: articleData.meta_description,
            seoKeywords: articleData.seo_keywords,
            featuredImage: articleData.featured_image,
          }),
          // Add timeout for auto-save
          signal: AbortSignal.timeout(20000), // 20 second timeout for auto-save
        });

        // Handle 503 Service Unavailable with exponential backoff retry
        if (response.status === 503 && retryCount < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(2, retryCount), 3000); // Exponential backoff, max 3s for auto-save
          console.warn(`Auto-save attempt ${retryCount + 1} failed with 503, retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return debouncedSave(articleData, retryCount + 1);
        }

        if (response.ok) {
          setLastSaved(new Date());
          setIsDirty(false);
        } else {
          // Don't show error for auto-save failures, just log
          console.warn("Auto-save failed:", response.status, response.statusText);
        }
      } catch (error: any) {
        // Handle AbortError (timeout) gracefully
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          console.warn("Auto-save timeout, will retry on next change");
          return;
        }
        // Don't show error for auto-save failures, just log
        // But log more details for debugging
        console.warn("Auto-save error:", {
          message: error.message,
          name: error.name,
          status: error.status,
        });
      }
    },
    2000 // 2 second debounce
  );

  // Auto-save on change
  useEffect(() => {
    if (isDirty) {
      debouncedSave(article);
    }
  }, [article, isDirty, debouncedSave]);

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

  const handleSave = async (retryCount = 0) => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay

    setSaving(true);
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          categorySlug: article.category_slug,
          categoryId: article.category_id,
          isPublished: article.is_published,
          isFeatured: article.is_featured,
          isBreaking: article.is_breaking,
          metaDescription: article.meta_description,
          seoKeywords: article.seo_keywords,
          featuredImage: article.featured_image,
        }),
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      // Handle 503 Service Unavailable with exponential backoff retry
      if (response.status === 503 && retryCount < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
        console.warn(`Save attempt ${retryCount + 1} failed with 503, retrying after ${delay}ms...`);
        setSaving(false);
        await new Promise(resolve => setTimeout(resolve, delay));
        return handleSave(retryCount + 1);
      }

      const data = await response.json();

      if (!response.ok) {
        // If still 503 after retries, show user-friendly message
        if (response.status === 503) {
          throw new Error("Veritabanı bağlantısı kurulamadı. Lütfen birkaç saniye sonra tekrar deneyin.");
        }
        throw new Error(data.error || "Haber kaydedilemedi");
      }

      toast.success("Haber başarıyla kaydedildi");
      setIsDirty(false);
      setLastSaved(new Date());

      // Revalidate web app cache if published
      if (article.is_published) {
        try {
          const { revalidateArticle } = await import("@/lib/web-app/revalidate");
          await revalidateArticle(article.slug, locale);
        } catch (error) {
          console.error("Revalidation error:", error);
          // Don't show error to user, revalidation is optional
        }
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Haber kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const updatedArticle = {
      ...article,
      is_published: true,
      published_at: article.published_at || new Date().toISOString(),
    };
    
    setArticle(updatedArticle);
    setIsDirty(true);
    
    // Save immediately
    await handleSave();
  };

  const handleUnpublish = async () => {
    const updatedArticle = {
      ...article,
      is_published: false,
    };
    
    setArticle(updatedArticle);
    setIsDirty(true);
    
    // Save immediately
    await handleSave();
  };

  const handleGeneratePreview = async () => {
    try {
      const response = await fetch("/api/articles/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });

      const data = await response.json();
      if (data.success && data.previewUrl) {
        const baseUrl = typeof window !== "undefined" 
          ? window.location.origin.replace(":3001", ":3000")
          : "http://localhost:3000";
        const url = `${baseUrl}${data.previewUrl}`;
        setPreviewUrl(url);
        setShowPreview(true);
      } else {
        toast.error("Preview link oluşturulamadı");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Preview link oluşturulamadı");
    }
  };

  // Live preview URL - updates when article changes
  const livePreviewUrl = useMemo(() => {
    if (!livePreview || !article.id) return null;
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin.replace(":3001", ":3000")
      : "http://localhost:3000";
    return `${baseUrl}/${locale}/haber/${article.slug}?preview=true`;
  }, [livePreview, article.id, article.slug, locale]);

  // RTL support detection
  useEffect(() => {
    setIsRTL(locale === "ar" || locale === "he" || locale === "fa");
  }, [locale]);

  const updateArticle = (updates: Partial<Article>) => {
    setArticle(prev => {
      const updated = { ...prev, ...updates };
      
      // Auto-generate slug if title changed and slug is empty
      if (updates.title && !updated.slug) {
        updated.slug = generateSlug(updates.title);
      }
      
      return updated;
    });
    setIsDirty(true);
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

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : ""} ${distractionFree ? "distraction-free-mode" : ""}`}>
      {/* Professional Header */}
      <ArticleEditorHeader
        title={article.title || "Yeni Makale"}
        isDirty={isDirty}
        saving={saving}
        lastSaved={lastSaved}
        readingTime={contentStats.readingTime}
        views={article.views}
        seoScore={seoScore.score}
        isPublished={article.is_published}
        isFullscreen={isFullscreen}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onPreview={handleGeneratePreview}
        onFullscreen={() => setIsFullscreen(true)}
        onExitFullscreen={() => setIsFullscreen(false)}
        onDistractionFree={() => setDistractionFree(!distractionFree)}
        previewUrl={previewUrl}
        locale={locale}
      />

      {/* Legacy Header (Hidden) - Keeping for reference */}
      <div className="hidden flex items-center justify-between sticky top-0 z-40 bg-card border-b border-border px-6 py-4 -mx-6 -mt-6 mb-6 backdrop-blur-sm bg-card/95">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-design-dark dark:text-white mb-1">
              Haber Düzenle
            </h1>
            <div className="flex items-center gap-4 text-xs text-foreground/70">
              {lastSaved && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-foreground/50" />
                  Son kayıt: {lastSaved.toLocaleTimeString("tr-TR")}
                </span>
              )}
              {isDirty && (
                <span className="flex items-center gap-1 text-foreground/80">
                  <AlertCircle className="h-3 w-3" />
                  Kaydedilmemiş değişiklikler
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {contentStats.readingTime} dk okuma
              </span>
              {article.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.views.toLocaleString()} görüntülenme
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* SEO Score Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
            <TrendingUp className="h-4 w-4 text-foreground/70" />
            <span className="text-sm font-medium text-foreground">
              SEO: {seoScore.score}/100
            </span>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setTranslationMode(!translationMode)}
              className={`p-2 rounded-lg transition-colors ${
                translationMode 
                  ? "bg-design-light text-white" 
                  : "hover:bg-muted"
              }`}
              title="Çeviri Modu"
            >
              <Languages className="h-4 w-4" />
            </button>
            {translationMode && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-2 px-2">Hedef Dil</p>
                  {availableLocales.filter(l => l.code !== locale).map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setTargetLocale(loc.code);
                        toast.success(`${loc.name} çeviri modu aktif`);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                        targetLocale === loc.code ? "bg-design-light/10" : ""
                      }`}
                    >
                      <span>{loc.flag}</span>
                      <span>{loc.name}</span>
                      {targetLocale === loc.code && (
                        <CheckCircle2 className="h-4 w-4 ml-auto text-design-light" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RTL Toggle (for Arabic) */}
          {isRTL && (
            <button
              type="button"
              onClick={() => {
                const editor = document.querySelector('[contenteditable="true"]');
                if (editor) {
                  const currentDir = editor.getAttribute('dir');
                  editor.setAttribute('dir', currentDir === 'rtl' ? 'ltr' : 'rtl');
                  toast.success(`Yön: ${currentDir === 'rtl' ? 'LTR' : 'RTL'}`);
                }
              }}
              className="p-2 rounded-lg hover:bg-[#E7E7E7] dark:hover:bg-[#0a3d35] transition-colors"
              title="RTL/LTR Değiştir"
            >
              <AlignLeftIcon className="h-4 w-4" />
            </button>
          )}

          {/* Live Preview Toggle */}
          <button
            type="button"
            onClick={() => setLivePreview(!livePreview)}
            className={`p-2 rounded-lg transition-colors ${
              livePreview 
                ? "bg-design-light text-white" 
                : "hover:bg-[#E7E7E7] dark:hover:bg-[#0a3d35]"
            }`}
            title="Canlı Önizleme"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Distraction-Free Mode */}
          <button
            type="button"
            onClick={() => setDistractionFree(!distractionFree)}
            className="p-2 rounded-lg hover:bg-[#E7E7E7] dark:hover:bg-[#0a3d35] transition-colors"
            title="Dikkat Dağıtmayan Mod"
          >
            <Layers className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-[#E7E7E7] dark:hover:bg-[#0a3d35] transition-colors"
            title="Tam Ekran"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          {/* Action Buttons */}
          {article.is_published ? (
            <>
              <button
                type="button"
                onClick={handleUnpublish}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Yayından Kaldır
              </button>
              <button
                type="button"
                onClick={() => {
                  const baseUrl = typeof window !== "undefined" 
                    ? window.location.origin.replace(":3001", ":3000")
                    : "http://localhost:3000";
                  const url = `${baseUrl}/${locale}/haber/${article.slug}`;
                  window.open(url, "_blank");
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-design-light rounded-lg hover:bg-design-dark transition-colors inline-flex items-center gap-2"
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
                className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors inline-flex items-center gap-2 border border-border"
              >
                <ExternalLink className="h-4 w-4" />
                Önizle
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-4 py-2 text-sm font-medium text-background bg-foreground rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Yayınla
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving || !isDirty}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-design-light to-design-dark rounded-lg hover:from-design-dark hover:to-design-light transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kaydediliyor...
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
      <div className="flex items-center gap-3 text-xs text-design-gray dark:text-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-900/20 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
        <span className="font-semibold flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Kısayollar:
        </span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">⌘S</kbd>
          <span>Kaydet</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">⌘P</kbd>
          <span>Yayınla</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">⌘K</kbd>
          <span>Önizle</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">Esc</kbd>
          <span>Kapat</span>
        </div>
        {distractionFree && (
          <div className="flex items-center gap-1 ml-auto text-design-light">
            <Focus className="h-3 w-3" />
            <span>Dikkat Dağıtmayan Mod</span>
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
          {/* Content Tab */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card border border-border rounded-lg p-1 flex-wrap h-auto">
              <TabsTrigger value="content" className="text-xs font-ui flex items-center gap-2">
                <FileText className="h-4 w-4" />
                İçerik
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs font-ui flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs font-ui flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Ayarlar
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs font-ui flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analitik
              </TabsTrigger>
            </TabsList>

            {/* Templates Button */}
            <div className="flex items-center justify-end">
              <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Şablon Kullan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-display font-bold text-design-dark dark:text-white">
                      İçerik Şablonları
                    </DialogTitle>
                  </DialogHeader>
                  <ContentTemplates
                    onSelect={(template) => {
                      if (template.structure.title) {
                        updateArticle({ title: template.structure.title });
                      }
                      if (template.structure.content) {
                        updateArticle({ content: template.structure.content });
                      }
                      if (template.structure.excerpt) {
                        updateArticle({ excerpt: template.structure.excerpt });
                      }
                      setShowTemplates(false);
                      toast.success(`${template.name} şablonu uygulandı`);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* Form Fields - Professional Component */}
              <ArticleFormFields
                article={article}
                categories={categories}
                onUpdate={updateArticle}
                generateSlug={generateSlug}
                locale={locale}
              />

              {/* Rich Text Editor */}
              <Card className="card-professional">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
                      İçerik
                      {codeMode && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <CodeIcon className="h-3 w-3 mr-1" />
                          Kod Modu
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCodeMode(!codeMode)}
                        className="h-8 px-3 text-xs"
                        title="Kod/HTML Editör Modu"
                      >
                        {codeMode ? (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            Görsel Mod
                          </>
                        ) : (
                          <>
                            <CodeIcon className="h-3 w-3 mr-1" />
                            Kod Modu
                          </>
                        )}
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        {contentStats.words} kelime
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {contentStats.paragraphs} paragraf
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {contentStats.headings} başlık
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {codeMode ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <CodeIcon className="h-3 w-3 mr-1" />
                            HTML Editor
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {article.content.length} karakter
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Format HTML (basic indentation)
                              const formatted = article.content
                                .replace(/></g, '>\n<')
                                .split('\n')
                                .map(line => {
                                  const indent = (line.match(/^(\s*)/)?.[1] || '').length;
                                  const tag = line.trim();
                                  if (tag.startsWith('</')) {
                                    return '  '.repeat(Math.max(0, indent - 1)) + tag;
                                  }
                                  return '  '.repeat(indent) + tag;
                                })
                                .join('\n');
                              updateArticle({ content: formatted });
                              toast.success("HTML formatlandı");
                            }}
                            className="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Formatla"
                          >
                            <Wand2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(article.content);
                              toast.success("HTML kopyalandı");
                            }}
                            className="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Kopyala"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <Textarea
                        value={article.content}
                        onChange={(e) => updateArticle({ content: e.target.value })}
                        className="font-mono text-sm min-h-[400px] bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700"
                        placeholder="HTML içeriğini buraya yazın..."
                        style={{
                          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                          lineHeight: '1.6',
                          tabSize: 2,
                        }}
                      />
                      <div className="flex items-center justify-between text-xs text-design-gray dark:text-gray-400">
                        <p>HTML kodunu doğrudan düzenleyebilirsiniz</p>
                        <div className="flex items-center gap-4">
                          <span>Satır: {article.content.split('\n').length}</span>
                          <span>Tag: {(article.content.match(/<[^>]+>/g) || []).length}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                  <div className="relative">
                    {translationMode && targetLocale !== locale && (
                      <div className="mb-4 p-3 bg-muted/30 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-foreground/70" />
                            <span className="text-sm font-medium text-foreground">
                              Çeviri Modu: {availableLocales.find(l => l.code === targetLocale)?.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                toast.loading("Çeviri yapılıyor...");
                                // In production, this would call a translation API
                                // For now, we'll just show a placeholder
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                toast.success("Çeviri tamamlandı (Demo modu)");
                              } catch (error) {
                                toast.error("Çeviri başarısız");
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
                          >
                            <Languages className="h-3 w-3 mr-1 inline" />
                            Çevir
                          </button>
                        </div>
                        <p className="text-xs text-foreground/70 mt-2">
                          İçerik {availableLocales.find(l => l.code === targetLocale)?.name} diline çevrilecek
                        </p>
                      </div>
                    )}
                    <RichTextEditor
                      value={article.content}
                      onChange={(value) => updateArticle({ content: value })}
                      placeholder={isRTL ? "اكتب محتوى الخبر هنا..." : "Haber içeriğini buraya yazın..."}
                      className={distractionFree ? "min-h-[600px]" : ""}
                    />
                    {distractionFree && (
                      <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-design-gray dark:text-gray-400 bg-white/80 dark:bg-[#0a3d35]/80 px-2 py-1 rounded">
                        <Focus className="h-3 w-3" />
                        Dikkat Dağıtmayan Mod Aktif
                      </div>
                    )}
                  </div>
                  )}
                </CardContent>
              </Card>

              {/* Featured Image with Enhanced Gallery */}
              <Card className="card-professional">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                      Öne Çıkan Görsel
                    </CardTitle>
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
                        onSelect={(url) => updateArticle({ featured_image: url })}
                        className="h-8 px-3 text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ImageUpload
                      onUpload={(url) => updateArticle({ featured_image: url })}
                      currentImage={article.featured_image || undefined}
                    />
                    {article.featured_image && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-design-gray dark:text-gray-400" />
                            <span className="text-xs text-design-gray dark:text-gray-400 font-mono truncate max-w-xs">
                              {article.featured_image.split('/').pop()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const url = article.featured_image;
                                if (url) {
                                  navigator.clipboard.writeText(url);
                                  toast.success("Görsel URL'si kopyalandı");
                                }
                              }}
                              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                              title="URL Kopyala"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(article.featured_image || '', '_blank')}
                              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                              title="Yeni Sekmede Aç"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Excerpt */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                    Özet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="excerpt"
                    value={article.excerpt || ""}
                    onChange={(e) => updateArticle({ excerpt: e.target.value })}
                    rows={3}
                    className="input-modern"
                    placeholder="Haber özeti (150-160 karakter önerilir)"
                  />
                  <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                    {article.excerpt?.length || 0} karakter
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              {/* Advanced SEO Analysis */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                      <Search className="h-5 w-5 text-foreground/70" />
                      Gelişmiş SEO Analizi
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setAnalyzingSEO(true);
                        try {
                          // Simulate SEO analysis (in production, this would call an API)
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          
                          const analysis = {
                            readability: {
                              score: Math.min(100, Math.max(0, 100 - (contentStats.words / 10))),
                              level: contentStats.words < 500 ? "Kolay" : contentStats.words < 1000 ? "Orta" : "Zor",
                              suggestions: contentStats.words < 300 
                                ? ["İçeriği daha detaylandırın", "En az 500 kelime önerilir"]
                                : contentStats.words > 2000
                                ? ["İçeriği bölümlere ayırın", "Daha kısa paragraflar kullanın"]
                                : []
                            },
                            keywordDensity: {
                              primary: article.seo_keywords?.split(",")[0]?.trim() || "Belirtilmemiş",
                              density: article.seo_keywords ? "2.5%" : "0%",
                              suggestions: article.seo_keywords 
                                ? ["Anahtar kelime yoğunluğu iyi"]
                                : ["Anahtar kelime ekleyin"]
                            },
                            technical: {
                              headings: contentStats.headings >= 2 ? "✓ Yeterli" : "✗ Yetersiz",
                              images: contentStats.images >= 1 ? "✓ Var" : "✗ Yok",
                              links: contentStats.links >= 2 ? "✓ Yeterli" : "✗ Yetersiz",
                              metaDescription: article.meta_description && article.meta_description.length >= 120 && article.meta_description.length <= 160
                                ? "✓ Uygun"
                                : "✗ Uygun değil"
                            },
                            competitors: {
                              avgTitleLength: 45,
                              avgContentLength: 1200,
                              avgMetaLength: 145
                            }
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
                    {/* Readability Score */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Okunabilirlik</span>
                        <Badge variant="outline" className="text-xs">
                          {seoAnalysis.readability.score}/100
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/70">
                        Seviye: {seoAnalysis.readability.level} ({contentStats.words} kelime)
                      </p>
                      {seoAnalysis.readability.suggestions.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {seoAnalysis.readability.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="text-xs text-foreground/70 flex items-center gap-1">
                              <Lightbulb className="h-3 w-3" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Keyword Analysis */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Anahtar Kelime</span>
                        <Badge variant="outline" className="text-xs">
                          {seoAnalysis.keywordDensity.primary}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/70">
                        Yoğunluk: {seoAnalysis.keywordDensity.density}
                      </p>
                      {seoAnalysis.keywordDensity.suggestions.length > 0 && (
                        <p className="text-xs text-foreground/70 mt-1">
                          {seoAnalysis.keywordDensity.suggestions[0]}
                        </p>
                      )}
                    </div>

                    {/* Technical SEO */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded border border-border bg-muted/30">
                        <p className="text-xs text-foreground/70 mb-1">Başlıklar</p>
                        <p className="text-sm font-semibold text-foreground">{seoAnalysis.technical.headings}</p>
                      </div>
                      <div className="p-2.5 rounded border border-border bg-muted/30">
                        <p className="text-xs text-foreground/70 mb-1">Görseller</p>
                        <p className="text-sm font-semibold text-foreground">{seoAnalysis.technical.images}</p>
                      </div>
                      <div className="p-2.5 rounded border border-border bg-muted/30">
                        <p className="text-xs text-foreground/70 mb-1">Linkler</p>
                        <p className="text-sm font-semibold text-foreground">{seoAnalysis.technical.links}</p>
                      </div>
                      <div className="p-2.5 rounded border border-border bg-muted/30">
                        <p className="text-xs text-foreground/70 mb-1">Meta Açıklama</p>
                        <p className="text-sm font-semibold text-foreground">{seoAnalysis.technical.metaDescription}</p>
                      </div>
                    </div>

                    {/* Competitor Comparison */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <h4 className="text-sm font-medium text-foreground mb-2.5 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-foreground/70" />
                        Rakip Karşılaştırması
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Ortalama Başlık Uzunluğu</span>
                          <span className="font-medium text-foreground">
                            {article.title.length} / {seoAnalysis.competitors.avgTitleLength}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Ortalama İçerik Uzunluğu</span>
                          <span className="font-medium text-foreground">
                            {contentStats.words} / {seoAnalysis.competitors.avgContentLength} kelime
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Ortalama Meta Uzunluğu</span>
                          <span className="font-medium text-foreground">
                            {article.meta_description?.length || 0} / {seoAnalysis.competitors.avgMetaLength}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* One-Click SEO Optimizer - Professional AI-powered optimization */}
              <OneClickSEOOptimizer
                content={{
                  id: article.id,
                  title: article.title,
                  content: article.content,
                  excerpt: article.excerpt || undefined,
                  meta_description: article.meta_description || undefined,
                  seo_keywords: article.seo_keywords || undefined,
                  slug: article.slug,
                  type: "article",
                  locale: locale,
                }}
                onOptimize={(updates) => {
                  updateArticle(updates);
                }}
              />

              {/* AI Content Optimizer - For editing existing articles */}
              <AIContentOptimizer
                article={{
                  title: article.title,
                  content: article.content,
                  excerpt: article.excerpt || undefined,
                  meta_description: article.meta_description || undefined,
                  seo_keywords: article.seo_keywords || undefined,
                  featured_image: article.featured_image || undefined,
                }}
                onOptimize={(updates) => {
                  updateArticle(updates);
                }}
              />

              {/* AI Content Assistant */}
              <AIContentAssistant
                title={article.title}
                content={article.content}
                excerpt={article.excerpt || ""}
                onUpdate={(updates) => {
                  updateArticle(updates);
                }}
              />

              <Card className="card-professional">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                      SEO Ayarları
                    </CardTitle>
                    <div className="flex items-center gap-2">
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
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SEO Checklist */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        {seoScore.title ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
                        )}
                        <span className="text-xs font-medium text-foreground">Başlık (30-60 karakter)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        {seoScore.metaDescription ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
                        )}
                        <span className="text-xs font-medium text-foreground">Meta Açıklama (120-160 karakter)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        {seoScore.keywords ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
                        )}
                        <span className="text-xs font-medium text-foreground">Anahtar Kelimeler (min 3)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        {seoScore.images ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
                        )}
                        <span className="text-xs font-medium text-foreground">Öne Çıkan Görsel</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        {seoScore.headings ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
                        )}
                        <span className="text-xs font-medium text-foreground">Başlıklar (min 2)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        {seoScore.links ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
                        )}
                        <span className="text-xs font-medium text-foreground">Linkler (min 2)</span>
                      </div>
                    </div>
                  </div>

                  {/* SEO Issues */}
                  {seoScore.issues.length > 0 && (
                    <div className="p-3 bg-muted/30 border border-border rounded-lg">
                      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-foreground/70" />
                        İyileştirme Önerileri
                      </h3>
                      <ul className="text-xs text-foreground/70 space-y-1 list-disc list-inside">
                        {seoScore.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="meta_description" className="text-xs font-ui font-semibold">
                      Meta Açıklama
                    </Label>
                    <Textarea
                      id="meta_description"
                      value={article.meta_description || ""}
                      onChange={(e) => updateArticle({ meta_description: e.target.value })}
                      rows={3}
                      className="input-modern mt-1"
                      placeholder="SEO meta açıklaması (120-160 karakter önerilir)"
                    />
                    <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                      {article.meta_description?.length || 0} / 160 karakter
                      {article.meta_description && article.meta_description.length < 120 && (
                        <span className="text-foreground/70 ml-2">⚠️ 120 karakterden kısa</span>
                      )}
                      {article.meta_description && article.meta_description.length > 160 && (
                        <span className="text-foreground/70 ml-2">⚠️ 160 karakterden uzun</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="seo_keywords" className="text-xs font-ui font-semibold">
                      SEO Anahtar Kelimeler
                    </Label>
                    <Input
                      id="seo_keywords"
                      value={article.seo_keywords || ""}
                      onChange={(e) => updateArticle({ seo_keywords: e.target.value })}
                      className="input-modern mt-1"
                      placeholder="kelime1, kelime2, kelime3"
                    />
                    <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                      Virgülle ayrılmış anahtar kelimeler ({typeof article.seo_keywords === 'string' ? article.seo_keywords.split(",").filter(k => k.trim()).length : 0} kelime)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                    Yayın Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                      <div>
                        <Label htmlFor="is_published" className="text-sm font-ui font-semibold">
                          Yayınla
                        </Label>
                        <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                          Haberi yayınla
                        </p>
                      </div>
                      <Switch
                        id="is_published"
                        checked={article.is_published}
                        onCheckedChange={(checked) => {
                          updateArticle({ 
                            is_published: checked,
                            published_at: checked && !article.published_at 
                              ? new Date().toISOString() 
                              : article.published_at
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                      <div>
                        <Label htmlFor="is_featured" className="text-sm font-ui font-semibold">
                          Öne Çıkan
                        </Label>
                        <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                          Ana sayfada göster
                        </p>
                      </div>
                      <Switch
                        id="is_featured"
                        checked={article.is_featured}
                        onCheckedChange={(checked) => updateArticle({ is_featured: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                      <div>
                        <Label htmlFor="is_breaking" className="text-sm font-ui font-semibold">
                          Son Dakika
                        </Label>
                        <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                          Son dakika haberi
                        </p>
                      </div>
                      <Switch
                        id="is_breaking"
                        checked={article.is_breaking}
                        onCheckedChange={(checked) => updateArticle({ is_breaking: checked })}
                      />
                    </div>
                  </div>

                  {/* Content Scheduling */}
                  <ContentScheduler
                    type="article"
                    contentId={article.id}
                    currentSchedule={article.scheduled_publish_at}
                    onScheduleChange={async () => {
                      // Refresh article data
                      const response = await fetch(`/api/articles/${article.id}`);
                      const data = await response.json();
                      if (data.success && data.article) {
                        setArticle(data.article);
                        setRefreshKey((k) => k + 1);
                      }
                    }}
                  />

                  {article.published_at && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-design-gray dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Yayın Tarihi: {new Date(article.published_at).toLocaleString("tr-TR")}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                    İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="p-3 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-foreground/70" />
                        <span className="text-sm font-medium text-foreground">Görüntülenme</span>
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {article.views.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-foreground/70" />
                        <span className="text-sm font-medium text-foreground">Okuma Süresi</span>
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {contentStats.readingTime} dk
                      </p>
                    </div>

                    <div className="p-3 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-foreground/70" />
                        <span className="text-sm font-medium text-foreground">Kelime</span>
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {contentStats.words.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded border border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-foreground/70" />
                        <span className="text-sm font-medium text-foreground">SEO Skoru</span>
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {seoScore.score}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <p className="text-xs text-foreground/70">Paragraf</p>
                      <p className="text-base font-semibold text-foreground">{contentStats.paragraphs}</p>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <p className="text-xs text-foreground/70">Başlık</p>
                      <p className="text-base font-semibold text-foreground">{contentStats.headings}</p>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <p className="text-xs text-foreground/70">Görsel</p>
                      <p className="text-base font-semibold text-foreground">{contentStats.images}</p>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <p className="text-xs text-foreground/70">Link</p>
                      <p className="text-base font-semibold text-foreground">{contentStats.links}</p>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-muted/30">
                      <p className="text-xs text-foreground/70">Karakter</p>
                      <p className="text-base font-semibold text-foreground">{contentStats.characters.toLocaleString()}</p>
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
                    className="p-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
                    title="Doküman Ayarları"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSidebarCollapsed(false); setActiveTab("seo"); }}
                    className="p-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
                    title="SEO Skoru"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHistory(true)}
                    className="p-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
                    title="Versiyon Geçmişi"
                  >
                    <History className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Expanded Sidebar - Full Cards */
              <div className="sticky top-24 space-y-4 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-modern pr-2">
                <ArticleEditorSidebar
                  contentStats={contentStats}
                  seoScore={seoScore}
                  isPublished={article.is_published}
                  publishedAt={article.published_at}
                  createdAt={article.created_at}
                  updatedAt={article.updated_at}
                  views={article.views}
                  category={article.category}
                  author={article.author}
                  onViewArticle={() => {
                    const baseUrl = typeof window !== "undefined" 
                      ? window.location.origin.replace(":3001", ":3000")
                      : "http://localhost:3000";
                    const url = `${baseUrl}/${locale}/blog/${article.slug}`;
                    window.open(url, "_blank");
                  }}
                  locale={locale}
                  articleId={article.id}
                  articleSlug={article.slug}
                  revisionHistory={revisionHistory}
                  tags={tags}
                  onTagsChange={setTags}
                  onFeaturedImageChange={(url) => updateArticle({ featured_image: url })}
                  onNavigateToSEO={() => setActiveTab("seo")}
                />
              </div>
            )}
          </aside>
        )}

        {/* Live Preview Panel */}
        {livePreview && livePreviewUrl && (
          <div className={`space-y-4 transition-all duration-300 ${
            previewSide === "right" 
              ? "col-span-1 border-l border-border pl-6"
              : "col-span-full border-t border-border pt-6"
          }`}>
            <div className="flex items-center justify-between sticky top-24 bg-card pb-4 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-display font-bold text-design-dark dark:text-white">
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
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className={`rounded-lg border border-border overflow-hidden bg-card ${
              previewSide === "right" ? "h-[calc(100vh-200px)]" : "h-[600px]"
            }`}>
              <iframe
                src={livePreviewUrl}
                className="w-full h-full border-0"
                title="Live Preview"
                key={`${article.id}-${article.updated_at}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a3d35] rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#E7E7E7] dark:border-[#062F28]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-design-dark dark:text-white">
                  Önizleme
                </h2>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`p-1.5 rounded ${
                      previewMode === "desktop" 
                        ? "bg-design-light text-white" 
                        : "text-design-gray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("tablet")}
                    className={`p-1.5 rounded ${
                      previewMode === "tablet" 
                        ? "bg-design-light text-white" 
                        : "text-design-gray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`p-1.5 rounded ${
                      previewMode === "mobile" 
                        ? "bg-design-light text-white" 
                        : "text-design-gray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
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
                className="text-design-gray dark:text-gray-400 hover:text-design-dark dark:hover:text-white transition-colors"
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
    </div>
  );
}

