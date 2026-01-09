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

interface ListingFormData {
  title: string;
  slug: string;
  description: string;
  property_type: string;
  status: "satilik" | "kiralik";
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  parking: number;
  floor: number | null;
  building_age: number | null;
  location_neighborhood: string;
  location_district: string;
  location_city: string;
  latitude: number | null;
  longitude: number | null;
  featured_image: string;
  images: string[];
  available: boolean;
  featured: boolean;
}

interface ListingFormEnhancedProps {
  initialData?: Partial<ListingFormData>;
  listingId?: string;
  locale: string;
  onSave?: (data: ListingFormData) => Promise<void>;
}

export function ListingFormEnhanced({
  initialData,
  listingId,
  locale,
  onSave,
}: ListingFormEnhancedProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ListingFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    property_type: initialData?.property_type || "daire",
    status: initialData?.status || "satilik",
    price: initialData?.price || 0,
    area: initialData?.area || 0,
    rooms: initialData?.rooms || 0,
    bathrooms: initialData?.bathrooms || 0,
    parking: initialData?.parking || 0,
    floor: initialData?.floor || null,
    building_age: initialData?.building_age || null,
    location_neighborhood: initialData?.location_neighborhood || "",
    location_district: initialData?.location_district || "Karasu",
    location_city: initialData?.location_city || "Sakarya",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    featured_image: initialData?.featured_image || "",
    images: initialData?.images || [],
    available: initialData?.available ?? true,
    featured: initialData?.featured ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema
  const validationSchema = {
    title: commonValidations.title,
    slug: commonValidations.slug,
    price: commonValidations.price,
    area: commonValidations.area,
    rooms: {
      required: true,
      customValidator: (value: any) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 0 || num > 20) {
          return "Oda sayısı 0-20 arasında olmalı";
        }
      },
    } as FieldValidation,
    bathrooms: {
      required: true,
      customValidator: (value: any) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 0 || num > 10) {
          return "Banyo sayısı 0-10 arasında olmalı";
        }
      },
    } as FieldValidation,
      min: 0,
      max: 10,
    },
    location_neighborhood: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  };

  // Auto-save hook
  const { isDirty, isSaving, lastSaved, error: autoSaveError, manualSave } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      if (onSave) {
        await onSave(data);
      } else {
        const response = await fetch(listingId ? `/api/listings/${listingId}` : "/api/listings", {
          method: listingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Kayıt başarısız");
        }
      }
    },
    debounceMs: 2000,
    enabled: !!listingId,
  });

  const handleFieldChange = (field: keyof ListingFormData, value: any) => {
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
        const response = await fetch(listingId ? `/api/listings/${listingId}` : "/api/listings", {
          method: listingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Kayıt başarısız");
        }

        const result = await response.json();
        toast.success(listingId ? "İlan güncellendi" : "İlan oluşturuldu");
        
        if (!listingId && result.data?.id) {
          router.push(`/${locale}/listings/${result.data.id}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypeOptions = [
    { value: "daire", label: "Daire" },
    { value: "villa", label: "Villa" },
    { value: "ev", label: "Ev" },
    { value: "yazlik", label: "Yazlık" },
    { value: "arsa", label: "Arsa" },
    { value: "isyeri", label: "İşyeri" },
    { value: "dukkan", label: "Dükkan" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-save indicator */}
      {listingId && (
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
            placeholder="İlan başlığı"
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
            hint="URL-friendly versiyonu"
            placeholder="ilan-basligi"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedFormField
              label="Emlak Tipi"
              name="property_type"
              type="select"
              value={formData.property_type}
              onChange={(value) => handleFieldChange("property_type", value)}
              options={propertyTypeOptions}
              required
              error={errors.property_type}
            />

            <EnhancedFormField
              label="Durum"
              name="status"
              type="select"
              value={formData.status}
              onChange={(value) => handleFieldChange("status", value)}
              options={[
                { value: "satilik", label: "Satılık" },
                { value: "kiralik", label: "Kiralık" },
              ]}
              required
              error={errors.status}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Fiyat ve Özellikler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EnhancedFormField
              label="Fiyat (₺)"
              name="price"
              type="number"
              value={formData.price}
              onChange={(value) => handleFieldChange("price", parseFloat(value) || 0)}
              validation={validationSchema.price}
              required
              error={errors.price}
              placeholder="0"
            />

            <EnhancedFormField
              label="Alan (m²)"
              name="area"
              type="number"
              value={formData.area}
              onChange={(value) => handleFieldChange("area", parseFloat(value) || 0)}
              validation={validationSchema.area}
              required
              error={errors.area}
              placeholder="0"
            />

            <EnhancedFormField
              label="Oda Sayısı"
              name="rooms"
              type="number"
              value={formData.rooms}
              onChange={(value) => handleFieldChange("rooms", parseInt(value) || 0)}
              validation={validationSchema.rooms}
              required
              error={errors.rooms}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EnhancedFormField
              label="Banyo Sayısı"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(value) => handleFieldChange("bathrooms", parseInt(value) || 0)}
              validation={validationSchema.bathrooms}
              required
              error={errors.bathrooms}
              placeholder="0"
            />

            <EnhancedFormField
              label="Otopark"
              name="parking"
              type="number"
              value={formData.parking}
              onChange={(value) => handleFieldChange("parking", parseInt(value) || 0)}
              error={errors.parking}
              placeholder="0"
            />

            <EnhancedFormField
              label="Kat"
              name="floor"
              type="number"
              value={formData.floor || ""}
              onChange={(value) => handleFieldChange("floor", value ? parseInt(value) : null)}
              error={errors.floor}
              placeholder="Opsiyonel"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Konum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedFormField
            label="Mahalle"
            name="location_neighborhood"
            type="text"
            value={formData.location_neighborhood}
            onChange={(value) => handleFieldChange("location_neighborhood", value)}
            validation={validationSchema.location_neighborhood}
            required
            error={errors.location_neighborhood}
            placeholder="Mahalle adı"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedFormField
              label="İlçe"
              name="location_district"
              type="text"
              value={formData.location_district}
              onChange={(value) => handleFieldChange("location_district", value)}
              error={errors.location_district}
              placeholder="İlçe"
            />

            <EnhancedFormField
              label="İl"
              name="location_city"
              type="text"
              value={formData.location_city}
              onChange={(value) => handleFieldChange("location_city", value)}
              error={errors.location_city}
              placeholder="İl"
            />
          </div>
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
                Müsait
              </label>
              <p className="text-xs text-design-gray dark:text-gray-400">
                İlan görünür ve aktif durumda
              </p>
            </div>
            <Switch
              checked={formData.available}
              onCheckedChange={(checked) => handleFieldChange("available", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-design-dark dark:text-white">
                Öne Çıkan
              </label>
              <p className="text-xs text-design-gray dark:text-gray-400">
                Ana sayfada öne çıkan ilanlar bölümünde göster
              </p>
            </div>
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) => handleFieldChange("featured", checked)}
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
              {listingId ? "Güncelle" : "Oluştur"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
