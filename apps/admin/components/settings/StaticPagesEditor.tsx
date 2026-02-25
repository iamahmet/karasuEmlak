"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { FileText, Save, Plus, Edit2, Eye, Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  locale: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

type StaticPageTemplateKey = "career" | "references";

const STATIC_PAGE_TEMPLATES: Record<
  StaticPageTemplateKey,
  {
    slug: string;
    title: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    content: string;
  }
> = {
  career: {
    slug: "hakkimizda/kariyer",
    title: "Kariyer",
    meta_title: "Kariyer | Karasu Emlak",
    meta_description:
      "Karasu Emlak kariyer fırsatları, açık pozisyonlar ve başvuru süreci hakkında bilgiler.",
    meta_keywords: "karasu emlak kariyer, emlak danışmanı iş ilanı, sakarya emlak kariyer",
    content: `
<h2>Karasu Emlak'ta Kariyer</h2>
<p>Gayrimenkul sektöründe büyüyen ekibimize katılmak isteyen adaylarla tanışmak istiyoruz.</p>
<h3>Neden Biz?</h3>
<ul>
  <li>Bölgesel uzmanlık ve güçlü marka bilinirliği</li>
  <li>Sürekli eğitim ve mentorluk desteği</li>
  <li>Performans odaklı, şeffaf çalışma kültürü</li>
</ul>
<h3>Başvuru Süreci</h3>
<p>Özgeçmişinizi ve kısa ön yazınızı <strong>info@karasuemlak.net</strong> adresine iletebilirsiniz.</p>
<p>Başvurular değerlendirme sırasına göre dönüş yapılacaktır.</p>
`.trim(),
  },
  references: {
    slug: "hakkimizda/referanslar",
    title: "Referanslar",
    meta_title: "Referanslar | Karasu Emlak",
    meta_description:
      "Karasu Emlak müşteri deneyimleri, tamamlanan işlemler ve hizmet referansları.",
    meta_keywords: "karasu emlak referanslar, emlak müşteri yorumları, sakarya emlak danışmanlığı",
    content: `
<h2>Referanslarımız</h2>
<p>Karasu ve çevresinde satış, kiralama ve yatırım danışmanlığı süreçlerinde destek verdiğimiz müşterilerimizin memnuniyeti önceliğimizdir.</p>
<h3>Hizmet Verdiğimiz Alanlar</h3>
<ul>
  <li>Satılık daire ve villa danışmanlığı</li>
  <li>Arsa ve yatırım fırsatı analizi</li>
  <li>Kiralama ve portföy yönetimi desteği</li>
</ul>
<h3>Kurumsal İş Birlikleri</h3>
<p>Kurumsal ve bireysel müşterilerimizle yürüttüğümüz çalışmalar için detaylı referans listesi talep üzerine paylaşılabilir.</p>
`.trim(),
  },
};

function createEmptyStaticPage(locale: string): StaticPage {
  return {
    id: "",
    slug: "",
    title: "",
    locale,
    content: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_published: true,
    created_at: "",
    updated_at: "",
  };
}

