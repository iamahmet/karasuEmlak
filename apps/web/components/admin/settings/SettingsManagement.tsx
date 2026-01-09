"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { toast } from "sonner";
import { createClient } from "@karasu/lib/supabase/client";
import { validateRequired, validateURL, validateEmail, validateNumberRange } from "@/lib/validation/validators";
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  Image,
  Code,
  Save,
  Search,
  Zap,
  Share2,
  Clock,
  Lock,
  FileImage,
  TrendingUp,
} from "lucide-react";

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  contact_email: string;
  support_email: string;
  default_language: string;
  enable_registration: boolean;
  enable_comments: boolean;
  enable_newsletter: boolean;
  maintenance_mode: boolean;
  // Security Settings
  session_timeout: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  rate_limit_enabled: boolean;
  rate_limit_requests: number;
  rate_limit_window: number;
  two_factor_enabled: boolean;
  // Media Settings
  max_upload_size: number;
  allowed_image_types: string[];
  allowed_video_types: string[];
  allowed_document_types: string[];
  enable_image_compression: boolean;
  image_quality: number;
  // SEO Settings
  default_meta_title: string;
  default_meta_description: string;
  default_meta_keywords: string;
  enable_og_tags: boolean;
  enable_twitter_cards: boolean;
  // Social Media
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  linkedin_url: string;
  // Performance
  enable_caching: boolean;
  cache_duration: number;
  enable_cdn: boolean;
  cdn_url: string;
}

