"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Save, Loader2 } from "lucide-react";
import { EnhancedFormField } from "@/components/forms/EnhancedFormField";
import { AutoSaveIndicator } from "@/components/forms/AutoSaveIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import { validateForm, commonValidations } from "@/lib/validation/form-validators";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { ContentQualityReminder } from "@/components/articles/ContentQualityReminder";

interface NewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  meta_description: string;
  seo_keywords: string;
  published: boolean;
  is_breaking: boolean;
  published_at: string | null;
}

interface NewsFormEnhancedProps {
  initialData?: Partial<NewsFormData>;
  newsId?: string;
  locale: string;
  onSave?: (data: NewsFormData) => Promise<void>;
}

export function NewsFormEnhanced({
  initialData,
  newsId,
  locale,
  onSave,
}: NewsFormEnhancedProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<NewsFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    featured_image: initialData?.featured_image || "",
    meta_description: initialData?.meta_description || "",
    seo_keywords: initialData?.seo_keywords || "",
    published: initialData?.published ?? false,
    is_breaking: initialData?.is_breaking ?? false,
    published_at: initialData?.published_at || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema
  const validationSchema = {
    title: commonValidations.title,
    slug: commonValidations.slug,
    excerpt: commonValidations.excerpt,
    meta_description: commonValidations.metaDescription,
  };

  // Auto-save hook
  const { isDirty, isSaving, lastSaved, error: autoSaveError, manualSave } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      if (onSave) {
        await onSave(data);
      } else {
        const response = await fetch(newsId ? `/api/news/${newsId}` : "/api/news", {
          method: newsId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Kayıt başarısız");
        }
      }
    },
    debounceMs: 2000,
    enabled: !!newsId,
  });

  const handleFieldChange = (field: keyof NewsFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSlugGenerate = (slug: string) => {
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData, validationSchema);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error("Lütfen form hatalarını düzeltin");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        const response = await fetch(newsId ? `/api/news/${newsId}` : "/api/news", {
          method: newsId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            published_at: formData.published && !formData.published_at 
              ? new Date().toISOString() 
              : formData.published_at,
          }),
        });

        if (!response.ok) {
          throw new Error("Kayıt başarısız");
        }

        const result = await response.json();
        toast.success(newsId ? "Haber güncellendi" : "Haber oluşturuldu");
        
        if (!newsId && result.data?.id) {
          router.push(`/${locale}/haberler/${result.data.id}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-save indicator */}
      {newsId && (
        <div className="flex items-center justify-end">
          <AutoSaveIndicator
            isDirty={isDirty}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={autoSaveError}
          />
        </div>
      )}

      {/* Content Quality Reminder */}
      <ContentQualityReminder />

      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedFormField
            label="Başlık"
            name="title"
            type="text"
            value={formData.title}
            onChange={(value) => handleFieldChange("title", value)}
            validation={validationSchema.title}
            required
            autoGenerateSlug
            onSlugGenerate={handleSlugGenerate}
            error={errors.title}
            placeholder="Haber başlığı"
          />

          <EnhancedFormField
            label="Slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={(value) => handleFieldChange("slug", value)}
            validation={validationSchema.slug}
            required
            error={errors.slug}
            hint="URL-friendly versiyonu (örn: haber-basligi)"
            placeholder="haber-basligi"
          />

          <EnhancedFormField
            label="Özet"
            name="excerpt"
            type="textarea"
            value={formData.excerpt}
            onChange={(value) => handleFieldChange("excerpt", value)}
            validation={validationSchema.excerpt}
            error={errors.excerpt}
            hint="Kısa açıklama (maksimum 500 karakter)"
            placeholder="Haber özeti"
          />
        </CardContent>
      </Card>

      <Card className="card-professional">
        <CardHeader>
          <CardTitle>İçerik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedFormField
            label="İçerik"
            name="content"
            type="textarea"
            value={formData.content}
            onChange={(value) => handleFieldChange("content", value)}
            error={errors.content}
            hint="Haber içeriği"
            placeholder="Haber içeriğini buraya yazın..."
          />
        </CardContent>
      </Card>

      <Card className="card-professional">
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedFormField
            label="Meta Açıklama"
            name="meta_description"
            type="textarea"
            value={formData.meta_description}
            onChange={(value) => handleFieldChange("meta_description", value)}
            validation={validationSchema.meta_description}
            error={errors.meta_description}
            hint="Arama motorları için açıklama (maksimum 160 karakter)"
            placeholder="SEO açıklaması"
          />

          <EnhancedFormField
            label="SEO Anahtar Kelimeler"
            name="seo_keywords"
            type="text"
            value={formData.seo_keywords}
            onChange={(value) => handleFieldChange("seo_keywords", value)}
            error={errors.seo_keywords}
            hint="Virgülle ayrılmış anahtar kelimeler"
            placeholder="anahtar, kelime, liste"
          />
        </CardContent>
      </Card>

      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Ayarlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-design-dark dark:text-white">
                Yayınla
              </label>
              <p className="text-xs text-design-gray dark:text-gray-400">
                Haberi hemen yayınla
              </p>
            </div>
            <Switch
              checked={formData.published}
              onCheckedChange={(checked) => {
                handleFieldChange("published", checked);
                if (checked && !formData.published_at) {
                  handleFieldChange("published_at", new Date().toISOString());
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-design-dark dark:text-white">
                Acil Haber
              </label>
              <p className="text-xs text-design-gray dark:text-gray-400">
                Öne çıkan acil haber olarak işaretle
              </p>
            </div>
            <Switch
              checked={formData.is_breaking}
              onCheckedChange={(checked) => handleFieldChange("is_breaking", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isSaving}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {newsId ? "Güncelle" : "Oluştur"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
