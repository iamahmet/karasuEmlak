"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button, Input, Label, Textarea, Badge, Switch } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import {
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Eye,
  ChevronRight,
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  X,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  Info,
  GripVertical,
  Star,
  StarOff,
  Globe,
  Building2,
  Ruler,
  Bed,
  Bath,
  Car,
  Layers,
  Calendar,
  TrendingUp,
  Shield,
  Award,
  Camera,
  ImagePlus,
  Trash2,
  MoveUp,
  MoveDown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { MediaLibraryButton } from "@/components/content-studio/MediaLibraryButton";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { cn } from "@karasu/lib";
import { formatCurrency, formatNumber } from "@karasu/lib/utils";

interface ListingData {
  id?: string;
  title: string;
  slug: string;
  status: "satilik" | "kiralik";
  property_type: string;
  location_neighborhood: string;
  location_address?: string;
  price_amount: number | null;
  price_currency: string;
  area_sqm?: number;
  room_count?: number;
  floor?: number;
  building_age?: number;
  images: string[];
  description: string;
  published: boolean;
  featured: boolean;
  available: boolean;
}

interface ListingEditorWizardProps {
  listingId?: string;
  onClose: () => void;
  onSave: () => void;
}

const STEPS = [
  { id: 1, label: "Temel Bilgiler", icon: Home, description: "İlan başlığı ve tipi" },
  { id: 2, label: "Konum & Mahalle", icon: MapPin, description: "Adres ve lokasyon" },
  { id: 3, label: "Fiyat & Özellikler", icon: DollarSign, description: "Fiyat ve detaylar" },
  { id: 4, label: "Fotoğraflar", icon: ImageIcon, description: "Görsel yönetimi" },
  { id: 5, label: "Açıklama", icon: FileText, description: "Detaylı açıklama" },
  { id: 6, label: "Önizleme & Yayın", icon: Eye, description: "Son kontrol ve yayın" },
];

const PROPERTY_TYPES = [
  { value: "daire", label: "Daire", icon: Building2 },
  { value: "villa", label: "Villa", icon: Home },
  { value: "mustakil", label: "Müstakil", icon: Home },
  { value: "arsa", label: "Arsa", icon: Layers },
  { value: "isyeri", label: "İşyeri", icon: Building2 },
  { value: "yazlik", label: "Yazlık", icon: Home },
];

