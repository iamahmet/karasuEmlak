"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Label } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Textarea } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Checkbox } from '@karasu/ui';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateAIImage } from '@/lib/ai/image-generator';

interface ImageUpload {
  public_id: string;
  url: string;
  order: number;
}

interface FormData {
  // Basic Info
  title: string;
  status: 'satilik' | 'kiralik' | '';
  property_type: string;
  description_short: string;
  description_long: string;

  // Location
  location_city: string;
  location_district: string;
  location_neighborhood: string;
  location_full_address: string;
  coordinates_lat: string;
  coordinates_lng: string;

  // Price
  price_amount: string;
  price_currency: string;

  // Features
  rooms: string;
  bathrooms: string;
  sizeM2: string;
  floor: string;
  buildingAge: string;
  heating: string;
  furnished: boolean;
  balcony: boolean;
  parking: boolean;
  elevator: boolean;
  seaView: boolean;

  // Agent Info
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  agent_whatsapp: string;
}

const PROPERTY_TYPES = [
  { value: 'daire', label: 'Daire' },
  { value: 'villa', label: 'Villa' },
  { value: 'ev', label: 'Ev' },
  { value: 'yazlik', label: 'Yazlık' },
  { value: 'arsa', label: 'Arsa' },
  { value: 'isyeri', label: 'İşyeri' },
  { value: 'dukkan', label: 'Dükkan' },
];

const NEIGHBORHOODS = [
  'Merkez Mahallesi',
  'Sahil Mahallesi',
  'Liman Mahallesi',
  'Çamlık Mahallesi',
  'Yeni Mahalle',
];