export function StaticPagesEditor({ locale }: { locale: string }) {
  const router = useRouter();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchPages();
  }, [locale]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/static-pages?locale=${locale}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Sayfalar yüklenemedi");
      }
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error: any) {
      // If table doesn't exist, show empty state
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPage) return;

    // Validation
    if (!editingPage.slug || !editingPage.title) {
      toast.error("Slug ve başlık zorunludur");
      return;
    }

    setSaving(true);
    try {
      const url = `/api/static-pages`;
      const method = editingPage.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPage),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sayfa kaydedilemedi");
      }

      toast.success(editingPage.id ? "Sayfa başarıyla güncellendi" : "Sayfa başarıyla oluşturuldu");
      
      // Revalidate web app cache
      try {
        const { revalidateStaticPage } = await import("@/lib/web-app/revalidate");
        await revalidateStaticPage(editingPage.slug, locale);
      } catch (error) {
        // Revalidation is optional, fail silently
        // Error logged only in development via error handler
      }
      
      setShowEditor(false);
      setEditingPage(null);
      await fetchPages();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Sayfa kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page: StaticPage) => {
    try {
      setEditingPage({ ...page });
      setShowEditor(true);
      // Scroll to editor
      setTimeout(() => {
        const editor = document.querySelector('[data-editor="static-page-editor"]');
        if (editor) {
          editor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      // Error handled silently - user can retry
    }
  };

  const handleNew = () => {
    try {
      setEditingPage(createEmptyStaticPage(locale));
      setShowEditor(true);
    } catch (error) {
      // New handler error, continue silently
    }
  };

  const handleCreateFromTemplate = (templateKey: StaticPageTemplateKey) => {
    try {
      const template = STATIC_PAGE_TEMPLATES[templateKey];
      const existingPage = pages.find((page) => page.locale === locale && page.slug === template.slug);

      if (existingPage) {
        handleEdit(existingPage);
        toast.info(`${template.title} sayfası zaten var, düzenleme ekranı açıldı`);
        return;
      }

      setEditingPage({
        ...createEmptyStaticPage(locale),
        slug: template.slug,
        title: template.title,
        meta_title: template.meta_title,
        meta_description: template.meta_description,
        meta_keywords: template.meta_keywords,
        content: template.content,
      });
      setShowEditor(true);
      setTimeout(() => {
        const editor = document.querySelector('[data-editor="static-page-editor"]');
        if (editor) {
          editor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      toast.error("Şablon hazırlanamadı");
    }
  };

  if (loading) {
    return (
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="h-4 skeleton-professional rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pages List */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Statik Sayfalar
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCreateFromTemplate("career")}
                className="h-9 rounded-xl"
              >
                Kariyer Şablonu
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCreateFromTemplate("references")}
                className="h-9 rounded-xl"
              >
                Referanslar Şablonu
              </Button>
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
                Yeni Sayfa
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-ui">
                Henüz sayfa yok
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:border-design-light transition-all cursor-pointer group"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // Don't trigger if clicking on buttons or links
                    if (target.closest('button') || target.closest('a')) {
                      return;
                    }
                    handleEdit(page);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {page.title}
                      </h3>
                      <span className="text-xs text-muted-foreground font-ui">
                        /{page.slug}
                      </span>
                      {page.is_published ? (
                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded font-ui">
                          Yayında
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 rounded font-ui">
                          Taslak
                        </span>
                      )}
                    </div>
                    {page.meta_description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {page.meta_description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Web app URL'ini oluştur (admin:3001 -> web:3000)
                        const baseUrl = typeof window !== "undefined" 
                          ? window.location.origin.replace(":3001", ":3000")
                          : "http://localhost:3000";
                        const url = `${baseUrl}/${locale}/${page.slug}`;
                        window.open(url, "_blank");
                      }}
                      className="inline-flex items-center justify-center h-9 rounded-xl px-3 text-xs border-2 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-design-light dark:hover:border-design-light hover:shadow-md hover:scale-105 transition-all duration-300 relative z-10"
                      title="Görüntüle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(page);
                      }}
                      className="inline-flex items-center justify-center h-9 rounded-xl px-3 text-xs border-2 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-design-light dark:hover:border-design-light hover:shadow-md hover:scale-105 transition-all duration-300 relative z-10"
                      title="Düzenle"
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

      {/* Editor Modal */}
      {showEditor && editingPage && (
        <div 
          className="modal-backdrop flex items-center justify-center p-4" 
          aria-hidden={!showEditor}
          onClick={(e) => {
            // Only close if clicking directly on backdrop (not on modal content)
            if (e.target === e.currentTarget) {
              setShowEditor(false);
              setEditingPage(null);
            }
          }}
        >
          <Card 
            className="modal-content card-professional w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl shadow-2xl"
            data-editor="static-page-editor"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 px-5 pt-5 sticky top-0 bg-card/95 backdrop-blur-xl z-10 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-primary" />
                  {editingPage.id ? "Sayfa Düzenle" : "Yeni Sayfa"}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingPage(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slug" className="text-xs font-ui font-semibold">
                  Slug (URL)
                </Label>
                <Input
                  id="slug"
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                  className="input-modern mt-1"
                  placeholder="hakkimizda"
                />
              </div>
              <div>
                <Label htmlFor="title" className="text-xs font-ui font-semibold">
                  Başlık
                </Label>
                <Input
                  id="title"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="input-modern mt-1"
                  placeholder="Hakkımızda"
                />
              </div>
            </div>
            <div>
              <RichTextEditor
                label="İçerik"
                value={editingPage.content}
                onChange={(value) => setEditingPage({ ...editingPage, content: value })}
                placeholder="Sayfa içeriğini buraya yazın..."
              />
            </div>
            <div>
              <Label htmlFor="meta_title" className="text-xs font-ui font-semibold">
                Meta Başlık
              </Label>
              <Input
                id="meta_title"
                value={editingPage.meta_title || ""}
                onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                className="input-modern mt-1"
                placeholder="Hakkımızda | Karasu Emlak"
              />
            </div>
            <div>
              <Label htmlFor="meta_description" className="text-xs font-ui font-semibold">
                Meta Açıklama
              </Label>
              <Textarea
                id="meta_description"
                value={editingPage.meta_description || ""}
                onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                rows={3}
                className="input-modern mt-1"
                placeholder="Sayfa açıklaması..."
              />
            </div>
            <div>
              <Label htmlFor="meta_keywords" className="text-xs font-ui font-semibold">
                Meta Anahtar Kelimeler
              </Label>
              <Input
                id="meta_keywords"
                value={editingPage.meta_keywords || ""}
                onChange={(e) => setEditingPage({ ...editingPage, meta_keywords: e.target.value })}
                className="input-modern mt-1"
                placeholder="kelime1, kelime2, kelime3"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="is_published" className="text-xs font-ui font-semibold">
                  Yayınla
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Sayfayı yayınla
                </p>
              </div>
              <Switch
                id="is_published"
                checked={editingPage.is_published}
                onCheckedChange={(checked) =>
                  setEditingPage({ ...editingPage, is_published: checked })
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditor(false);
                  setEditingPage(null);
                }}
                className="hover-scale micro-bounce rounded-xl"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}
