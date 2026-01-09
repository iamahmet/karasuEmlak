"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import {
  Settings,
  Save,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";

interface AdvancedConfig {
  // Performance
  cache_enabled: boolean;
  cache_ttl: number;
  rate_limiting_enabled: boolean;
  rate_limit_requests: number;
  rate_limit_window: number;
  
  // Security
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
  require_mfa: boolean;
  
  // Features
  maintenance_mode: boolean;
  debug_mode: boolean;
  analytics_enabled: boolean;
  
  // Custom
  custom_config: string;
}

export function AdvancedConfiguration() {
  const [config, setConfig] = useState<AdvancedConfig>({
    cache_enabled: true,
    cache_ttl: 3600,
    rate_limiting_enabled: true,
    rate_limit_requests: 100,
    rate_limit_window: 60,
    session_timeout: 3600,
    max_login_attempts: 5,
    password_min_length: 8,
    require_mfa: false,
    maintenance_mode: false,
    debug_mode: false,
    analytics_enabled: true,
    custom_config: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/settings/advanced");
      const data = await response.json();
      
      if (data.success && data.config) {
        setConfig({ ...config, ...data.config });
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ayarlar kaydedilemedi");
      }

      toast.success("Gelişmiş ayarlar kaydedildi");
    } catch (error: any) {
      toast.error(error.message || "Ayarlar kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof AdvancedConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton-professional rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-design-light" />
          Gelişmiş Yapılandırma
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance" className="text-xs">Performans</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Güvenlik</TabsTrigger>
            <TabsTrigger value="features" className="text-xs">Özellikler</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">Özel</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                <div>
                  <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                    Önbellek Etkin
                  </Label>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mt-1">
                    Performans için önbellekleme kullan
                  </p>
                </div>
                <Switch
                  checked={config.cache_enabled}
                  onCheckedChange={(checked) => updateConfig("cache_enabled", checked)}
                />
              </div>

              {config.cache_enabled && (
                <div className="space-y-2">
                  <Label className="text-xs font-ui font-semibold">Önbellek TTL (saniye)</Label>
                  <Input
                    type="number"
                    value={config.cache_ttl}
                    onChange={(e) => updateConfig("cache_ttl", parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                <div>
                  <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                    Rate Limiting
                  </Label>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mt-1">
                    API isteklerini sınırla
                  </p>
                </div>
                <Switch
                  checked={config.rate_limiting_enabled}
                  onCheckedChange={(checked) => updateConfig("rate_limiting_enabled", checked)}
                />
              </div>

              {config.rate_limiting_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-ui font-semibold">İstek Sayısı</Label>
                    <Input
                      type="number"
                      value={config.rate_limit_requests}
                      onChange={(e) => updateConfig("rate_limit_requests", parseInt(e.target.value))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-ui font-semibold">Pencere (saniye)</Label>
                    <Input
                      type="number"
                      value={config.rate_limit_window}
                      onChange={(e) => updateConfig("rate_limit_window", parseInt(e.target.value))}
                      className="h-9"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-ui font-semibold">Oturum Zaman Aşımı (saniye)</Label>
                <Input
                  type="number"
                  value={config.session_timeout}
                  onChange={(e) => updateConfig("session_timeout", parseInt(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-ui font-semibold">Maksimum Giriş Denemesi</Label>
                <Input
                  type="number"
                  value={config.max_login_attempts}
                  onChange={(e) => updateConfig("max_login_attempts", parseInt(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-ui font-semibold">Minimum Şifre Uzunluğu</Label>
                <Input
                  type="number"
                  value={config.password_min_length}
                  onChange={(e) => updateConfig("password_min_length", parseInt(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                <div>
                  <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                    MFA Zorunlu
                  </Label>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mt-1">
                    Admin kullanıcıları için çok faktörlü kimlik doğrulama
                  </p>
                </div>
                <Switch
                  checked={config.require_mfa}
                  onCheckedChange={(checked) => updateConfig("require_mfa", checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                <div>
                  <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                    Bakım Modu
                  </Label>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mt-1">
                    Siteyi bakım moduna al
                  </p>
                </div>
                <Switch
                  checked={config.maintenance_mode}
                  onCheckedChange={(checked) => updateConfig("maintenance_mode", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                <div>
                  <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                    Debug Modu
                  </Label>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mt-1">
                    Hata ayıklama bilgilerini göster
                  </p>
                </div>
                <Switch
                  checked={config.debug_mode}
                  onCheckedChange={(checked) => updateConfig("debug_mode", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28]">
                <div>
                  <Label className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                    Analitik Etkin
                  </Label>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mt-1">
                    Kullanım analitiği topla
                  </p>
                </div>
                <Switch
                  checked={config.analytics_enabled}
                  onCheckedChange={(checked) => updateConfig("analytics_enabled", checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-ui font-semibold">Özel Yapılandırma (JSON)</Label>
              <Textarea
                value={config.custom_config}
                onChange={(e) => updateConfig("custom_config", e.target.value)}
                className="min-h-[200px] font-mono text-xs"
                placeholder='{"custom_key": "custom_value"}'
              />
              <p className="text-xs text-design-gray dark:text-gray-400 font-ui flex items-center gap-1">
                <Info className="h-3 w-3" />
                JSON formatında özel yapılandırma ekleyebilirsiniz
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-4 mt-6 border-t border-[#E7E7E7] dark:border-[#062F28]">
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
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
  );
}