export function ListingEditorWizard({ listingId, onClose, onSave }: ListingEditorWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listing, setListing] = useState<ListingData>({
    title: "",
    slug: "",
    status: "satilik",
    property_type: "",
    location_neighborhood: "",
    price_amount: null,
    price_currency: "TRY",
    images: [],
    description: "",
    published: false,
    featured: false,
    available: true,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (currentStep < STEPS.length) {
          handleNext();
        }
      } else if (e.key === "ArrowLeft" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (currentStep > 1) {
          handlePrevious();
        }
      } else if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep]);

  // Autosave draft every 30 seconds
  useEffect(() => {
    if (!listingId && listing.title) {
      const interval = setInterval(() => {
        autoSaveDraft();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [listing, listingId]);

  // Load existing listing if editing
  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      const data = await response.json();
      if (data.success && data.listing) {
        setListing({
          ...data.listing,
          images: data.listing.images || [],
        });
      }
    } catch (error) {
      toast.error("İlan yüklenemedi");
    }
  };

  const autoSaveDraft = useCallback(async () => {
    if (!listing.title || listingId) return;
    
    setAutoSaving(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...listing,
          published: false,
        }),
      });
      const data = await response.json();
      if (data.success && data.listing?.id) {
        setListing((prev) => ({ ...prev, id: data.listing.id }));
        setLastSaved(new Date());
      }
    } catch (error) {
      // Silent fail for autosave
    } finally {
      setAutoSaving(false);
    }
  }, [listing, listingId]);

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!listing.title.trim()) newErrors.title = "İlan başlığı zorunludur";
      if (!listing.slug.trim()) newErrors.slug = "URL slug zorunludur";
      if (!listing.property_type) newErrors.property_type = "Emlak tipi seçilmelidir";
    } else if (step === 2) {
      if (!listing.location_neighborhood.trim()) newErrors.location_neighborhood = "Mahalle zorunludur";
    } else if (step === 3) {
      if (!listing.price_amount || listing.price_amount <= 0) {
        newErrors.price_amount = "Geçerli bir fiyat giriniz";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async (publish = false) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    setSaving(true);
    try {
      const url = listing.id ? `/api/listings/${listing.id}` : "/api/listings";
      const method = listing.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...listing,
          published: publish,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Kayıt başarısız");
      }

      toast.success(publish ? "İlan yayınlandı!" : "İlan kaydedildi");
      
      if (publish && data.listing?.slug) {
        const baseUrl = typeof window !== "undefined" 
          ? window.location.origin.replace(":3001", ":3000")
          : "http://localhost:3000";
        const publicUrl = `${baseUrl}/ilan/${data.listing.slug}`;
        
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>İlan yayınlandı!</span>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              Sitede Gör
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>,
          { duration: 5000 }
        );
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  };

  // Image upload handlers
  const handleImageUpload = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Lütfen görsel dosyası seçin");
      return;
    }

    for (const file of imageFiles.slice(0, 20 - listing.images.length)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} dosyası 10MB'dan büyük olamaz`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.url) {
          setListing(prev => ({
            ...prev,
            images: [...prev.images, data.url],
          }));
        }
      } catch (error) {
        toast.error(`${file.name} yüklenemedi`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageUpload(files);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...listing.images];
    if (direction === "up" && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === "down" && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setListing(prev => ({ ...prev, images: newImages }));
  };

  const removeImage = (index: number) => {
    setListing(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    const newImages = [listing.images[index], ...listing.images.filter((_, i) => i !== index)];
    setListing(prev => ({ ...prev, images: newImages }));
  };

  const calculatePricePerM2 = () => {
    if (listing.price_amount && listing.area_sqm && listing.area_sqm > 0) {
      return Math.round(listing.price_amount / listing.area_sqm);
    }
    return null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Temel Bilgiler
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">İpuçları</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Başlık açıklayıcı ve SEO dostu olmalı</li>
                    <li>Örnek: "Denize Sıfır 3+1 Daire, Merkez Mahallesi"</li>
                    <li>URL slug otomatik oluşturulur, isterseniz düzenleyebilirsiniz</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                <Home className="h-4 w-4" />
                İlan Başlığı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={listing.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setListing({
                    ...listing,
                    title,
                    slug: listing.slug || generateSlug(title),
                  });
                  if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                }}
                className={cn("mt-2 h-12 text-base", errors.title && "border-red-500")}
                placeholder="Örn: Denize Sıfır 3+1 Daire, Merkez Mahallesi"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
              {listing.title && (
                <p className="text-xs text-gray-500 mt-1">
                  {listing.title.length} karakter
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slug" className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                URL Slug <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">/ilan/</span>
                <Input
                  id="slug"
                  value={listing.slug}
                  onChange={(e) => {
                    setListing({ ...listing, slug: e.target.value });
                    if (errors.slug) setErrors(prev => ({ ...prev, slug: "" }));
                  }}
                  className={cn("flex-1 h-12", errors.slug && "border-red-500")}
                  placeholder="denize-sifir-3-1-daire"
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.slug}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  İlan Tipi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={listing.status || "satilik"}
                  onValueChange={(value: "satilik" | "kiralik") =>
                    setListing({ ...listing, status: value })
                  }
                >
                  <SelectTrigger className="mt-2 h-12 flex items-center gap-2" id="status">
                    {listing.status === "satilik" && (
                      <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                    {listing.status === "kiralik" && (
                      <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                    <SelectValue placeholder="İlan tipi seçin" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper"
                    className="!z-[99999] rounded-xl border-2 shadow-xl bg-white dark:bg-gray-900"
                    sideOffset={4}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <SelectItem 
                      value="satilik" 
                      className="cursor-pointer"
                    >
                      Satılık
                    </SelectItem>
                    <SelectItem 
                      value="kiralik" 
                      className="cursor-pointer"
                    >
                      Kiralık
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="property_type" className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Emlak Tipi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={listing.property_type || ""}
                  onValueChange={(value) => {
                    setListing({ ...listing, property_type: value });
                    if (errors.property_type) setErrors(prev => ({ ...prev, property_type: "" }));
                  }}
                >
                  <SelectTrigger 
                    className={cn("mt-2 h-12 flex items-center gap-2", errors.property_type && "border-red-500")}
                    id="property_type"
                  >
                    {listing.property_type && (() => {
                      const selectedType = PROPERTY_TYPES.find(t => t.value === listing.property_type);
                      if (selectedType) {
                        const Icon = selectedType.icon;
                        return <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />;
                      }
                      return null;
                    })()}
                    <SelectValue placeholder="Emlak tipi seçin" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper"
                    className="z-[9999] max-h-[300px] rounded-xl border-2 shadow-xl bg-white dark:bg-gray-900"
                    sideOffset={4}
                  >
                    {PROPERTY_TYPES.map((type) => {
                      return (
                        <SelectItem 
                          key={type.value} 
                          value={type.value}
                          className="cursor-pointer"
                        >
                          {type.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.property_type && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.property_type}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Konum & Mahalle
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Konum Bilgisi</h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Detaylı adres bilgisi ilanın görünürlüğünü artırır ve potansiyel alıcıların ilanı bulmasını kolaylaştırır.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="location_neighborhood" className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Mahalle <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location_neighborhood"
                value={listing.location_neighborhood}
                onChange={(e) => {
                  setListing({ ...listing, location_neighborhood: e.target.value });
                  if (errors.location_neighborhood) setErrors(prev => ({ ...prev, location_neighborhood: "" }));
                }}
                className={cn("mt-2 h-12 text-base", errors.location_neighborhood && "border-red-500")}
                placeholder="Örn: Merkez Mahallesi, Liman Mahallesi"
              />
              {errors.location_neighborhood && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.location_neighborhood}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location_address" className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Detaylı Adres
              </Label>
              <Textarea
                id="location_address"
                value={listing.location_address || ""}
                onChange={(e) => setListing({ ...listing, location_address: e.target.value })}
                className="mt-2 min-h-[100px]"
                rows={4}
                placeholder="Sokak, cadde, bina numarası gibi detaylı adres bilgisi..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Detaylı adres bilgisi harita entegrasyonu için kullanılır
              </p>
            </div>
          </div>
        );

      case 3: // Fiyat & Özellikler
        const pricePerM2 = calculatePricePerM2();
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Fiyatlandırma</h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Gerçekçi fiyatlandırma ilanınızın daha fazla görüntülenmesini sağlar.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_amount" className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fiyat <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="price_amount"
                    type="number"
                    value={listing.price_amount || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : null;
                      setListing({
                        ...listing,
                        price_amount: value,
                      });
                      if (errors.price_amount) setErrors(prev => ({ ...prev, price_amount: "" }));
                    }}
                    className={cn("h-12 text-base pr-20", errors.price_amount && "border-red-500")}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Select
                      value={listing.price_currency || "TRY"}
                      onValueChange={(value) => setListing({ ...listing, price_currency: value })}
                    >
                      <SelectTrigger className="h-8 w-16 border-0 bg-transparent p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent 
                        position="popper"
                        className="z-[9999] bg-white dark:bg-gray-900 min-w-[80px]"
                        sideOffset={4}
                      >
                        <SelectItem value="TRY" className="cursor-pointer">₺ TRY</SelectItem>
                        <SelectItem value="USD" className="cursor-pointer">$ USD</SelectItem>
                        <SelectItem value="EUR" className="cursor-pointer">€ EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {errors.price_amount && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.price_amount}
                  </p>
                )}
                {listing.price_amount && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      {formatCurrency(listing.price_amount)}
                    </p>
                    {pricePerM2 && listing.area_sqm && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        m² başına: {formatCurrency(pricePerM2)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="price_currency" className="text-sm font-semibold">
                  Para Birimi
                </Label>
                <Select
                  value={listing.price_currency || "TRY"}
                  onValueChange={(value) => setListing({ ...listing, price_currency: value })}
                >
                  <SelectTrigger className="mt-2 h-12" id="price_currency">
                    <SelectValue placeholder="Para birimi seçin" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper"
                    className="!z-[99999] rounded-xl border-2 shadow-xl bg-white dark:bg-gray-900"
                    sideOffset={4}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <SelectItem value="TRY" className="cursor-pointer">
                      ₺ Türk Lirası
                    </SelectItem>
                    <SelectItem value="USD" className="cursor-pointer">
                      $ Amerikan Doları
                    </SelectItem>
                    <SelectItem value="EUR" className="cursor-pointer">
                      € Euro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="area_sqm" className="text-sm font-semibold flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Metrekare
                </Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={listing.area_sqm || ""}
                  onChange={(e) =>
                    setListing({
                      ...listing,
                      area_sqm: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="mt-2 h-12"
                  placeholder="0"
                  min="0"
                />
                {listing.area_sqm && (
                  <p className="text-xs text-gray-500 mt-1">{formatNumber(listing.area_sqm)} m²</p>
                )}
              </div>

              <div>
                <Label htmlFor="room_count" className="text-sm font-semibold flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Oda Sayısı
                </Label>
                <Input
                  id="room_count"
                  type="number"
                  value={listing.room_count || ""}
                  onChange={(e) =>
                    setListing({
                      ...listing,
                      room_count: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="mt-2 h-12"
                  placeholder="0"
                  min="0"
                />
                {listing.room_count && (
                  <p className="text-xs text-gray-500 mt-1">{listing.room_count}+1</p>
                )}
              </div>

              <div>
                <Label htmlFor="floor" className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Kat
                </Label>
                <Input
                  id="floor"
                  type="number"
                  value={listing.floor || ""}
                  onChange={(e) =>
                    setListing({
                      ...listing,
                      floor: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="mt-2 h-12"
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="building_age" className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Bina Yaşı
                </Label>
                <Input
                  id="building_age"
                  type="number"
                  value={listing.building_age || ""}
                  onChange={(e) =>
                    setListing({
                      ...listing,
                      building_age: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="mt-2 h-12"
                  placeholder="0"
                  min="0"
                />
                {listing.building_age !== undefined && listing.building_age !== null && (
                  <p className="text-xs text-gray-500 mt-1">{listing.building_age} yaşında</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4: // Fotoğraflar
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Fotoğraf İpuçları</h3>
                  <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 list-disc list-inside">
                    <li>İlk fotoğraf kapak görseli olarak kullanılır</li>
                    <li>En fazla 20 fotoğraf yükleyebilirsiniz</li>
                    <li>Yüksek kaliteli, iyi aydınlatılmış fotoğraflar tercih edilir</li>
                    <li>Fotoğrafları sürükleyerek sıralayabilirsiniz</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                  : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-900/50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                aria-label="Fotoğraf yükle"
                title="Fotoğraf seç"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleImageUpload(files);
                }}
              />
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  "p-4 rounded-full transition-all duration-300",
                  dragActive ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"
                )}>
                  <Upload className={cn(
                    "h-8 w-8 transition-colors",
                    dragActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                  )} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {dragActive ? "Fotoğrafları buraya bırakın" : "Fotoğrafları sürükleyip bırakın"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    veya
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Dosya Seç
                  </Button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  PNG, JPG, WEBP (Max 10MB per file) • {listing.images.length}/20 fotoğraf
                </p>
              </div>
            </div>

            {/* Image Gallery */}
            {listing.images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Yüklenen Fotoğraflar ({listing.images.length})
                  </Label>
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3" />
                    İlk fotoğraf kapak görseli
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {listing.images.map((image, index) => (
                    <div
                      key={index}
                      className={cn(
                        "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300",
                        index === 0
                          ? "border-yellow-400 dark:border-yellow-600 ring-2 ring-yellow-400/50"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                      )}
                    >
                      <img
                        src={image}
                        alt={`Fotoğraf ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 fill-white" />
                          Kapak
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPrimaryImage(index)}
                          className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-900"
                          title="Kapak yap"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                          className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-900 disabled:opacity-50"
                          title="Yukarı taşı"
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === listing.images.length - 1}
                          className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-900 disabled:opacity-50"
                          title="Aşağı taşı"
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                          className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Library Button */}
            <div className="flex items-center justify-center pt-4 border-t">
              <MediaLibraryButton
                onSelect={(url) => {
                  if (listing.images.length >= 20) {
                    toast.error("Maksimum 20 fotoğraf yükleyebilirsiniz");
                    return;
                  }
                  setListing({
                    ...listing,
                    images: [...listing.images, url],
                  });
                  toast.success("Fotoğraf eklendi");
                }}
              />
            </div>
          </div>
        );

      case 5: // Açıklama
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Açıklama Yazma İpuçları</h3>
                  <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1 list-disc list-inside">
                    <li>Detaylı ve açıklayıcı bir açıklama yazın</li>
                    <li>Emlakın özelliklerini, avantajlarını ve çevresini anlatın</li>
                    <li>Ulaşım, okul, market gibi yakınlıkları belirtin</li>
                    <li>Görseller ekleyerek açıklamanızı zenginleştirin</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                İlan Açıklaması
              </Label>
              <RichTextEditor
                value={listing.description}
                onChange={(value) => setListing({ ...listing, description: value })}
                placeholder="İlan detaylarını buraya yazın... Örn: Denize sıfır konumda, ferah ve aydınlık 3+1 daire..."
              />
              {listing.description && (
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    {listing.description.replace(/<[^>]*>/g, "").length} karakter
                  </span>
                  <span>
                    {listing.description.replace(/<[^>]*>/g, "").split(/\s+/).filter(w => w.length > 0).length} kelime
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 6: // Önizleme & Yayın
        const previewPricePerM2 = calculatePricePerM2();
        return (
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  İlan Önizlemesi
                </h3>
                <Badge variant={listing.published ? "default" : "outline"}>
                  {listing.published ? "Yayında" : "Taslak"}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Image Preview */}
                {listing.images.length > 0 ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
                      {listing.images.length} fotoğraf
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Fotoğraf eklenmemiş</p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {listing.title || "İlan Başlığı"}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location_neighborhood || "Mahalle"}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.price_amount && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fiyat</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(listing.price_amount)}
                      </p>
                      {previewPricePerM2 && listing.area_sqm && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatCurrency(previewPricePerM2)}/m²
                        </p>
                      )}
                    </div>
                  )}
                  {listing.area_sqm && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Metrekare</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatNumber(listing.area_sqm)} m²
                      </p>
                    </div>
                  )}
                  {listing.room_count && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Oda</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {listing.room_count}+1
                      </p>
                    </div>
                  )}
                  {listing.property_type && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tip</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                        {PROPERTY_TYPES.find(t => t.value === listing.property_type)?.label || listing.property_type}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant={listing.status === "satilik" ? "default" : "secondary"}>
                    {listing.status === "satilik" ? "Satılık" : "Kiralık"}
                  </Badge>
                  {listing.featured && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      Öne Çıkan
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Yayın Ayarları
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <Label htmlFor="published" className="text-sm font-semibold cursor-pointer">
                        Sitede Yayınla
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      İlanı sitede görünür yap ve arama motorlarında indeksle
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={listing.published}
                    onCheckedChange={(checked) => setListing({ ...listing, published: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <Label htmlFor="featured" className="text-sm font-semibold cursor-pointer">
                        Öne Çıkan İlan
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ana sayfada ve öne çıkan bölümlerde göster
                    </p>
                  </div>
                  <Switch
                    id="featured"
                    checked={listing.featured}
                    onCheckedChange={(checked) => setListing({ ...listing, featured: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Label htmlFor="available" className="text-sm font-semibold cursor-pointer">
                        Müsait
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      İlan aktif ve görüntülenebilir durumda
                    </p>
                  </div>
                  <Switch
                    id="available"
                    checked={listing.available}
                    onCheckedChange={(checked) => setListing({ ...listing, available: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Success Message */}
            {listing.published && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      İlan yayınlandığında sitede görünecek
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      İlanınız arama motorlarında indekslenecek ve potansiyel alıcılar tarafından görülebilecek.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const StepIcon = STEPS[currentStep - 1]?.icon || Home;
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto relative" style={{ isolation: 'isolate' }}>
      {/* Header with Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <StepIcon className="h-6 w-6" />
              </div>
              {listingId ? "İlan Düzenle" : "Yeni İlan Ekle"}
            </h2>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <span>Adım {currentStep} / {STEPS.length}</span>
              <span>•</span>
              <span>{STEPS[currentStep - 1]?.label}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {autoSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Kaydediliyor...</span>
              </div>
            )}
            {lastSaved && !autoSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Son kayıt: {lastSaved.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
              <X className="h-4 w-4" />
              Kapat
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>İlerleme</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mt-6">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <div
                key={step.id}
                className="flex-1 flex items-center"
                onClick={() => {
                  if (isCompleted || isActive) {
                    setCurrentStep(step.id);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 shadow-lg shadow-blue-500/50"
                        : isCompleted
                        ? "bg-green-500 text-white hover:scale-105"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    )}
                  >
                    <StepIcon className="h-5 w-5" />
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-300",
                    isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Card */}
      <Card className="shadow-xl border-2">
        <CardContent className="p-8">
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Önceki
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Taslak Olarak Kaydet
          </Button>
          {currentStep === STEPS.length ? (
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Yayınla
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘</kbd>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">→</kbd>
            Sonraki
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘</kbd>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">←</kbd>
            Önceki
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘</kbd>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">S</kbd>
            Kaydet
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">ESC</kbd>
            Kapat
          </span>
        </p>
      </div>
    </div>
  );
}
