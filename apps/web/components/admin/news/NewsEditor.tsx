"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Save,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import { ContentScheduler } from "@/components/content-studio/ContentScheduler";

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
}

interface NewsEditorProps {
  article: NewsArticle;
  locale: string;
}

export function NewsEditor({ article: initialArticle, locale: _locale }: NewsEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle>(initialArticle);
  const [saving, setSaving] = useState(false);

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
      // Refresh article data
      const updatedResponse = await fetch(`/api/news/${article.id}`);
          const updatedData = await updatedResponse.json();
          if (updatedData.success && updatedData.article) {
            setArticle(updatedData.article);
          }
    } catch (error: any) {
      // Save failed, show error toast
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
    await handleSave();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/haberler")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Haber Düzenle</h1>
            <p className="text-muted-foreground mt-1">
              {article.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {article.published && (
            <Link
              href={`http://localhost:3000/haberler/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Görüntüle
              </Button>
            </Link>
          )}
          <Button
            variant={article.published ? "secondary" : "default"}
            onClick={handleTogglePublished}
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
          <Button onClick={handleSave} disabled={saving}>
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
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {article.published ? (
          <Badge variant="default" className="bg-green-500">
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

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={article.title}
              onChange={(e) =>
                setArticle({ ...article, title: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={article.slug}
              onChange={(e) =>
                setArticle({ ...article, slug: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="source_url">Kaynak URL</Label>
            <Input
              id="source_url"
              value={article.source_url || ""}
              onChange={(e) =>
                setArticle({ ...article, source_url: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>İçerik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="original_summary">Özet</Label>
            <Textarea
              id="original_summary"
              value={article.original_summary || ""}
              onChange={(e) =>
                setArticle({ ...article, original_summary: e.target.value })
              }
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="emlak_analysis">Emlak Analizi</Label>
            <Textarea
              id="emlak_analysis"
              value={article.emlak_analysis || ""}
              onChange={(e) =>
                setArticle({ ...article, emlak_analysis: e.target.value })
              }
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo_title">SEO Başlık</Label>
            <Input
              id="seo_title"
              value={article.seo_title || ""}
              onChange={(e) =>
                setArticle({ ...article, seo_title: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="seo_description">SEO Açıklama</Label>
            <Textarea
              id="seo_description"
              value={article.seo_description || ""}
              onChange={(e) =>
                setArticle({ ...article, seo_description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="seo_keywords">SEO Anahtar Kelimeler (virgülle ayırın)</Label>
            <Input
              id="seo_keywords"
              value={article.seo_keywords?.join(", ") || ""}
              onChange={(e) =>
                setArticle({
                  ...article,
                  seo_keywords: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Görseller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cover_image">Kapak Görseli URL</Label>
            <Input
              id="cover_image"
              value={article.cover_image || ""}
              onChange={(e) =>
                setArticle({ ...article, cover_image: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="og_image">OG Görsel URL</Label>
            <Input
              id="og_image"
              value={article.og_image || ""}
              onChange={(e) =>
                setArticle({ ...article, og_image: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ayarlar</CardTitle>
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
              onCheckedChange={(checked) =>
                setArticle({ ...article, featured: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Scheduling */}
      <ContentScheduler
        type="news"
        contentId={article.id}
        currentSchedule={article.scheduled_publish_at}
        onScheduleChange={async () => {
          // Refresh article data
          const response = await fetch(`/api/news/${article.id}`);
          const data = await response.json();
          if (data.success && data.article) {
            setArticle(data.article);
          }
        }}
      />
    </div>
  );
}

