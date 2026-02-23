"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import { Sparkles, Loader2, FileText } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { ContentTemplates } from "./ContentTemplates";
import { KeywordBasedContentGenerator } from "./KeywordBasedContentGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";

interface CreateTabProps {
  locale: string;
  defaultType?: string;
}

export function CreateTab({ locale, defaultType }: CreateTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "templates" | "keywords">("form");
  const [formData, setFormData] = useState({
    type: defaultType || "normal",
    template: "blog",
    topic: "",
    brief: "",
    locale: locale,
  });

  const handleCreate = async () => {
    if (!formData.topic.trim()) {
      toast.error("Lütfen bir konu veya başlık girin");
      return;
    }

    setLoading(true);
    try {
      toast.info("AI içerik oluşturuluyor... Bu işlem birkaç saniye sürebilir.");
      
      const response = await fetch("/api/content-studio/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Add Karasu Emlak specific context
          context: "karasu-emlak",
          region: "Karasu, Kocaali, Sakarya",
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.message || data.error || "İçerik oluşturulamadı");
        return;
      }

      const contentId = data.data?.contentId || data.data?.articleId || data.contentId || data.articleId;
      if (contentId) {
        toast.success("✅ İçerik başarıyla oluşturuldu! Editör sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => {
          // Redirect to article editor (articles table, not content-studio)
          router.push(`/articles/${contentId}`);
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || "İçerik oluşturulurken bir hata oluştu");
      console.error("Content creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setFormData({
      ...formData,
      type: template.type,
      template: template.id,
      topic: template.structure.title,
      brief: template.structure.excerpt || "",
    });
    setActiveTab("form");
    toast.success(`${template.name} şablonu forma yüklendi`);
  };

  return (
    <Card className="card-professional hover-lift">
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-lg font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-design-light" />
          Yeni İçerik Oluştur
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "form" | "templates" | "keywords")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-[#E7E7E7]/30 dark:bg-[#062F28]/30 p-1">
            <TabsTrigger value="form" className="rounded-lg font-ui text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a3d35]">
              <Sparkles className="h-4 w-4 mr-2" />
              AI ile Oluştur
            </TabsTrigger>
            <TabsTrigger value="keywords" className="rounded-lg font-ui text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a3d35]">
              <Sparkles className="h-4 w-4 mr-2" />
              Anahtar Kelime
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg font-ui text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a3d35]">
              <FileText className="h-4 w-4 mr-2" />
              Şablonlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="type" className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1.5 block">İçerik Kategorisi</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type" className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-[#E7E7E7] dark:border-[#062F28]">
                <SelectItem value="normal" className="text-sm font-ui">📄 Standart İçerik (800-1200 kelime)</SelectItem>
                <SelectItem value="cornerstone" className="text-sm font-ui">⭐ Rehber İçerik (2000+ kelime, karasu satılık daire vb.)</SelectItem>
                <SelectItem value="programmatic" className="text-sm font-ui">🔄 Programmatik SEO (Otomatik sayfalar)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-design-gray dark:text-gray-400 mt-1.5 font-ui">
              {formData.type === "cornerstone" && "💡 Rehber: Kapsamlı içerik (karasu satılık daire, sapanca bungalov vb. anahtar kelime odaklı)"}
              {formData.type === "normal" && "💡 Standart: Günlük blog yazıları, haberler, kısa rehberler"}
              {formData.type === "programmatic" && "💡 Programmatik: Otomatik oluşturulan sayfalar için"}
            </p>
          </div>

          <div>
            <Label htmlFor="template" className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1.5 block">İçerik Tipi</Label>
            <Select
              value={formData.template}
              onValueChange={(value) => setFormData({ ...formData, template: value })}
            >
              <SelectTrigger id="template" className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-[#E7E7E7] dark:border-[#062F28]">
                <SelectItem value="blog" className="text-sm font-ui">📝 Blog Yazısı (Genel)</SelectItem>
                <SelectItem value="neighborhood" className="text-sm font-ui">🏘️ Mahalle Rehberi</SelectItem>
                <SelectItem value="market-analysis" className="text-sm font-ui">📊 Piyasa Analizi</SelectItem>
                <SelectItem value="investment" className="text-sm font-ui">💰 Yatırım Rehberi</SelectItem>
                <SelectItem value="news" className="text-sm font-ui">📰 Emlak Haberi</SelectItem>
                <SelectItem value="howto" className="text-sm font-ui">📖 Nasıl Yapılır Rehberi</SelectItem>
                <SelectItem value="listicle" className="text-sm font-ui">📋 Liste İçerik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="topic" className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1.5 block">
            Konu / Başlık <span className="text-red-500">*</span>
          </Label>
          <Input
            id="topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="Örn: Karasu Liman Mahallesi'nde Emlak Fiyatları 2025"
            className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
          />
          <p className="text-[11px] text-design-gray dark:text-gray-400 mt-1.5 font-ui">
            💡 İpucu: Mahalle adı, emlak tipi veya bölge bilgisi ekleyin (Karasu, Kocaali, mahalle adları)
          </p>
        </div>

        <div>
          <Label htmlFor="brief" className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1.5 block">
            Detaylar / Özet (Opsiyonel)
          </Label>
          <Textarea
            id="brief"
            value={formData.brief}
            onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
            placeholder="Örn: Karasu Liman Mahallesi'ndeki son fiyat trendleri, mahalle özellikleri, denize yakınlık, ulaşım imkanları, yatırım potansiyeli hakkında detaylı bir rehber..."
            rows={5}
            className="text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui resize-none"
          />
          <p className="text-[11px] text-design-gray dark:text-gray-400 mt-1.5 font-ui">
            💡 İpucu: Hangi konuları kapsamasını istediğinizi, hedef kitleyi veya özel vurguları belirtin
          </p>
        </div>

        {/* Quick Start Suggestions - Karasu Emlak Specific */}
        <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-blue-50/30 p-4">
          <p className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-3">
            ⚡ Hızlı Başlangıç Önerileri
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Mahalle Rehberi", topic: "Karasu [Mahalle Adı] Mahallesi Rehberi: Fiyatlar, Özellikler ve Yatırım Analizi" },
              { label: "Emlak Haberi", topic: "Karasu'da Emlak Piyasası: 2025 Yılı Trendleri ve Fırsatlar" },
              { label: "Yatırım Analizi", topic: "Karasu Sahilinde Yatırım: Satılık Ev Fiyatları ve Kira Getirisi" },
              { label: "Bölge Rehberi", topic: "Karasu ve Kocaali Bölgesi: Emlak Piyasası ve Yaşam Kalitesi" },
            ].map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => setFormData({ ...formData, topic: suggestion.topic })}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white/80 hover:bg-[#006AFF]/5 hover:border-[#006AFF]/30 text-slate-700 hover:text-[#006AFF] transition-all font-ui font-medium"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => router.back()} className="h-9 px-4 text-sm font-ui border border-[#E7E7E7] dark:border-[#062F28] rounded-lg hover-scale">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !formData.topic} className="h-9 px-4 text-sm font-ui bg-gradient-to-r from-[#006AFF] to-blue-600 hover:from-[#0052CC] hover:to-blue-700 text-white rounded-lg hover-scale micro-bounce shadow-md">
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                AI ile Oluştur
              </>
            )}
          </Button>
        </div>
          </TabsContent>

          <TabsContent value="keywords" className="mt-4">
            <KeywordBasedContentGenerator locale={locale} />
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <ContentTemplates onSelectTemplate={handleTemplateSelect} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

