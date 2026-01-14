"use client";

import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import {
  FileText,
  Link2,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { EnhancedFormField } from "@/components/forms/EnhancedFormField";
import { ImageUpload } from "@/components/content-studio/ImageUpload";
import { ContentQualityReminder } from "@/components/articles/ContentQualityReminder";

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

interface ArticleFormFieldsProps {
  article: Article;
  categories: Category[];
  onUpdate: (updates: Partial<Article>) => void;
  generateSlug: (title: string) => string;
  locale: string;
}

export function ArticleFormFields({
  article,
  categories,
  onUpdate,
  generateSlug,
  locale,
}: ArticleFormFieldsProps) {
  const titleLength = article.title.length;
  const excerptLength = article.excerpt?.length || 0;
  const metaDescriptionLength = article.meta_description?.length || 0;

  return (
    <div className="space-y-6">
      {/* Content Quality Reminder */}
      <ContentQualityReminder />

      {/* Title & Slug Section */}
      <Card className="card-professional border-2 border-slate-200/80 dark:border-[#0a3d35]/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-design-light" />
            Başlık ve URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedFormField
            name="title"
            label="Başlık"
            required
            value={article.title}
            onChange={(value) => {
              onUpdate({ title: value });
              if (!article.slug) {
                onUpdate({ slug: generateSlug(value) });
              }
            }}
            placeholder="Makale başlığı"
            type="text"
            validation={{
              minLength: 30,
              maxLength: 60,
              message: "Başlık 30-60 karakter arasında olmalı",
            }}
            hint={`${titleLength} / 60 karakter`}
            className="text-lg font-semibold"
          />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-ui font-semibold mb-2 block">
                Slug (URL) *
              </Label>
              <Input
                value={article.slug}
                onChange={(e) => onUpdate({ slug: e.target.value })}
                className="input-modern mt-1 font-mono text-sm"
                placeholder="makale-slug"
              />
              <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                URL'de görünecek kısım
              </p>
            </div>

            <div>
              <Label className="text-xs font-ui font-semibold mb-2 block">
                Kategori
              </Label>
              <Select
                value={article.category_slug || ""}
                onValueChange={(value) => {
                  const category = categories.find((c) => c.slug === value);
                  onUpdate({
                    category_slug: value,
                    category_id: category?.id || null,
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
              {article.category && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {article.category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excerpt Section */}
      <Card className="card-professional">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-design-light" />
            Özet
            <span className="text-xs font-normal text-design-gray dark:text-gray-400 ml-auto">
              {excerptLength} / 160 karakter
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={article.excerpt || ""}
            onChange={(e) => onUpdate({ excerpt: e.target.value })}
            rows={3}
            className="input-modern"
            placeholder="Makale özeti (150-160 karakter önerilir)"
          />
          <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
            {excerptLength} / 160 karakter - Arama sonuçlarında ve önizlemede görünecek kısa açıklama
          </p>
        </CardContent>
      </Card>

      {/* Featured Image Section */}
      <Card className="card-professional">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-design-light" />
            Öne Çıkan Görsel
            {article.featured_image && (
              <Badge className="ml-auto bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Yüklendi
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ImageUpload
              onUpload={(url) => onUpdate({ featured_image: url })}
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
                  <button
                    type="button"
                    onClick={() => onUpdate({ featured_image: null })}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Settings */}
      <Card className="card-professional">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-design-light" />
            Yayınlama Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0a3d35]/50 border border-slate-200 dark:border-[#0a3d35]">
            <div className="flex items-center gap-3">
              <div>
                <Label className="text-sm font-semibold text-design-dark dark:text-white">
                  Yayında
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400">
                  Makale ziyaretçilere görünür olacak
                </p>
              </div>
            </div>
            <Switch
              checked={article.is_published}
              onCheckedChange={(checked) => onUpdate({ is_published: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0a3d35]/50 border border-slate-200 dark:border-[#0a3d35]">
            <div className="flex items-center gap-3">
              <div>
                <Label className="text-sm font-semibold text-design-dark dark:text-white">
                  Öne Çıkan
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400">
                  Ana sayfada öne çıkan bölümde göster
                </p>
              </div>
            </div>
            <Switch
              checked={article.is_featured}
              onCheckedChange={(checked) => onUpdate({ is_featured: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0a3d35]/50 border border-slate-200 dark:border-[#0a3d35]">
            <div className="flex items-center gap-3">
              <div>
                <Label className="text-sm font-semibold text-design-dark dark:text-white">
                  Son Dakika
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400">
                  Son dakika haberi olarak işaretle
                </p>
              </div>
            </div>
            <Switch
              checked={article.is_breaking}
              onCheckedChange={(checked) => onUpdate({ is_breaking: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Author Section */}
      <Card className="card-professional">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-design-light" />
            Yazar Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-xs font-ui font-semibold mb-2 block">
              Yazar
            </Label>
            <Input
              value={article.author || "Karasu Emlak"}
              onChange={(e) => onUpdate({ author: e.target.value })}
              className="input-modern text-sm"
              placeholder="Yazar adı"
            />
            <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
              Makale yazarının adı
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
