"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { toast } from "sonner";
import {
  Image,
  Layout,
  Smartphone,
  Eye,
  EyeOff,
  Upload,
  Save,
  FileText,
  Palette,
} from "lucide-react";

interface CustomizationSettings {
  logo_url?: string;
  logo_alt_text?: string;
  favicon_url?: string;
  header_config?: {
    showSearch?: boolean;
    showLanguageSwitcher?: boolean;
    sticky?: boolean;
    backgroundColor?: string;
  };
  footer_config?: {
    showNewsletter?: boolean;
    showSocialLinks?: boolean;
    copyrightText?: string;
  };
  mobile_config?: {
    showHamburgerMenu?: boolean;
    showSearch?: boolean;
  };
  component_visibility?: {
    newsletter?: boolean;
    comments?: boolean;
    relatedArticles?: boolean;
    socialShare?: boolean;
    readingProgress?: boolean;
    backToTop?: boolean;
  };
  theme_colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
}

export function SiteCustomization({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CustomizationSettings>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Ayarlar yüklenemedi");
      const data = await response.json();
      if (data.settings) {
        setSettings({
          logo_url: data.settings.logo_url || "",
          logo_alt_text: data.settings.logo_alt_text || "Karasu Emlak",
          favicon_url: data.settings.favicon_url || "",
          header_config: data.settings.header_config || {
            showSearch: true,
            showLanguageSwitcher: true,
            sticky: true,
            backgroundColor: "",
          },
          footer_config: data.settings.footer_config || {
            showNewsletter: true,
            showSocialLinks: true,
            copyrightText: "© 2025 Karasu Emlak. Tüm hakları saklıdır.",
          },
          mobile_config: data.settings.mobile_config || {
            showHamburgerMenu: true,
            showSearch: true,
          },
          component_visibility: data.settings.component_visibility || {
            newsletter: true,
            comments: true,
            relatedArticles: true,
            socialShare: true,
            readingProgress: true,
            backToTop: true,
          },
          theme_colors: data.settings.theme_colors || {
            primary: "#2D9B87",
            secondary: "#062F28",
            accent: "#DC2626",
          },
          facebook_url: data.settings.facebook_url || "",
          twitter_url: data.settings.twitter_url || "",
          instagram_url: data.settings.instagram_url || "",
          youtube_url: data.settings.youtube_url || "",
          linkedin_url: data.settings.linkedin_url || "",
        });
        if (data.settings.logo_url) {
          setLogoPreview(data.settings.logo_url);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Ayarlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error("Lütfen bir logo dosyası seçin");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("altText", settings.logo_alt_text || "Karasu Emlak");

      const response = await fetch("/api/settings/logo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Logo yüklenemedi");
      }

      setSettings({ ...settings, logo_url: data.logoUrl });
      setLogoPreview(data.logoUrl);
      toast.success("Logo başarıyla yüklendi");
    } catch (error: any) {
      toast.error(error.message || "Logo yüklenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Ayarlar kaydedilemedi");
      }

      toast.success("Özelleştirmeler kaydedildi");
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
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="logo" className="space-y-6">
      <TabsList className="bg-card/95 backdrop-blur-xl border border-border/40 rounded-lg p-1 flex-wrap h-auto">
        <TabsTrigger value="logo" className="text-xs font-ui flex items-center gap-2">
          <Image className="h-4 w-4" />
          Logo & Favicon
        </TabsTrigger>
        <TabsTrigger value="header" className="text-xs font-ui flex items-center gap-2">
          <Layout className="h-4 w-4" />
          Header
        </TabsTrigger>
        <TabsTrigger value="footer" className="text-xs font-ui flex items-center gap-2">
          <Layout className="h-4 w-4" />
          Footer
        </TabsTrigger>
        <TabsTrigger value="mobile" className="text-xs font-ui flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Mobil
        </TabsTrigger>
        <TabsTrigger value="components" className="text-xs font-ui flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Bileşenler
        </TabsTrigger>
        <TabsTrigger value="theme" className="text-xs font-ui flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Tema
        </TabsTrigger>
      </TabsList>

      {/* Logo & Favicon */}
      <TabsContent value="logo">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Logo & Favicon Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="logo" className="text-xs font-ui font-semibold mb-2 block">
                Logo Yükle
              </Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-32 h-32 border border-border/40 rounded-lg overflow-hidden bg-card/95 backdrop-blur-xl flex items-center justify-center">
                    <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="input-modern"
                  />
                  <Button
                    onClick={handleLogoUpload}
                    disabled={!logoFile || saving}
                    className="mt-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Logo Yükle
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="logo_alt_text" className="text-xs font-ui font-semibold">
                Logo Alt Text
              </Label>
              <Input
                id="logo_alt_text"
                value={settings.logo_alt_text || ""}
                onChange={(e) => setSettings({ ...settings, logo_alt_text: e.target.value })}
                className="input-modern mt-1"
                placeholder="Karasu Emlak"
              />
            </div>
            <div>
              <Label htmlFor="favicon_url" className="text-xs font-ui font-semibold">
                Favicon URL
              </Label>
              <Input
                id="favicon_url"
                type="url"
                value={settings.favicon_url || ""}
                onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                className="input-modern mt-1"
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Header */}
      <TabsContent value="header">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              Header Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="header_search" className="text-xs font-ui font-semibold">
                  Arama Kutusu
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Header'da arama kutusunu göster
                </p>
              </div>
              <Switch
                id="header_search"
                checked={settings.header_config?.showSearch !== false}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    header_config: { ...settings.header_config, showSearch: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="header_language" className="text-xs font-ui font-semibold">
                  Dil Değiştirici
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Header'da dil değiştiriciyi göster
                </p>
              </div>
              <Switch
                id="header_language"
                checked={settings.header_config?.showLanguageSwitcher !== false}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    header_config: { ...settings.header_config, showLanguageSwitcher: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="header_sticky" className="text-xs font-ui font-semibold">
                  Yapışkan Header
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Header'ı scroll'da sabit tut
                </p>
              </div>
              <Switch
                id="header_sticky"
                checked={settings.header_config?.sticky !== false}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    header_config: { ...settings.header_config, sticky: checked },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="header_bg" className="text-xs font-ui font-semibold">
                Arka Plan Rengi (Hex)
              </Label>
              <Input
                id="header_bg"
                type="text"
                value={settings.header_config?.backgroundColor || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    header_config: { ...settings.header_config, backgroundColor: e.target.value },
                  })
                }
                className="input-modern mt-1"
                placeholder="#ffffff"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Footer */}
      <TabsContent value="footer">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              Footer Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="footer_newsletter" className="text-xs font-ui font-semibold">
                  Newsletter Formu
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Footer'da newsletter formunu göster
                </p>
              </div>
              <Switch
                id="footer_newsletter"
                checked={settings.footer_config?.showNewsletter !== false}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    footer_config: { ...settings.footer_config, showNewsletter: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="footer_social" className="text-xs font-ui font-semibold">
                  Sosyal Medya Linkleri
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Footer'da sosyal medya linklerini göster
                </p>
              </div>
              <Switch
                id="footer_social"
                checked={settings.footer_config?.showSocialLinks !== false}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    footer_config: { ...settings.footer_config, showSocialLinks: checked },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="footer_copyright" className="text-xs font-ui font-semibold">
                Telif Hakkı Metni
              </Label>
              <Input
                id="footer_copyright"
                value={settings.footer_config?.copyrightText || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer_config: { ...settings.footer_config, copyrightText: e.target.value },
                  })
                }
                className="input-modern mt-1"
                placeholder="© 2025 Karasu Emlak. Tüm hakları saklıdır."
              />
            </div>
            <div className="pt-4 border-t border-border/40">
              <Label className="text-xs font-ui font-semibold mb-3 block">
                Sosyal Medya URL'leri
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="facebook_url" className="text-xs font-ui font-semibold">
                    Facebook URL
                  </Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={(settings as any).facebook_url || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        facebook_url: e.target.value,
                      } as any)
                    }
                    className="input-modern mt-1"
                    placeholder="https://facebook.com/karasuradyo"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_url" className="text-xs font-ui font-semibold">
                    Twitter/X URL
                  </Label>
                  <Input
                    id="twitter_url"
                    type="url"
                    value={(settings as any).twitter_url || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        twitter_url: e.target.value,
                      } as any)
                    }
                    className="input-modern mt-1"
                    placeholder="https://twitter.com/karasuradyo"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_url" className="text-xs font-ui font-semibold">
                    Instagram URL
                  </Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={(settings as any).instagram_url || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        instagram_url: e.target.value,
                      } as any)
                    }
                    className="input-modern mt-1"
                    placeholder="https://instagram.com/karasuradyo"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube_url" className="text-xs font-ui font-semibold">
                    YouTube URL
                  </Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={(settings as any).youtube_url || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        youtube_url: e.target.value,
                      } as any)
                    }
                    className="input-modern mt-1"
                    placeholder="https://youtube.com/@karasuradyo"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin_url" className="text-xs font-ui font-semibold">
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={(settings as any).linkedin_url || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        linkedin_url: e.target.value,
                      } as any)
                    }
                    className="input-modern mt-1"
                    placeholder="https://linkedin.com/company/karasuradyo"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Mobile */}
      <TabsContent value="mobile">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Mobil Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="mobile_menu" className="text-xs font-ui font-semibold">
                  Hamburger Menü
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Mobil cihazlarda hamburger menüyü göster
                </p>
              </div>
              <Switch
                id="mobile_menu"
                checked={settings.mobile_config?.showHamburgerMenu !== false}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    mobile_config: { ...settings.mobile_config, showHamburgerMenu: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="mobile_search" className="text-xs font-ui font-semibold">
                  Mobil Arama
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Mobil cihazlarda arama kutusunu göster
                </p>
              </div>
              <Switch
                id="mobile_search"
                checked={settings.mobile_config?.showSearch !== false}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    mobile_config: { ...settings.mobile_config, showSearch: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Components */}
      <TabsContent value="components">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Bileşen Görünürlüğü
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {[
              { key: "newsletter", label: "Newsletter Formu", desc: "Newsletter kayıt formunu göster" },
              { key: "comments", label: "Yorumlar", desc: "Makale yorumlarını göster" },
              { key: "relatedArticles", label: "İlgili Makaleler", desc: "İlgili makaleler bölümünü göster" },
              { key: "socialShare", label: "Sosyal Paylaşım", desc: "Sosyal medya paylaşım butonlarını göster" },
              { key: "readingProgress", label: "Okuma İlerlemesi", desc: "Sayfa üstünde okuma ilerleme çubuğunu göster" },
              { key: "backToTop", label: "Yukarı Çık", desc: "Yukarı çık butonunu göster" },
            ].map((component) => (
              <div key={component.key} className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor={component.key} className="text-xs font-ui font-semibold">
                    {component.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">{component.desc}</p>
                </div>
                <Switch
                  id={component.key}
                  checked={settings.component_visibility?.[component.key as keyof typeof settings.component_visibility] !== false}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      component_visibility: {
                        ...settings.component_visibility,
                        [component.key]: checked,
                      },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Theme */}
      <TabsContent value="theme">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Tema Renkleri
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label htmlFor="color_primary" className="text-xs font-ui font-semibold">
                Ana Renk (Primary)
              </Label>
              <Input
                id="color_primary"
                type="text"
                value={settings.theme_colors?.primary || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme_colors: { ...settings.theme_colors, primary: e.target.value },
                  })
                }
                className="input-modern mt-1"
                placeholder="#2D9B87"
              />
            </div>
            <div>
              <Label htmlFor="color_secondary" className="text-xs font-ui font-semibold">
                İkincil Renk (Secondary)
              </Label>
              <Input
                id="color_secondary"
                type="text"
                value={settings.theme_colors?.secondary || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme_colors: { ...settings.theme_colors, secondary: e.target.value },
                  })
                }
                className="input-modern mt-1"
                placeholder="#062F28"
              />
            </div>
            <div>
              <Label htmlFor="color_accent" className="text-xs font-ui font-semibold">
                Vurgu Rengi (Accent)
              </Label>
              <Input
                id="color_accent"
                type="text"
                value={settings.theme_colors?.accent || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme_colors: { ...settings.theme_colors, accent: e.target.value },
                  })
                }
                className="input-modern mt-1"
                placeholder="#DC2626"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </Tabs>
  );
}

