"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
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
  Search,
  BarChart3,
  Settings,
  Zap,
  X
} from "lucide-react";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { ImageUpload } from "@/components/content-studio/ImageUpload";
import { MediaLibraryButton } from "@/components/content-studio/MediaLibraryButton";
import { toast } from "sonner";
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

export function ArticleEditor({ article: initialArticle, categories, locale }: ArticleEditorProps) {
  const [article, setArticle] = useState<Article>(initialArticle);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Auto-save with debounce
  const debouncedSave = useDebouncedCallback(
    async (articleData: Article) => {
      if (!isDirty) return;
      
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

  // Auto-save on change
  useEffect(() => {
    if (isDirty) {
      debouncedSave(article);
    }
  }, [article, isDirty, debouncedSave]);

  // Generate slug from title (Turkish İ must be replaced before toLowerCase)
  const generateSlug = useCallback((title: string) => {
    return title
      .replace(/İ/g, "i")
      .replace(/I/g, "i")
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

  // Calculate reading time
  const calculateReadingTime = useCallback((content: string): number => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = textContent.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }, []);

  const handleSave = async () => {
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
      });

      const data = await response.json();

      if (!response.ok) {
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

  const updateArticle = (updates: Partial<Article>) => {
    setArticle(prev => {
      const updated = { ...prev, ...updates };
      
      // Auto-generate slug if title changed and slug is empty
      if (updates.title && !updated.slug) {
        updated.slug = generateSlug(updates.title);
      }
      
      // Calculate reading time if content changed
      if (updates.content) {
        updated.reading_time = calculateReadingTime(updates.content);
      }
      
      return updated;
    });
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Haber Düzenle
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {lastSaved && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Son kayıt: {lastSaved.toLocaleTimeString("tr-TR")}
              </span>
            )}
            {isDirty && (
              <span className="flex items-center gap-1 text-yellow-500">
                <AlertCircle className="h-4 w-4" />
                Kaydedilmemiş değişiklikler
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Okuma süresi: {article.reading_time} dakika
            </span>
            {article.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views.toLocaleString()} görüntülenme
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {article.is_published ? (
            <>
              <button
                type="button"
                onClick={handleUnpublish}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                className="px-4 py-2 text-sm font-medium text-white bg-design-light rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
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
                className="px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Önizle
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Yayınla
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-display font-bold text-foreground">
                Önizleme
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPreviewUrl(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Editor */}
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

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="text-base font-display font-bold text-foreground">
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-xs font-ui font-semibold">
                  Başlık *
                </Label>
                <Input
                  id="title"
                  value={article.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    updateArticle({ title });
                    if (!article.slug) {
                      updateArticle({ slug: generateSlug(title) });
                    }
                  }}
                  className="input-modern mt-1 text-lg"
                  placeholder="Haber başlığı"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug" className="text-xs font-ui font-semibold">
                    Slug (URL) *
                  </Label>
                  <Input
                    id="slug"
                    value={article.slug}
                    onChange={(e) => updateArticle({ slug: e.target.value })}
                    className="input-modern mt-1 font-mono text-sm"
                    placeholder="haber-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-xs font-ui font-semibold">
                    Kategori
                  </Label>
                  <Select
                    value={article.category_slug || ""}
                    onValueChange={(value) => {
                      const category = categories.find(c => c.slug === value);
                      updateArticle({ 
                        category_slug: value,
                        category_id: category?.id || null
                      });
                    }}
                  >
                    <SelectTrigger className="input-modern mt-1">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-xs font-ui font-semibold">
                  Özet
                </Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt || ""}
                  onChange={(e) => updateArticle({ excerpt: e.target.value })}
                  rows={3}
                  className="input-modern mt-1"
                  placeholder="Haber özeti (150-160 karakter önerilir)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {article.excerpt?.length || 0} karakter
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="text-base font-display font-bold text-foreground">
                İçerik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={article.content}
                onChange={(value) => updateArticle({ content: value })}
                placeholder="Haber içeriğini buraya yazın..."
              />
            </CardContent>
          </Card>

          <Card className="card-professional">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display font-bold text-foreground">
                  Öne Çıkan Görsel
                </CardTitle>
                <MediaLibraryButton
                  onSelect={(url) => updateArticle({ featured_image: url })}
                  className="h-8 px-3 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onUpload={(url) => updateArticle({ featured_image: url })}
                currentImage={article.featured_image || undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="text-base font-display font-bold text-foreground">
                SEO Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="SEO meta açıklaması (150-160 karakter önerilir)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {article.meta_description?.length || 0} karakter
                  {article.meta_description && article.meta_description.length < 150 && (
                    <span className="text-yellow-500 ml-2">⚠️ 150 karakterden kısa</span>
                  )}
                  {article.meta_description && article.meta_description.length > 160 && (
                    <span className="text-red-500 ml-2">⚠️ 160 karakterden uzun</span>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Virgülle ayrılmış anahtar kelimeler
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  SEO İpuçları
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Meta açıklama 150-160 karakter arasında olmalı</li>
                  <li>Anahtar kelimeleri doğal bir şekilde kullanın</li>
                  <li>Başlıkta anahtar kelimeyi kullanın</li>
                  <li>İçerikte alt başlıklar (H2, H3) kullanın</li>
                  <li>Görseller için alt text ekleyin</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
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
                    <Label htmlFor="is_published" className="text-sm font-ui font-semibold">
                      Yayınla
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
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
                    <p className="text-xs text-muted-foreground mt-1">
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
                    <p className="text-xs text-muted-foreground mt-1">
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

              {article.published_at && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
              <CardTitle className="text-base font-display font-bold text-foreground">
                İstatistikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-card/95 backdrop-blur-xl border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Görüntülenme</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {article.views.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-card/95 backdrop-blur-xl border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Okuma Süresi</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {article.reading_time} dk
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-card/95 backdrop-blur-xl border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Kelime Sayısı</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {article.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(w => w.length > 0).length.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

