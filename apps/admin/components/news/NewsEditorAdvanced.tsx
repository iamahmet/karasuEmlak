"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import {
  Save,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  Split,
  Layout,
  Settings,
  FileText,
  Image as ImageIcon,
  Search,
  Zap,
  X,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import { ContentScheduler } from "@/components/content-studio/ContentScheduler";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { VersionHistory } from "@/components/version-control/VersionHistory";
import { extractImageSuggestions } from "@/lib/utils/extract-image-suggestions";
import { cn } from "@karasu/lib";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  original_summary: string | null;
  emlak_analysis: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  published: boolean;
  featured: boolean;
  published_at: string | null;
  scheduled_publish_at: string | null;
  cover_image: string | null;
  og_image: string | null;
  source_url: string | null;
  source_domain: string | null;
  created_at: string;
  updated_at: string;
  quality_score?: number | null;
  quality_issues?: any[] | null;
  deleted_at?: string | null;
}

interface NewsEditorAdvancedProps {
  article: NewsArticle;
  locale: string;
}

type ViewMode = "edit" | "preview" | "split";
type PreviewDevice = "desktop" | "tablet" | "mobile";

export function NewsEditorAdvanced({ article: initialArticle, locale }: NewsEditorAdvancedProps) {
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle>(initialArticle);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [activeTab, setActiveTab] = useState("content");
  const [isDirty, setIsDirty] = useState(false);
  const [improving, setImproving] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageSuggestions, setImageSuggestions] = useState<any[]>([]);

  // Auto-save with debounce
  const debouncedSave = useCallback(
    async (articleData: NewsArticle) => {
      if (!isDirty) return;
      
      try {
        const response = await fetch(`/api/news/${articleData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setIsDirty(false);
          // Silent auto-save - no toast to avoid spam
        }
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    },
    [isDirty]
  );

  // Auto-save on change (debounced)
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        debouncedSave(article);
      }, 3000); // 3 second debounce
      return () => clearTimeout(timer);
    }
  }, [article, isDirty, debouncedSave]);

  // Extract image suggestions from content
  useEffect(() => {
    if (article.emlak_analysis) {
      const suggestions = extractImageSuggestions(article.emlak_analysis);
      setImageSuggestions(suggestions);
    } else {
      setImageSuggestions([]);
    }
  }, [article.emlak_analysis]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Cmd/Ctrl + E to toggle edit/preview
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        setViewMode((prev) => (prev === "edit" ? "preview" : "edit"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/news/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Haber kaydedilemedi");
      }

      toast.success("Haber başarıyla kaydedildi");
      setIsDirty(false);
      
      // Refresh article data
      const updatedResponse = await fetch(`/api/news/${article.id}`);
      const updatedData = await updatedResponse.json();
      if (updatedData.success && updatedData.article) {
        setArticle(updatedData.article);
      }
    } catch (error: any) {
      toast.error(error.message || "Haber kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async () => {
    const updatedArticle = {
      ...article,
      published: !article.published,
      published_at: !article.published ? new Date().toISOString() : article.published_at,
    };
    
    setArticle(updatedArticle);
    setIsDirty(true);
    await handleSave();
  };

  const updateArticle = (updates: Partial<NewsArticle>) => {
    setArticle((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleAIImprove = async () => {
    if (!article.emlak_analysis || article.emlak_analysis.trim().length === 0) {
      toast.error("İyileştirmek için içerik gerekli");
      return;
    }

    setImproving(true);
    
    try {
      // Start improvement in background - don't wait for response
      fetch(`/api/news/${article.id}/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "emlak_analysis" }),
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
                  console.error("[NewsEditor] Parse error:", e);
                }
              }
            }
          }
        })
        .catch((error: any) => {
          console.error("[NewsEditor] AI improve error:", error);
          toast.error(error.message || "İyileştirme başarısız");
        })
        .finally(() => {
          setImproving(false);
        });

      // Show immediate feedback
      toast.info("İyileştirme başlatıldı. Arka planda devam ediyor...");
      
    } catch (error: any) {
      console.error("[NewsEditor] AI improve error:", error);
      toast.error(error.message || "İyileştirme başlatılamadı");
      setImproving(false);
    }
  };

  const handleGenerateImages = async () => {
    if (imageSuggestions.length === 0) {
      toast.info("İçerikte görsel önerisi bulunamadı");
      return;
    }

    setGeneratingImages(true);
    try {
      const response = await fetch(`/api/news/${article.id}/generate-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "emlak_analysis" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Görsel oluşturma başarısız");
      }

      if (data.updatedContent) {
        updateArticle({ emlak_analysis: data.updatedContent });
        toast.success(`${data.generated} görsel oluşturuldu ve içeriğe eklendi`);
      } else {
        toast.warning("Görsel oluşturulamadı");
      }
    } catch (error: any) {
      console.error("[NewsEditor] Generate images error:", error);
      toast.error(error.message || "Görsel oluşturma başarısız");
    } finally {
      setGeneratingImages(false);
    }
  };


  const getPreviewWidth = (): string => {
    switch (previewDevice) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  const PreviewContent = () => (
    <div className="h-full overflow-auto bg-card">
      <div
        className="mx-auto bg-card transition-all duration-300"
        style={{ width: getPreviewWidth(), maxWidth: "100%" } as React.CSSProperties}
      >
        {/* Cover Image */}
        {article.cover_image && (
          <div className="w-full h-64 md:h-96 relative overflow-hidden">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {article.title || "Başlık Yok"}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            {article.published_at && (
              <span>{new Date(article.published_at).toLocaleDateString("tr-TR")}</span>
            )}
            {article.source_domain && (
              <span>Kaynak: {article.source_domain}</span>
            )}
          </div>

          {/* Summary */}
          {article.original_summary && (
            <div className="mb-8 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
              <p className="text-lg text-foreground leading-relaxed">
                {article.original_summary}
              </p>
            </div>
          )}

          {/* Main Content */}
          {article.emlak_analysis && (
            <div
              className="prose prose-lg prose-slate dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6
                prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-5
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:leading-relaxed prose-p:mb-6 prose-p:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-foreground
                prose-ul:my-6 prose-ul:pl-6
                prose-ol:my-6 prose-ol:pl-6
                prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
                prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
                prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-4"
              dangerouslySetInnerHTML={{ __html: article.emlak_analysis }}
            />
          )}

          {!article.emlak_analysis && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>İçerik henüz eklenmedi</p>
            </div>
          )}
        </article>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${locale}/haberler`)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {article.title || "Yeni Haber"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {article.slug || "slug-yok"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {article.published ? (
                <Badge variant="default" className="bg-primary">
                  <Eye className="h-3 w-3 mr-1" />
                  Yayında
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Taslak
                </Badge>
              )}
              {article.featured && (
                <Badge variant="outline">Öne Çıkan</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
              className="h-8 px-3"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("split")}
              className="h-8 px-3"
            >
              <Split className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="h-8 px-3"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Device Toggle */}
          {viewMode !== "edit" && (
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={previewDevice === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewDevice("mobile")}
                className="h-8 px-3"
                title="Mobil"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewDevice("tablet")}
                className="h-8 px-3"
                title="Tablet"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewDevice("desktop")}
                className="h-8 px-3"
                title="Masaüstü"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>
          )}

          {article.published && (
            <Link
              href={`http://localhost:3000/haberler/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="h-9">
                <ExternalLink className="h-4 w-4 mr-2" />
                Görüntüle
              </Button>
            </Link>
          )}

          <Button
            variant={article.published ? "secondary" : "default"}
            size="sm"
            onClick={handleTogglePublished}
            className="h-9"
          >
            {article.published ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Yayından Kaldır
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Yayınla
              </>
            )}
          </Button>

          <Button onClick={handleSave} disabled={saving} size="sm" className="h-9">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet {isDirty && <span className="ml-1 text-xs">•</span>}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Panel */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={cn(
              "flex flex-col border-r border-border bg-background overflow-hidden transition-all duration-300",
              viewMode === "split" ? "w-1/2" : "w-full"
            )}
          >
            <div className="flex-1 overflow-y-auto scrollbar-modern p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="content" className="text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    İçerik
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="text-sm">
                    <Search className="h-4 w-4 mr-2" />
                    SEO
                  </TabsTrigger>
                  <TabsTrigger value="media" className="text-sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Medya
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Ayarlar
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-sm">
                    <History className="h-4 w-4 mr-2" />
                    Versiyonlar
                  </TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Temel Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title">Başlık</Label>
                        <Input
                          id="title"
                          value={article.title}
                          onChange={(e) => updateArticle({ title: e.target.value })}
                          placeholder="Haber başlığını girin..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={article.slug}
                          onChange={(e) => updateArticle({ slug: e.target.value })}
                          placeholder="url-slug"
                        />
                      </div>
                      <div>
                        <Label htmlFor="source_url">Kaynak URL</Label>
                        <Input
                          id="source_url"
                          value={article.source_url || ""}
                          onChange={(e) => updateArticle({ source_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Özet</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={article.original_summary || ""}
                        onChange={(e) => updateArticle({ original_summary: e.target.value })}
                        rows={4}
                        placeholder="Haber özetini buraya yazın..."
                        className="resize-none"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Emlak Analizi</CardTitle>
                        <div className="flex items-center gap-2">
                          {imageSuggestions.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleGenerateImages}
                              disabled={generatingImages || !article.emlak_analysis}
                              className="h-8"
                            >
                              {generatingImages ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Oluşturuluyor...
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-4 w-4 mr-2" />
                                  Görselleri Oluştur ({imageSuggestions.length})
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAIImprove}
                            disabled={improving || !article.emlak_analysis}
                            className="h-8"
                          >
                            {improving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                İyileştiriliyor...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                AI ile Geliştir
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      {imageSuggestions.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {imageSuggestions.length} görsel önerisi bulundu. "Görselleri Oluştur" butonuna tıklayarak otomatik oluşturabilirsiniz.
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <TipTapEditor
                          content={article.emlak_analysis || ""}
                          onChange={(html) => updateArticle({ emlak_analysis: html })}
                          placeholder="Emlak analizi içeriğini buraya yazın..."
                          className="min-h-[500px]"
                        />
                      </div>
                      {article.quality_score !== null && article.quality_score !== undefined && (
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant={article.quality_score >= 70 ? "default" : "secondary"}>
                            Kalite Skoru: {article.quality_score}/100
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">SEO Ayarları</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="seo_title">SEO Başlık</Label>
                        <Input
                          id="seo_title"
                          value={article.seo_title || ""}
                          onChange={(e) => updateArticle({ seo_title: e.target.value })}
                          placeholder="SEO için optimize edilmiş başlık..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="seo_description">SEO Açıklama</Label>
                        <Textarea
                          id="seo_description"
                          value={article.seo_description || ""}
                          onChange={(e) => updateArticle({ seo_description: e.target.value })}
                          rows={3}
                          placeholder="SEO için optimize edilmiş açıklama (150-160 karakter)..."
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {(article.seo_description || "").length} / 160 karakter
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="seo_keywords">SEO Anahtar Kelimeler</Label>
                        <Input
                          id="seo_keywords"
                          value={article.seo_keywords?.join(", ") || ""}
                          onChange={(e) =>
                            updateArticle({
                              seo_keywords: e.target.value
                                .split(",")
                                .map((k) => k.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="anahtar, kelime, listesi"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Görseller</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="cover_image">Kapak Görseli URL</Label>
                        <Input
                          id="cover_image"
                          value={article.cover_image || ""}
                          onChange={(e) => updateArticle({ cover_image: e.target.value })}
                          placeholder="https://..."
                        />
                        {article.cover_image && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-border">
                            <img
                              src={article.cover_image}
                              alt="Cover"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="og_image">OG Görsel URL</Label>
                        <Input
                          id="og_image"
                          value={article.og_image || ""}
                          onChange={(e) => updateArticle({ og_image: e.target.value })}
                          placeholder="https://..."
                        />
                        {article.og_image && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-border">
                            <img
                              src={article.og_image}
                              alt="OG Image"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Yayın Ayarları</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="featured">Öne Çıkan</Label>
                          <p className="text-sm text-muted-foreground">
                            Ana sayfada öne çıkan haber olarak göster
                          </p>
                        </div>
                        <Switch
                          id="featured"
                          checked={article.featured}
                          onCheckedChange={(checked) => updateArticle({ featured: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <ContentScheduler
                    type="news"
                    contentId={article.id}
                    currentSchedule={article.scheduled_publish_at}
                    onScheduleChange={async () => {
                      const response = await fetch(`/api/news/${article.id}`);
                      const data = await response.json();
                      if (data.success && data.article) {
                        setArticle(data.article);
                      }
                    }}
                  />
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4 mt-4">
                  <VersionHistory
                    contentType="news"
                    contentId={article.id}
                    onRestore={async (versionNumber) => {
                      // Reload article after restore
                      const response = await fetch(`/api/news/${article.id}`);
                      const data = await response.json();
                      if (data.success && data.article) {
                        setArticle(data.article);
                        toast.success(`Versiyon ${versionNumber}'e geri dönüldü`);
                      }
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Split Resize Handle */}
        {viewMode === "split" && (
          <div className="w-1 bg-border hover:bg-design-light/20 cursor-col-resize transition-colors relative group">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 group-hover:bg-design-light/10" />
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={cn(
              "flex flex-col bg-muted/30 overflow-hidden transition-all duration-300",
              viewMode === "split" ? "w-1/2" : "w-full"
            )}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Önizleme</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {previewDevice === "desktop" ? "Masaüstü" : previewDevice === "tablet" ? "Tablet" : "Mobil"}
                </Badge>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <PreviewContent />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