export function SettingsManagement({ locale }: { locale: string }) {
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Karasu Emlak",
    site_description: "",
    site_url: "",
    contact_email: "",
    support_email: "",
    default_language: "tr",
    enable_registration: true,
    enable_comments: true,
    enable_newsletter: true,
    maintenance_mode: false,
    // Security defaults
    session_timeout: 3600,
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    rate_limit_enabled: true,
    rate_limit_requests: 100,
    rate_limit_window: 60,
    two_factor_enabled: false,
    // Media defaults
    max_upload_size: 10485760, // 10MB
    allowed_image_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowed_video_types: ["video/mp4", "video/webm"],
    allowed_document_types: ["application/pdf", "application/msword"],
    enable_image_compression: true,
    image_quality: 85,
    // SEO defaults
    default_meta_title: "",
    default_meta_description: "",
    default_meta_keywords: "",
    enable_og_tags: true,
    enable_twitter_cards: true,
    // Social Media defaults
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    youtube_url: "",
    linkedin_url: "",
    // Performance defaults
    enable_caching: true,
    cache_duration: 3600,
    enable_cdn: false,
    cdn_url: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  // Track changes
  useEffect(() => {
    if (!loading) {
      setHasChanges(true);
    }
  }, [settings, loading]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings");
      
      if (!response.ok) {
        throw new Error("Ayarlar yüklenemedi");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Invalid response format");
      }

      if (data.settings) {
        // Map API response to component state
        setSettings({
          site_name: data.settings.site_name || "Karasu Emlak",
          site_description: data.settings.site_description || "",
          site_url: data.settings.site_url || "",
          contact_email: data.settings.contact_email || "",
          support_email: data.settings.support_email || "",
          default_language: data.settings.default_locale || data.settings.default_language || "tr",
          enable_registration: data.settings.enable_registration !== undefined ? data.settings.enable_registration : true,
          enable_comments: data.settings.enable_comments !== undefined ? data.settings.enable_comments : true,
          enable_newsletter: data.settings.enable_newsletter !== undefined ? data.settings.enable_newsletter : true,
          maintenance_mode: data.settings.maintenance_mode !== undefined ? data.settings.maintenance_mode : false,
          // Security
          session_timeout: data.settings.session_timeout || 3600,
          password_min_length: data.settings.password_min_length || 8,
          password_require_uppercase: data.settings.password_require_uppercase !== undefined ? data.settings.password_require_uppercase : true,
          password_require_lowercase: data.settings.password_require_lowercase !== undefined ? data.settings.password_require_lowercase : true,
          password_require_numbers: data.settings.password_require_numbers !== undefined ? data.settings.password_require_numbers : true,
          password_require_symbols: data.settings.password_require_symbols !== undefined ? data.settings.password_require_symbols : false,
          rate_limit_enabled: data.settings.rate_limit_enabled !== undefined ? data.settings.rate_limit_enabled : true,
          rate_limit_requests: data.settings.rate_limit_requests || 100,
          rate_limit_window: data.settings.rate_limit_window || 60,
          two_factor_enabled: data.settings.two_factor_enabled !== undefined ? data.settings.two_factor_enabled : false,
          // Media
          max_upload_size: data.settings.max_upload_size || 10485760,
          allowed_image_types: data.settings.allowed_image_types || ["image/jpeg", "image/png", "image/webp", "image/gif"],
          allowed_video_types: data.settings.allowed_video_types || ["video/mp4", "video/webm"],
          allowed_document_types: data.settings.allowed_document_types || ["application/pdf", "application/msword"],
          enable_image_compression: data.settings.enable_image_compression !== undefined ? data.settings.enable_image_compression : true,
          image_quality: data.settings.image_quality || 85,
          // SEO
          default_meta_title: data.settings.default_meta_title || "",
          default_meta_description: data.settings.default_meta_description || "",
          default_meta_keywords: data.settings.default_meta_keywords || "",
          enable_og_tags: data.settings.enable_og_tags !== undefined ? data.settings.enable_og_tags : true,
          enable_twitter_cards: data.settings.enable_twitter_cards !== undefined ? data.settings.enable_twitter_cards : true,
          // Social Media
          facebook_url: data.settings.facebook_url || "",
          twitter_url: data.settings.twitter_url || "",
          instagram_url: data.settings.instagram_url || "",
          youtube_url: data.settings.youtube_url || "",
          linkedin_url: data.settings.linkedin_url || "",
          // Performance
          enable_caching: data.settings.enable_caching !== undefined ? data.settings.enable_caching : true,
          cache_duration: data.settings.cache_duration || 3600,
          enable_cdn: data.settings.enable_cdn !== undefined ? data.settings.enable_cdn : false,
          cdn_url: data.settings.cdn_url || "",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch settings:", error);
      toast.error(error.message || "Ayarlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const validateSettings = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const siteNameValidation = validateRequired(settings.site_name, "Site adı");
    if (!siteNameValidation.valid) {
      errors.push(siteNameValidation.error || "Site adı gereklidir");
    }

    if (settings.site_url && settings.site_url.trim().length > 0) {
      const urlValidation = validateURL(settings.site_url, false);
      if (!urlValidation.valid) {
        errors.push(urlValidation.error || "Geçerli bir URL girin");
      }
    }

    if (settings.contact_email && settings.contact_email.trim().length > 0) {
      const emailValidation = validateEmail(settings.contact_email);
      if (!emailValidation.valid) {
        errors.push(emailValidation.error || "Geçerli bir e-posta adresi girin");
      }
    }

    if (settings.support_email && settings.support_email.trim().length > 0) {
      const emailValidation = validateEmail(settings.support_email);
      if (!emailValidation.valid) {
        errors.push(emailValidation.error || "Geçerli bir destek e-posta adresi girin");
      }
    }

    const passwordLengthValidation = validateNumberRange(settings.password_min_length, {
      min: 6,
      max: 32,
      fieldName: "Şifre uzunluğu",
    });
    if (!passwordLengthValidation.valid) {
      errors.push(passwordLengthValidation.error || "Şifre uzunluğu 6-32 karakter arasında olmalıdır");
    }

    const sessionTimeoutValidation = validateNumberRange(settings.session_timeout, {
      min: 300,
      max: 86400,
      fieldName: "Oturum zaman aşımı",
    });
    if (!sessionTimeoutValidation.valid) {
      errors.push(sessionTimeoutValidation.error || "Oturum zaman aşımı 300-86400 saniye arasında olmalıdır");
    }

    if (settings.max_upload_size < 1048576 || settings.max_upload_size > 104857600) {
      errors.push("Maksimum dosya boyutu 1MB-100MB arasında olmalıdır");
    }

    if (settings.image_quality < 50 || settings.image_quality > 100) {
      errors.push("Görsel kalitesi %50-%100 arasında olmalıdır");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const handleSave = async () => {
    // Validate settings
    const validation = validateSettings();
    if (!validation.valid) {
      toast.error(validation.errors.join(", "));
      return;
    }

    setSaving(true);
    try {
      // Map component state to API format
      const apiSettings = {
        site_name: settings.site_name,
        site_description: settings.site_description,
        site_url: settings.site_url,
        default_locale: settings.default_language,
        contact_email: settings.contact_email,
        support_email: settings.support_email,
        enable_registration: settings.enable_registration,
        enable_comments: settings.enable_comments,
        enable_newsletter: settings.enable_newsletter,
        maintenance_mode: settings.maintenance_mode,
        // Security
        session_timeout: settings.session_timeout,
        password_min_length: settings.password_min_length,
        password_require_uppercase: settings.password_require_uppercase,
        password_require_lowercase: settings.password_require_lowercase,
        password_require_numbers: settings.password_require_numbers,
        password_require_symbols: settings.password_require_symbols,
        rate_limit_enabled: settings.rate_limit_enabled,
        rate_limit_requests: settings.rate_limit_requests,
        rate_limit_window: settings.rate_limit_window,
        two_factor_enabled: settings.two_factor_enabled,
        // Media
        max_upload_size: settings.max_upload_size,
        allowed_image_types: settings.allowed_image_types,
        allowed_video_types: settings.allowed_video_types,
        allowed_document_types: settings.allowed_document_types,
        enable_image_compression: settings.enable_image_compression,
        image_quality: settings.image_quality,
        // SEO
        default_meta_title: settings.default_meta_title,
        default_meta_description: settings.default_meta_description,
        default_meta_keywords: settings.default_meta_keywords,
        enable_og_tags: settings.enable_og_tags,
        enable_twitter_cards: settings.enable_twitter_cards,
        // Social Media
        facebook_url: settings.facebook_url,
        twitter_url: settings.twitter_url,
        instagram_url: settings.instagram_url,
        youtube_url: settings.youtube_url,
        linkedin_url: settings.linkedin_url,
        // Performance
        enable_caching: settings.enable_caching,
        cache_duration: settings.cache_duration,
        enable_cdn: settings.enable_cdn,
        cdn_url: settings.cdn_url,
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiSettings),
      });

      if (!response.ok) {
        throw new Error("Ayarlar kaydedilemedi");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Invalid response format");
      }

      setHasChanges(false);
      setLastSaved(new Date());
      toast.success("Ayarlar kaydedildi");
    } catch (error: any) {
      toast.error(error.message || "Ayarlar kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-[#E7E7E7] dark:bg-[#062F28] rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] rounded-lg p-1">
        <TabsTrigger value="general" className="text-xs font-ui flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Genel
        </TabsTrigger>
        <TabsTrigger value="email" className="text-xs font-ui flex items-center gap-2">
          <Mail className="h-4 w-4" />
          E-posta
        </TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs font-ui flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Bildirimler
        </TabsTrigger>
        <TabsTrigger value="security" className="text-xs font-ui flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Güvenlik
        </TabsTrigger>
        <TabsTrigger value="media" className="text-xs font-ui flex items-center gap-2">
          <Image className="h-4 w-4" />
          Medya
        </TabsTrigger>
        <TabsTrigger value="seo" className="text-xs font-ui flex items-center gap-2">
          <Search className="h-4 w-4" />
          SEO
        </TabsTrigger>
        <TabsTrigger value="social" className="text-xs font-ui flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Sosyal Medya
        </TabsTrigger>
        <TabsTrigger value="performance" className="text-xs font-ui flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Performans
        </TabsTrigger>
      </TabsList>

      {/* General Settings */}
      <TabsContent value="general">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-design-light" />
              Genel Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="site_name" className="text-xs font-ui font-semibold">
                Site Adı
              </Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="input-modern mt-1"
              />
            </div>
            <div>
              <Label htmlFor="site_description" className="text-xs font-ui font-semibold">
                Site Açıklaması
              </Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                rows={3}
                className="input-modern mt-1"
              />
            </div>
            <div>
              <Label htmlFor="site_url" className="text-xs font-ui font-semibold">
                Site URL
              </Label>
              <Input
                id="site_url"
                type="url"
                value={settings.site_url}
                onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
                className="input-modern mt-1"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="default_language" className="text-xs font-ui font-semibold">
                Varsayılan Dil
              </Label>
              <Select
                value={settings.default_language}
                onValueChange={(value) => setSettings({ ...settings, default_language: value })}
              >
                <SelectTrigger className="input-modern mt-1">
                  <SelectValue placeholder="Dil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="et">Eesti</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="enable_registration" className="text-xs font-ui font-semibold">
                  Kullanıcı Kaydı
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Yeni kullanıcıların kayıt olmasına izin ver
                </p>
              </div>
              <Switch
                id="enable_registration"
                checked={settings.enable_registration}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_registration: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="maintenance_mode" className="text-xs font-ui font-semibold">
                  Bakım Modu
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Siteyi bakım moduna al
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Email Settings */}
      <TabsContent value="email">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-design-light" />
              E-posta Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="contact_email" className="text-xs font-ui font-semibold">
                İletişim E-postası
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="input-modern mt-1"
              />
            </div>
            <div>
              <Label htmlFor="support_email" className="text-xs font-ui font-semibold">
                Destek E-postası
              </Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="input-modern mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications Settings */}
      <TabsContent value="notifications">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-design-light" />
              Bildirim Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="enable_comments" className="text-xs font-ui font-semibold">
                  Yorumlar
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Yorum özelliğini etkinleştir
                </p>
              </div>
              <Switch
                id="enable_comments"
                checked={settings.enable_comments}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_comments: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="enable_newsletter" className="text-xs font-ui font-semibold">
                  Bülten
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Bülten özelliğini etkinleştir
                </p>
              </div>
              <Switch
                id="enable_newsletter"
                checked={settings.enable_newsletter}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_newsletter: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security" className="space-y-4">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-design-light" />
              Oturum ve Kimlik Doğrulama
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="session_timeout" className="text-xs font-ui font-semibold">
                Oturum Zaman Aşımı (saniye)
              </Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.session_timeout}
                onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) || 3600 })}
                className="input-modern mt-1"
                min={300}
                max={86400}
              />
              <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                Kullanıcı oturumunun otomatik olarak sona ereceği süre (varsayılan: 3600 saniye = 1 saat)
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="two_factor_enabled" className="text-xs font-ui font-semibold">
                  İki Faktörlü Kimlik Doğrulama (2FA)
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Admin kullanıcıları için 2FA zorunlu olsun
                </p>
              </div>
              <Switch
                id="two_factor_enabled"
                checked={settings.two_factor_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, two_factor_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-design-light" />
              Şifre Politikası
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="password_min_length" className="text-xs font-ui font-semibold">
                Minimum Şifre Uzunluğu
              </Label>
              <Input
                id="password_min_length"
                type="number"
                value={settings.password_min_length}
                onChange={(e) => setSettings({ ...settings, password_min_length: parseInt(e.target.value) || 8 })}
                className="input-modern mt-1"
                min={6}
                max={32}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password_require_uppercase" className="text-xs font-ui font-semibold">
                  Büyük Harf Gerekli
                </Label>
                <Switch
                  id="password_require_uppercase"
                  checked={settings.password_require_uppercase}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, password_require_uppercase: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password_require_lowercase" className="text-xs font-ui font-semibold">
                  Küçük Harf Gerekli
                </Label>
                <Switch
                  id="password_require_lowercase"
                  checked={settings.password_require_lowercase}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, password_require_lowercase: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password_require_numbers" className="text-xs font-ui font-semibold">
                  Rakam Gerekli
                </Label>
                <Switch
                  id="password_require_numbers"
                  checked={settings.password_require_numbers}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, password_require_numbers: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password_require_symbols" className="text-xs font-ui font-semibold">
                  Özel Karakter Gerekli
                </Label>
                <Switch
                  id="password_require_symbols"
                  checked={settings.password_require_symbols}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, password_require_symbols: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-design-light" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="rate_limit_enabled" className="text-xs font-ui font-semibold">
                  Rate Limiting Aktif
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  API isteklerini sınırla
                </p>
              </div>
              <Switch
                id="rate_limit_enabled"
                checked={settings.rate_limit_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, rate_limit_enabled: checked })
                }
              />
            </div>
            {settings.rate_limit_enabled && (
              <>
                <div>
                  <Label htmlFor="rate_limit_requests" className="text-xs font-ui font-semibold">
                    Maksimum İstek Sayısı
                  </Label>
                  <Input
                    id="rate_limit_requests"
                    type="number"
                    value={settings.rate_limit_requests}
                    onChange={(e) => setSettings({ ...settings, rate_limit_requests: parseInt(e.target.value) || 100 })}
                    className="input-modern mt-1"
                    min={10}
                    max={1000}
                  />
                </div>
                <div>
                  <Label htmlFor="rate_limit_window" className="text-xs font-ui font-semibold">
                    Zaman Penceresi (saniye)
                  </Label>
                  <Input
                    id="rate_limit_window"
                    type="number"
                    value={settings.rate_limit_window}
                    onChange={(e) => setSettings({ ...settings, rate_limit_window: parseInt(e.target.value) || 60 })}
                    className="input-modern mt-1"
                    min={10}
                    max={3600}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Media Settings */}
      <TabsContent value="media" className="space-y-4">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <FileImage className="h-5 w-5 text-design-light" />
              Yükleme Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="max_upload_size" className="text-xs font-ui font-semibold">
                Maksimum Dosya Boyutu (byte)
              </Label>
              <Input
                id="max_upload_size"
                type="number"
                value={settings.max_upload_size}
                onChange={(e) => setSettings({ ...settings, max_upload_size: parseInt(e.target.value) || 10485760 })}
                className="input-modern mt-1"
                min={1048576}
                max={104857600}
              />
              <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                {Math.round(settings.max_upload_size / 1048576)} MB
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="enable_image_compression" className="text-xs font-ui font-semibold">
                  Görsel Sıkıştırma
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Yüklenen görselleri otomatik sıkıştır
                </p>
              </div>
              <Switch
                id="enable_image_compression"
                checked={settings.enable_image_compression}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_image_compression: checked })
                }
              />
            </div>
            {settings.enable_image_compression && (
              <div>
                <Label htmlFor="image_quality" className="text-xs font-ui font-semibold">
                  Görsel Kalitesi (%)
                </Label>
                <Input
                  id="image_quality"
                  type="number"
                  value={settings.image_quality}
                  onChange={(e) => setSettings({ ...settings, image_quality: parseInt(e.target.value) || 85 })}
                  className="input-modern mt-1"
                  min={50}
                  max={100}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Image className="h-5 w-5 text-design-light" />
              İzin Verilen Dosya Türleri
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label className="text-xs font-ui font-semibold mb-2 block">
                Görsel Türleri (MIME types, virgülle ayrılmış)
              </Label>
              <Textarea
                value={settings.allowed_image_types.join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowed_image_types: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                rows={2}
                className="input-modern"
                placeholder="image/jpeg, image/png, image/webp"
              />
            </div>
            <div>
              <Label className="text-xs font-ui font-semibold mb-2 block">
                Video Türleri (MIME types, virgülle ayrılmış)
              </Label>
              <Textarea
                value={settings.allowed_video_types.join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowed_video_types: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                rows={2}
                className="input-modern"
                placeholder="video/mp4, video/webm"
              />
            </div>
            <div>
              <Label className="text-xs font-ui font-semibold mb-2 block">
                Doküman Türleri (MIME types, virgülle ayrılmış)
              </Label>
              <Textarea
                value={settings.allowed_document_types.join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowed_document_types: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                rows={2}
                className="input-modern"
                placeholder="application/pdf, application/msword"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SEO Settings */}
      <TabsContent value="seo" className="space-y-4">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-design-light" />
              SEO Varsayılanları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="default_meta_title" className="text-xs font-ui font-semibold">
                Varsayılan Meta Başlık
              </Label>
              <Input
                id="default_meta_title"
                value={settings.default_meta_title}
                onChange={(e) => setSettings({ ...settings, default_meta_title: e.target.value })}
                className="input-modern mt-1"
                placeholder="Site varsayılan meta başlığı"
              />
            </div>
            <div>
              <Label htmlFor="default_meta_description" className="text-xs font-ui font-semibold">
                Varsayılan Meta Açıklama
              </Label>
              <Textarea
                id="default_meta_description"
                value={settings.default_meta_description}
                onChange={(e) => setSettings({ ...settings, default_meta_description: e.target.value })}
                rows={3}
                className="input-modern mt-1"
                placeholder="Site varsayılan meta açıklaması"
              />
            </div>
            <div>
              <Label htmlFor="default_meta_keywords" className="text-xs font-ui font-semibold">
                Varsayılan Meta Keywords
              </Label>
              <Input
                id="default_meta_keywords"
                value={settings.default_meta_keywords}
                onChange={(e) => setSettings({ ...settings, default_meta_keywords: e.target.value })}
                className="input-modern mt-1"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable_og_tags" className="text-xs font-ui font-semibold">
                  Open Graph Etiketleri
                </Label>
                <Switch
                  id="enable_og_tags"
                  checked={settings.enable_og_tags}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_og_tags: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enable_twitter_cards" className="text-xs font-ui font-semibold">
                  Twitter Card Etiketleri
                </Label>
                <Switch
                  id="enable_twitter_cards"
                  checked={settings.enable_twitter_cards}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_twitter_cards: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Social Media Settings */}
      <TabsContent value="social" className="space-y-4">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-design-light" />
              Sosyal Medya Bağlantıları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="facebook_url" className="text-xs font-ui font-semibold">
                Facebook URL
              </Label>
              <Input
                id="facebook_url"
                type="url"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="input-modern mt-1"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Label htmlFor="twitter_url" className="text-xs font-ui font-semibold">
                Twitter/X URL
              </Label>
              <Input
                id="twitter_url"
                type="url"
                value={settings.twitter_url}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                className="input-modern mt-1"
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <Label htmlFor="instagram_url" className="text-xs font-ui font-semibold">
                Instagram URL
              </Label>
              <Input
                id="instagram_url"
                type="url"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="input-modern mt-1"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <Label htmlFor="youtube_url" className="text-xs font-ui font-semibold">
                YouTube URL
              </Label>
              <Input
                id="youtube_url"
                type="url"
                value={settings.youtube_url}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                className="input-modern mt-1"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url" className="text-xs font-ui font-semibold">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin_url"
                type="url"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                className="input-modern mt-1"
                placeholder="https://linkedin.com/..."
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Performance Settings */}
      <TabsContent value="performance" className="space-y-4">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-design-light" />
              Performans Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="enable_caching" className="text-xs font-ui font-semibold">
                  Önbellekleme (Caching)
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Sayfa ve API yanıtlarını önbelleğe al
                </p>
              </div>
              <Switch
                id="enable_caching"
                checked={settings.enable_caching}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_caching: checked })
                }
              />
            </div>
            {settings.enable_caching && (
              <div>
                <Label htmlFor="cache_duration" className="text-xs font-ui font-semibold">
                  Önbellek Süresi (saniye)
                </Label>
                <Input
                  id="cache_duration"
                  type="number"
                  value={settings.cache_duration}
                  onChange={(e) => setSettings({ ...settings, cache_duration: parseInt(e.target.value) || 3600 })}
                  className="input-modern mt-1"
                  min={60}
                  max={86400}
                />
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="enable_cdn" className="text-xs font-ui font-semibold">
                  CDN Kullanımı
                </Label>
                <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                  Statik dosyalar için CDN kullan
                </p>
              </div>
              <Switch
                id="enable_cdn"
                checked={settings.enable_cdn}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_cdn: checked })
                }
              />
            </div>
            {settings.enable_cdn && (
              <div>
                <Label htmlFor="cdn_url" className="text-xs font-ui font-semibold">
                  CDN URL
                </Label>
                <Input
                  id="cdn_url"
                  type="url"
                  value={settings.cdn_url}
                  onChange={(e) => setSettings({ ...settings, cdn_url: e.target.value })}
                  className="input-modern mt-1"
                  placeholder="https://cdn.example.com"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E7E7E7] dark:border-[#062F28]">
        <div className="text-xs text-design-gray dark:text-gray-400">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Save className="h-3 w-3" />
              Son kayıt: {lastSaved.toLocaleTimeString("tr-TR")}
            </span>
          )}
          {hasChanges && !saving && (
            <span className="text-yellow-600 dark:text-yellow-400 ml-2">
              • Değişiklikler kaydediliyor...
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              fetchSettings();
              setHasChanges(false);
            }}
            disabled={saving || !hasChanges}
            className="border border-[#E7E7E7] dark:border-[#062F28]"
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </Tabs>
  );
}

