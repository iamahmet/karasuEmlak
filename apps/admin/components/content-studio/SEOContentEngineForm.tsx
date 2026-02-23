"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@karasu/ui";
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
import { Sparkles, Loader2, Target, Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SEOContentEngineFormProps {
  locale: string;
}

export function SEOContentEngineForm({ locale }: SEOContentEngineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [coverageMap, setCoverageMap] = useState<
    Array<{ title: string; primaryKeyword: string; intent: string; slug: string; type: string }>
  >([]);

  const [form, setForm] = useState({
    primaryKeyword: "",
    secondaryKeywords: "",
    pageType: "blog" as "cornerstone" | "blog",
    region: "Karasu" as "Karasu" | "Sapanca" | "Kocaali" | "Sakarya",
    funnelStage: "MOFU" as "TOFU" | "MOFU" | "BOFU",
    cta: "ilan ara" as "ilan ara" | "iletişim" | "WhatsApp",
    ramadanMode: false,
    pillarSlug: "",
    supportingSlugs: "",
    crossLinkSlugs: "",
    ramadanKeywords: "",
  });

  const fetchCoverageMap = async () => {
    if (!form.primaryKeyword.trim()) {
      toast.error("Önce primary keyword girin");
      return;
    }
    setCoverageLoading(true);
    try {
      const cluster = ["Karasu", "Kocaali", "Sakarya"].includes(form.region) ? "karasu" : "sapanca";
      const res = await fetch(
        `/api/content-studio/coverage-map?cluster=${cluster}&keyword=${encodeURIComponent(form.primaryKeyword)}`
      );
      const data = await res.json();
      if (data.success && data.data?.suggestions) {
        setCoverageMap(data.data.suggestions);
        toast.success("Coverage map yüklendi: 1 rehber + 5 blog");
      }
    } catch (e) {
      toast.error("Coverage map yüklenemedi");
    } finally {
      setCoverageLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!form.primaryKeyword.trim()) {
      toast.error("Primary keyword gereklidir");
      return;
    }
    setLoading(true);
    try {
      toast.info("SEO Content Engine ile içerik oluşturuluyor...");
      const res = await fetch("/api/content-studio/seo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryKeyword: form.primaryKeyword.trim(),
          secondaryKeywords: form.secondaryKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          pageType: form.pageType,
          region: form.region,
          funnelStage: form.funnelStage,
          cta: form.cta,
          locale,
          ramadanMode: form.ramadanMode,
          pillarSlug: form.pillarSlug.trim() || undefined,
          supportingSlugs: form.supportingSlugs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          crossLinkSlugs: form.crossLinkSlugs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          ramadanKeywords: form.ramadanKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || data.error || "İçerik oluşturulamadı");
        return;
      }

      const contentId = data.data?.contentId || data.data?.articleId;
      if (contentId) {
        toast.success("✅ SEO içerik oluşturuldu! Editöre yönlendiriliyorsunuz...");
        setTimeout(() => router.push(`/${locale}/articles/${contentId}`), 800);
      }
    } catch (e: any) {
      toast.error(e.message || "İçerik oluşturulurken hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-professional">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>SEO Content Engine</CardTitle>
        </div>
        <CardDescription>
          Intent + UX + topical authority odaklı içerik. Karasu/Sapanca emlak cluster'ları için.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Primary Keyword *</Label>
            <Input
              value={form.primaryKeyword}
              onChange={(e) => setForm({ ...form, primaryKeyword: e.target.value })}
              placeholder="karasu satılık daire"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Secondary Keywords (virgülle ayırın)</Label>
            <Input
              value={form.secondaryKeywords}
              onChange={(e) => setForm({ ...form, secondaryKeywords: e.target.value })}
              placeholder="karasu daire fiyatları, karasu emlak"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Page Type</Label>
            <Select
              value={form.pageType}
              onValueChange={(v: "cornerstone" | "blog") => setForm({ ...form, pageType: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="cornerstone">Rehber</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Region</Label>
            <Select
              value={form.region}
              onValueChange={(v: "Karasu" | "Sapanca" | "Kocaali" | "Sakarya") =>
                setForm({ ...form, region: v })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Karasu">Karasu</SelectItem>
                <SelectItem value="Sapanca">Sapanca</SelectItem>
                <SelectItem value="Kocaali">Kocaali</SelectItem>
                <SelectItem value="Sakarya">Sakarya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Funnel Stage</Label>
            <Select
              value={form.funnelStage}
              onValueChange={(v: "TOFU" | "MOFU" | "BOFU") => setForm({ ...form, funnelStage: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOFU">TOFU</SelectItem>
                <SelectItem value="MOFU">MOFU</SelectItem>
                <SelectItem value="BOFU">BOFU</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ramadanMode"
            checked={form.ramadanMode}
            onChange={(e) => setForm({ ...form, ramadanMode: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor="ramadanMode">Ramazan modülü ekle (seasonal)</Label>
        </div>

        {form.ramadanMode && (
          <div>
            <Label>Ramazan Keywords (virgülle ayırın)</Label>
            <Input
              value={form.ramadanKeywords}
              onChange={(e) => setForm({ ...form, ramadanKeywords: e.target.value })}
              placeholder="ramazan dönemi kiralık, ramazanda taşınma planı"
              className="mt-1"
            />
          </div>
        )}

        <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
          <h4 className="text-sm font-semibold">Internal Links (Full Article Generator)</h4>
          <div>
            <Label className="text-xs">Pillar slug</Label>
            <Input
              value={form.pillarSlug}
              onChange={(e) => setForm({ ...form, pillarSlug: e.target.value })}
              placeholder="karasu-kiralik-daire-rehberi"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Supporting slugs (virgülle)</Label>
            <Input
              value={form.supportingSlugs}
              onChange={(e) => setForm({ ...form, supportingSlugs: e.target.value })}
              placeholder="karasu-satilik-daire, karasu-emlak-fiyatlari"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Cross-link slugs (virgülle, opsiyonel)</Label>
            <Input
              value={form.crossLinkSlugs}
              onChange={(e) => setForm({ ...form, crossLinkSlugs: e.target.value })}
              placeholder="sapanca-bungalov, karasu-yazlik"
              className="mt-1 text-sm"
            />
          </div>
        </div>

        <div>
          <Label>CTA</Label>
          <Select
            value={form.cta}
            onValueChange={(v: "ilan ara" | "iletişim" | "WhatsApp") => setForm({ ...form, cta: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ilan ara">İlan Ara</SelectItem>
              <SelectItem value="iletişim">İletişim</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={handleGenerate} disabled={loading || !form.primaryKeyword}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                SEO İçerik Oluştur
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchCoverageMap}
            disabled={coverageLoading || !form.primaryKeyword}
          >
            {coverageLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Map className="h-4 w-4 mr-2" />
            )}
            Coverage Map (1+5)
          </Button>
        </div>

        {coverageMap.length > 0 && (
          <div className="mt-4 rounded-lg border p-4 space-y-2">
            <h4 className="text-sm font-semibold">Önerilen Cluster</h4>
            {coverageMap.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm py-1"
              >
                <span className="text-muted-foreground w-24">
                  {item.type === "cornerstone" ? "Pillar" : `Blog ${i}`}
                </span>
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">/{item.slug}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
