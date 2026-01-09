"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Save, Loader2 } from "lucide-react";
import { EnhancedFormField } from "@/components/forms/EnhancedFormField";
import { AutoSaveIndicator } from "@/components/forms/AutoSaveIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import { validateForm, commonValidations } from "@/lib/validation/form-validators";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  seo_keywords: string;
  featured_image: string;
  category_id: string;
  status: "draft" | "published";
  is_featured: boolean;
  is_breaking: boolean;
}

interface ArticleFormEnhancedProps {
  initialData?: Partial<ArticleFormData>;
  articleId?: string;
  locale: string;
  onSave?: (data: ArticleFormData) => Promise<void>;
}

export function ArticleFormEnhanced({
  initialData,
  articleId,
  locale,
  onSave,
}: ArticleFormEnhancedProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ArticleFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    meta_description: initialData?.meta_description || "",
    seo_keywords: initialData?.seo_keywords || "",
    featured_image: initialData?.featured_image || "",
    category_id: initialData?.category_id || "",
    status: initialData?.status || "draft",
    is_featured: initialData?.is_featured || false,
    is_breaking: initialData?.is_breaking || false,
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
        // Default save implementation
        const response = await fetch(articleId ? `/api/articles/${articleId}` : "/api/articles", {
          method: articleId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Kayıt başarısız");
        }
      }
    },
    debounceMs: 2000,
    enabled: !!articleId, // Only auto-save for existing articles
  });

  const handleFieldChange = (field: keyof ArticleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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

    // Validate form
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
        const response = await fetch(articleId ? `/api/articles/${articleId}` : "/api/articles", {
          method: articleId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Kayıt başarısız");
        }

        const result = await response.json();
        toast.success(articleId ? "Makale güncellendi" : "Makale oluşturuldu");
        
        if (!articleId && result.data?.id) {
          router.push(`/${locale}/articles/${result.data.id}`);
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
      {articleId && (
        <div className="flex items-center justify-end">
          <AutoSaveIndicator
            isDirty={isDirty}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={autoSaveError}
          />
        </div>
      )}

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
            placeholder="Makale başlığı"
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
            hint="URL-friendly versiyonu (örn: makale-basligi)"
            placeholder="makale-basligi"
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
            placeholder="Makale özeti"
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
              {articleId ? "Güncelle" : "Oluştur"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
