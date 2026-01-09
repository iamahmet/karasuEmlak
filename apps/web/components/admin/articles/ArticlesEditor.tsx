"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { FileText, Save, Plus, Edit2, Eye, Loader2, X, ExternalLink } from "lucide-react";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { ContentTemplates } from "./ContentTemplates";
import { AIContentGenerator } from "./AIContentGenerator";
import { MediaLibraryButton } from "@/components/content-studio/MediaLibraryButton";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@karasu/lib/supabase/client";
import { Link } from "@/i18n/routing";

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
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticlesEditorProps {
  locale?: string;
  articleId?: string;
  showList?: boolean;
}

export function ArticlesEditor({ locale = "tr", articleId, showList = false }: ArticlesEditorProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [showEditor, setShowEditor] = useState(!!articleId || !showList);

  useEffect(() => {
    if (showList) {
      fetchArticles();
    }
    fetchCategories();
    
    // If articleId is provided, load that article
    if (articleId) {
      fetchArticle(articleId);
    } else if (!showList) {
      // New article mode
      handleNew();
    }
  }, [locale, articleId, showList]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        // Categories table might not exist
        setCategories([]);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      // Categories fetch failed
      setCategories([]);
    }
  };

  const fetchArticle = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Makale yüklenemedi");
      }
      const data = await response.json();
      if (data.success && data.data?.article) {
        setEditingArticle(data.data.article);
      } else {
        throw new Error("Makale bulunamadı");
      }
    } catch (error: any) {
      toast.error(error.message || "Makale yüklenemedi");
      router.push(`/${locale}/articles`);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles?locale=${locale}&limit=100`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Haberler yüklenemedi");
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error: any) {
      // Articles fetch failed, continue with empty state
      toast.error(error.message || "Haberler yüklenemedi");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingArticle) return;

    // Validation
    if (!editingArticle.slug || !editingArticle.title || !editingArticle.content) {
      toast.error("Slug, başlık ve içerik zorunludur");
      return;
    }

    setSaving(true);
    try {
      const url = editingArticle.id ? `/api/articles/${editingArticle.id}` : `/api/articles`;
      const method = editingArticle.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingArticle,
          locale,
          categorySlug: editingArticle.category_slug,
          categoryId: editingArticle.category_id,
          isPublished: editingArticle.is_published,
          isFeatured: editingArticle.is_featured,
          isBreaking: editingArticle.is_breaking,
          metaDescription: editingArticle.meta_description,
          seoKeywords: editingArticle.seo_keywords,
          featuredImage: editingArticle.featured_image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Haber kaydedilemedi");
      }

      toast.success(editingArticle.id ? "Makale başarıyla güncellendi" : "Makale başarıyla oluşturuldu");
      
      // Revalidate web app cache if published
      if (editingArticle.is_published && editingArticle.slug) {
        try {
          const { revalidateArticle } = await import("@/lib/web-app/revalidate");
          await revalidateArticle(editingArticle.slug, locale);
        } catch (error) {
          // Revalidation failed, non-critical
        }
      }
      
      // If in standalone editor mode (not showList), redirect to articles list
      if (!showList) {
        router.push(`/${locale}/articles`);
        return;
      }
      
      setShowEditor(false);
      setEditingArticle(null);
      await fetchArticles();
    } catch (error: any) {
      // Save failed, show error toast
      toast.error(error.message || "Haber kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle({ ...article });
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditingArticle({
      id: "",
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      featured_image: null,
      category_id: null,
      category_slug: null,
      author: "Karasu Emlak",
      is_published: false,
      is_featured: false,
      is_breaking: false,
      meta_description: "",
      seo_keywords: "",
      published_at: null,
      created_at: "",
      updated_at: "",
    });
    setShowEditor(true);
  };

  const generateSlug = (title: string) => {
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
  };

  if (loading && (articleId || !showList)) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 skeleton-professional rounded-lg w-1/3"></div>
            <div className="h-4 skeleton-professional rounded-lg w-2/3"></div>
            <div className="h-32 skeleton-professional rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Articles List - Only show if showList is true */}
      {showList && (
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-design-light" />
              Haberler
            </CardTitle>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNew();
              }}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl inline-flex items-center justify-center px-4 py-2 font-medium transition-all duration-200 relative z-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Haber
            </button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-design-gray dark:text-gray-400" />
              <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                Henüz haber yok
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border border-[#E7E7E7] dark:border-[#062F28] rounded-lg hover:border-design-light transition-all cursor-pointer group"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // Don't trigger if clicking on buttons or links
                    if (target.closest('button') || target.closest('a')) {
                      return;
                    }
                    handleEdit(article);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-display font-bold text-design-dark dark:text-white group-hover:text-design-light transition-colors truncate">
                        {article.title}
                      </h3>
                      <span className="text-xs text-design-gray dark:text-gray-400 font-ui">
                        /{article.slug}
                      </span>
                      {article.is_published ? (
                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded font-ui">
                          Yayında
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 rounded font-ui">
                          Taslak
                        </span>
                      )}
                      {article.is_featured && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded font-ui">
                          Öne Çıkan
                        </span>
                      )}
                      {article.is_breaking && (
                        <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded font-ui">
                          Son Dakika
                        </span>
                      )}
                    </div>
                    {article.excerpt && (
                      <p className="text-xs text-design-gray dark:text-gray-400 mt-1 line-clamp-1">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/${locale}/articles/${article.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center h-9 rounded-xl px-3 text-xs border-2 border-[#E7E7E7] dark:border-[#0a3d35] bg-background/80 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-design-light dark:hover:border-design-light hover:shadow-md hover:scale-105 transition-all duration-300 relative z-10"
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    {article.is_published ? (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const baseUrl = typeof window !== "undefined" 
                            ? window.location.origin.replace(":3001", ":3000")
                            : "http://localhost:3000";
                          const url = `${baseUrl}/${locale}/haber/${article.slug}`;
                          window.open(url, "_blank");
                        }}
                        className="inline-flex items-center justify-center h-9 rounded-xl px-3 text-xs border-2 border-[#E7E7E7] dark:border-[#0a3d35] bg-background/80 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-design-light dark:hover:border-design-light hover:shadow-md hover:scale-105 transition-all duration-300 relative z-10"
                        title="Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            // Generate preview token
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
                              window.open(url, "_blank");
                            } else {
                              toast.error("Preview link oluşturulamadı");
                            }
                          } catch (error) {
                            // Preview error, non-critical
                            toast.error("Preview link oluşturulamadı");
                          }
                        }}
                        className="inline-flex items-center justify-center h-9 rounded-xl px-3 text-xs border-2 border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:border-yellow-600 dark:hover:border-yellow-500 hover:shadow-md hover:scale-105 transition-all duration-300 relative z-10"
                        title="Taslak Önizleme"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(article);
                      }}
                      className="inline-flex items-center justify-center h-9 rounded-xl px-3 text-xs border-2 border-[#E7E7E7] dark:border-[#0a3d35] bg-background/80 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-design-light dark:hover:border-design-light hover:shadow-md hover:scale-105 transition-all duration-300 relative z-10"
                      title="Düzenle"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Editor - Show as modal if showList, otherwise as full page */}
      {showEditor && editingArticle && (
        <div 
          className={showList ? "modal-backdrop flex items-center justify-center p-4" : ""}
          aria-hidden={!showEditor}
          onClick={showList ? (e) => {
            if (e.target === e.currentTarget) {
              setShowEditor(false);
              setEditingArticle(null);
            }
          } : undefined}
        >
          <Card 
            className={`card-professional w-full ${showList ? "max-w-4xl max-h-[90vh] overflow-y-auto modal-content shadow-2xl" : ""} bg-white dark:bg-[#0a3d35]`}
            data-editor="article-editor"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 px-5 pt-5 sticky top-0 bg-white dark:bg-[#0a3d35] z-10 border-b border-[#E7E7E7] dark:border-[#062F28]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-design-light" />
                  {editingArticle.id ? "Makale Düzenle" : "Yeni Makale"}
                </CardTitle>
                {showList && (
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingArticle(null);
                  }}
                  className="text-design-gray dark:text-gray-400 hover:text-design-dark dark:hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>
                )}
                {!showList && (
                <Link
                  href={`/${locale}/articles`}
                  className="text-design-gray dark:text-gray-400 hover:text-design-dark dark:hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ← Listeye Dön
                </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {/* Content Templates - Only for new articles */}
              {!editingArticle.id && (
                <>
                  <ContentTemplates
                    onSelect={(template) => {
                      setEditingArticle({
                        ...editingArticle,
                        title: template.structure.title || editingArticle.title || "",
                        content: template.structure.content || editingArticle.content || "",
                        excerpt: template.structure.excerpt || editingArticle.excerpt || "",
                      });
                      toast.success(`${template.name} şablonu uygulandı`);
                    }}
                  />

                  <AIContentGenerator
                    onGenerate={(generated) => {
                      setEditingArticle({
                        ...editingArticle,
                        title: generated.title,
                        content: generated.content,
                        excerpt: generated.excerpt,
                        meta_description: generated.metaDescription,
                        seo_keywords: generated.keywords,
                      });
                    }}
                  />
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-xs font-ui font-semibold">
                    Başlık
                  </Label>
                  <Input
                    id="title"
                    value={editingArticle.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingArticle({ 
                        ...editingArticle, 
                        title,
                        slug: editingArticle.slug || generateSlug(title)
                      });
                    }}
                    className="input-modern mt-1"
                    placeholder="Haber başlığı"
                  />
                </div>
                <div>
                  <Label htmlFor="slug" className="text-xs font-ui font-semibold">
                    Slug (URL)
                  </Label>
                  <Input
                    id="slug"
                    value={editingArticle.slug || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    className="input-modern mt-1"
                    placeholder="haber-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-xs font-ui font-semibold">
                  Kategori
                </Label>
                <Select
                  value={editingArticle.category_slug || ""}
                  onValueChange={(value) => {
                    const category = categories.find(c => c.slug === value);
                    setEditingArticle({ 
                      ...editingArticle, 
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

              <div>
                <Label htmlFor="excerpt" className="text-xs font-ui font-semibold">
                  Özet
                </Label>
                <Textarea
                  id="excerpt"
                  value={editingArticle.excerpt || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  rows={3}
                  className="input-modern mt-1"
                  placeholder="Haber özeti..."
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-xs font-ui font-semibold">
                  İçerik
                </Label>
                <RichTextEditor
                  value={editingArticle.content || ""}
                  onChange={(value) => setEditingArticle({ ...editingArticle, content: value })}
                  placeholder="Haber içeriğini buraya yazın..."
                />
              </div>

              <div>
                <Label htmlFor="featured_image" className="text-xs font-ui font-semibold">
                  Öne Çıkan Görsel
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="featured_image"
                    value={editingArticle.featured_image || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, featured_image: e.target.value })}
                    className="input-modern flex-1"
                    placeholder="https://... veya medya kütüphanesinden seçin"
                  />
                  <MediaLibraryButton
                    onSelect={(media) => {
                      setEditingArticle({ ...editingArticle, featured_image: media.url });
                      toast.success("Görsel seçildi");
                    }}
                  />
                </div>
                {editingArticle.featured_image && (
                  <div className="mt-2">
                    <img
                      src={editingArticle.featured_image}
                      alt="Featured"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-[#E7E7E7] dark:border-[#062F28]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="meta_description" className="text-xs font-ui font-semibold">
                  Meta Açıklama
                </Label>
                <Textarea
                  id="meta_description"
                  value={editingArticle.meta_description || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, meta_description: e.target.value })}
                  rows={3}
                  className="input-modern mt-1"
                  placeholder="SEO meta açıklaması..."
                />
              </div>

              <div>
                <Label htmlFor="seo_keywords" className="text-xs font-ui font-semibold">
                  SEO Anahtar Kelimeler
                </Label>
                <Input
                  id="seo_keywords"
                  value={editingArticle.seo_keywords || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, seo_keywords: e.target.value })}
                  className="input-modern mt-1"
                  placeholder="kelime1, kelime2, kelime3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                  <div>
                    <Label htmlFor="is_published" className="text-xs font-ui font-semibold">
                      Yayınla
                    </Label>
                    <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                      Haberi yayınla
                    </p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={editingArticle.is_published || false}
                    onCheckedChange={(checked) =>
                      setEditingArticle({ ...editingArticle, is_published: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                  <div>
                    <Label htmlFor="is_featured" className="text-xs font-ui font-semibold">
                      Öne Çıkan
                    </Label>
                    <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                      Ana sayfada göster
                    </p>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={editingArticle.is_featured || false}
                    onCheckedChange={(checked) =>
                      setEditingArticle({ ...editingArticle, is_featured: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                  <div>
                    <Label htmlFor="is_breaking" className="text-xs font-ui font-semibold">
                      Son Dakika
                    </Label>
                    <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                      Son dakika haberi
                    </p>
                  </div>
                  <Switch
                    id="is_breaking"
                    checked={editingArticle.is_breaking || false}
                    onCheckedChange={(checked) =>
                      setEditingArticle({ ...editingArticle, is_breaking: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-design-gray dark:text-gray-400 hover:text-design-dark dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