export function AddListingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    status: '',
    property_type: '',
    description_short: '',
    description_long: '',
    location_city: 'Karasu',
    location_district: 'Karasu',
    location_neighborhood: '',
    location_full_address: '',
    coordinates_lat: '',
    coordinates_lng: '',
    price_amount: '',
    price_currency: 'TRY',
    rooms: '',
    bathrooms: '',
    sizeM2: '',
    floor: '',
    buildingAge: '',
    heating: '',
    furnished: false,
    balcony: false,
    parking: false,
    elevator: false,
    seaView: false,
    agent_name: '',
    agent_phone: '',
    agent_email: '',
    agent_whatsapp: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/listings/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Resim yüklenemedi');
        }

        const data = await response.json();
        return {
          public_id: data.public_id,
          url: data.url,
          order: images.length + index,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  };

  const handleGenerateAIImage = async () => {
    if (!formData.title || !formData.property_type || !formData.location_neighborhood) {
      setError('AI görsel üretimi için başlık, emlak tipi ve mahalle bilgisi gerekli');
      return;
    }

    if (images.length >= 10) {
      setError('En fazla 10 görsel ekleyebilirsiniz');
      return;
    }

    setGeneratingAI(true);
    setError(null);

    try {
      const result = await generateAIImage({
        type: 'listing',
        context: {
          title: formData.title,
          propertyType: formData.property_type,
          location: `${formData.location_neighborhood}, ${formData.location_district || 'Karasu'}, ${formData.location_city || 'Sakarya'}`,
          status: formData.status || undefined,
          features: {
            rooms: formData.rooms || undefined,
            bathrooms: formData.bathrooms || undefined,
            sizeM2: formData.sizeM2 || undefined,
            floor: formData.floor || undefined,
            heating: formData.heating || undefined,
            furnished: formData.furnished,
            balcony: formData.balcony,
            parking: formData.parking,
            elevator: formData.elevator,
            seaView: formData.seaView,
          },
        },
        options: {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
        },
        upload: {
          folder: 'listings',
          entityType: 'listing',
          alt: `${formData.title} - ${formData.location_neighborhood}`,
          tags: [formData.property_type, formData.status || 'taslak'].filter(Boolean),
        },
      });

      if (!result.success || !result.url) {
        throw new Error(result.error || 'AI görsel üretilemedi');
      }

      setImages((prev) => [
        ...prev,
        {
          public_id: result.public_id || `ai-generated-${Date.now()}`,
          url: result.url,
          order: prev.length,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI görsel oluşturulurken bir hata oluştu');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        price_amount: formData.price_amount ? parseFloat(formData.price_amount) : null,
        coordinates_lat: formData.coordinates_lat ? parseFloat(formData.coordinates_lat) : null,
        coordinates_lng: formData.coordinates_lng ? parseFloat(formData.coordinates_lng) : null,
        features: {
          rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
          sizeM2: formData.sizeM2 ? parseFloat(formData.sizeM2) : undefined,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          buildingAge: formData.buildingAge ? parseInt(formData.buildingAge) : undefined,
          heating: formData.heating || undefined,
          furnished: formData.furnished,
          balcony: formData.balcony,
          parking: formData.parking,
          elevator: formData.elevator,
          seaView: formData.seaView,
        },
        images: images.map((img) => ({
          public_id: img.public_id,
          url: img.url,
          alt: formData.title,
          order: img.order,
        })),
      };

      const { fetchWithRetry } = await import('@/lib/utils/api-client');
      const data = await fetchWithRetry('/api/listings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!data.success) {
        throw new Error(data.error || data.message || 'İlan oluşturulamadı');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/satilik');
      }, 3000);
    } catch (err) {
      const { handleApiError } = await import('@/lib/utils/api-client');
      const errorInfo = handleApiError(err);
      setError(errorInfo.userFriendly);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">İlanınız Başarıyla Gönderildi!</h2>
        <p className="text-muted-foreground mb-4">
          İlanınız incelendikten sonra yayınlanacaktır. Teşekkür ederiz.
        </p>
        <p className="text-sm text-muted-foreground">
          Yönlendiriliyorsunuz...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Temel Bilgiler</h2>
            <p className="text-muted-foreground mb-6">
              İlanınızın temel bilgilerini girin
            </p>
          </div>

          <div>
            <Label htmlFor="title">İlan Başlığı *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Örn: Denize Sıfır 3+1 Daire"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">İlan Tipi *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as 'satilik' | 'kiralik' }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satilik">Satılık</SelectItem>
                  <SelectItem value="kiralik">Kiralık</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="property_type">Emlak Tipi *</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, property_type: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description_short">Kısa Açıklama</Label>
            <Textarea
              id="description_short"
              name="description_short"
              value={formData.description_short}
              onChange={handleInputChange}
              rows={3}
              placeholder="Kısa bir açıklama yazın..."
            />
          </div>

          <div>
            <Label htmlFor="description_long">Detaylı Açıklama</Label>
            <Textarea
              id="description_long"
              name="description_long"
              value={formData.description_long}
              onChange={handleInputChange}
              rows={6}
              placeholder="Detaylı açıklama yazın..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              disabled={!formData.title || !formData.status || !formData.property_type}
            >
              Sonraki Adım
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Konum Bilgileri</h2>
            <p className="text-muted-foreground mb-6">
              İlanınızın konum bilgilerini girin
            </p>
          </div>

          <div>
            <Label htmlFor="location_neighborhood">Mahalle *</Label>
            <Select
              value={formData.location_neighborhood}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, location_neighborhood: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Mahalle seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {NEIGHBORHOODS.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location_full_address">Tam Adres</Label>
            <Input
              id="location_full_address"
              name="location_full_address"
              value={formData.location_full_address}
              onChange={handleInputChange}
              placeholder="Sokak, cadde, bina bilgileri..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coordinates_lat">Enlem (Latitude)</Label>
              <Input
                id="coordinates_lat"
                name="coordinates_lat"
                type="number"
                step="any"
                value={formData.coordinates_lat}
                onChange={handleInputChange}
                placeholder="41.0969"
              />
            </div>
            <div>
              <Label htmlFor="coordinates_lng">Boylam (Longitude)</Label>
              <Input
                id="coordinates_lng"
                name="coordinates_lng"
                type="number"
                step="any"
                value={formData.coordinates_lng}
                onChange={handleInputChange}
                placeholder="30.6919"
              />
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Önceki Adım
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Sonraki Adım
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Price & Features */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Fiyat ve Özellikler</h2>
            <p className="text-muted-foreground mb-6">
              Fiyat ve emlak özelliklerini girin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_amount">Fiyat</Label>
              <Input
                id="price_amount"
                name="price_amount"
                type="number"
                value={formData.price_amount}
                onChange={handleInputChange}
                placeholder="Örn: 1500000"
              />
            </div>
            <div>
              <Label htmlFor="price_currency">Para Birimi</Label>
              <Select
                value={formData.price_currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, price_currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="rooms">Oda Sayısı</Label>
              <Input
                id="rooms"
                name="rooms"
                type="number"
                value={formData.rooms}
                onChange={handleInputChange}
                placeholder="3"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Banyo Sayısı</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleInputChange}
                placeholder="2"
              />
            </div>
            <div>
              <Label htmlFor="sizeM2">Metrekare (m²)</Label>
              <Input
                id="sizeM2"
                name="sizeM2"
                type="number"
                value={formData.sizeM2}
                onChange={handleInputChange}
                placeholder="120"
              />
            </div>
            <div>
              <Label htmlFor="floor">Kat</Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                value={formData.floor}
                onChange={handleInputChange}
                placeholder="3"
              />
            </div>
            <div>
              <Label htmlFor="buildingAge">Bina Yaşı</Label>
              <Input
                id="buildingAge"
                name="buildingAge"
                type="number"
                value={formData.buildingAge}
                onChange={handleInputChange}
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="heating">Isıtma</Label>
              <Input
                id="heating"
                name="heating"
                value={formData.heating}
                onChange={handleInputChange}
                placeholder="Kombi"
              />
            </div>
          </div>

          <div>
            <Label>Özellikler</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furnished"
                  checked={formData.furnished}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('furnished', checked === true)
                  }
                />
                <Label htmlFor="furnished" className="font-normal cursor-pointer">
                  Eşyalı
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="balcony"
                  checked={formData.balcony}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('balcony', checked === true)
                  }
                />
                <Label htmlFor="balcony" className="font-normal cursor-pointer">
                  Balkon
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking"
                  checked={formData.parking}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('parking', checked === true)
                  }
                />
                <Label htmlFor="parking" className="font-normal cursor-pointer">
                  Otopark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="elevator"
                  checked={formData.elevator}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('elevator', checked === true)
                  }
                />
                <Label htmlFor="elevator" className="font-normal cursor-pointer">
                  Asansör
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seaView"
                  checked={formData.seaView}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('seaView', checked === true)
                  }
                />
                <Label htmlFor="seaView" className="font-normal cursor-pointer">
                  Deniz Manzaralı
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Önceki Adım
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep(4)}>
              Sonraki Adım
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Images & Contact */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Görseller ve İletişim</h2>
            <p className="text-muted-foreground mb-6">
              İlan görsellerini ve iletişim bilgilerinizi ekleyin
            </p>
          </div>

          <div>
            <Label>Görseller</Label>
            <div className="mt-2 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-primary hover:underline">
                    Görsel yüklemek için tıklayın
                  </span>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  Maksimum 10MB, JPG, PNG veya WEBP formatında
                </p>
              </div>

              {/* AI Image Generator */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3 text-center text-muted-foreground">
                  veya
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateAIImage}
                  disabled={generatingAI || uploadingImages || !formData.title || !formData.property_type || !formData.location_neighborhood}
                  className="w-full"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI ile Görsel Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI ile Gerçekçi Görsel Oluştur
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  OpenAI DALL-E 3 ile profesyonel görsel oluşturulur
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Görsel ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadingImages && (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agent_name">Ad Soyad</Label>
              <Input
                id="agent_name"
                name="agent_name"
                value={formData.agent_name}
                onChange={handleInputChange}
                placeholder="İletişim için adınız"
              />
            </div>
            <div>
              <Label htmlFor="agent_phone">Telefon</Label>
              <Input
                id="agent_phone"
                name="agent_phone"
                type="tel"
                value={formData.agent_phone}
                onChange={handleInputChange}
                placeholder="+90 555 123 45 67"
              />
            </div>
            <div>
              <Label htmlFor="agent_email">E-posta</Label>
              <Input
                id="agent_email"
                name="agent_email"
                type="email"
                value={formData.agent_email}
                onChange={handleInputChange}
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <Label htmlFor="agent_whatsapp">WhatsApp</Label>
              <Input
                id="agent_whatsapp"
                name="agent_whatsapp"
                type="tel"
                value={formData.agent_whatsapp}
                onChange={handleInputChange}
                placeholder="+90 555 123 45 67"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Hata</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Önceki Adım
            </Button>
            <Button type="submit" disabled={loading || uploadingImages || generatingAI}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Gönderiliyor...
                </>
              ) : (
                'İlanı Gönder'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    </form>
  );
}
