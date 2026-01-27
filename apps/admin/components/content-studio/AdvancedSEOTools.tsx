"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface AdvancedSEOToolsProps {
  content: {
    title: string;
    content: string;
    metaDescription?: string;
    keywords?: string;
  };
  onUpdate?: (updates: any) => void;
  className?: string;
}

export function AdvancedSEOTools({
  content,
  onUpdate,
  className,
}: AdvancedSEOToolsProps) {
  const [seoData, setSeoData] = useState({
    metaTitle: content.title,
    metaDescription: content.metaDescription || "",
    keywords: content.keywords || "",
    canonicalUrl: "",
    focusKeyword: "",
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyzeSEO();
  }, [content]);

  const analyzeSEO = async () => {
    setLoading(true);
    try {
      // Mock SEO analysis (in production, use OpenAI or SEO API)
      const wordCount = content.content.split(/\s+/).length;
      const headingCount = (content.content.match(/<h[2-6]>/gi) || []).length;
      const linkCount = (content.content.match(/<a\s+href/gi) || []).length;
      const imageCount = (content.content.match(/<img/gi) || []).length;

      const issues: string[] = [];
      const suggestions: string[] = [];

      if (wordCount < 300) {
        issues.push("İçerik çok kısa (minimum 300 kelime önerilir)");
      }
      if (headingCount < 2) {
        issues.push("Daha fazla başlık ekleyin (H2, H3)");
      }
      if (linkCount === 0) {
        suggestions.push("İç linkler ekleyin");
      }
      if (imageCount === 0) {
        suggestions.push("Görseller ekleyin");
      }
      if (!content.metaDescription || content.metaDescription.length < 120) {
        issues.push("Meta açıklama çok kısa (120-160 karakter önerilir)");
      }
      if (content.title.length > 60) {
        issues.push("Başlık çok uzun (60 karakterden kısa olmalı)");
      }

      setAnalysis({
        wordCount,
        headingCount,
        linkCount,
        imageCount,
        titleLength: content.title.length,
        metaDescriptionLength: content.metaDescription?.length || 0,
        issues,
        suggestions,
        score: Math.max(
          0,
          100 -
            issues.length * 10 -
            (wordCount < 300 ? 20 : 0) -
            (headingCount < 2 ? 10 : 0)
        ),
      });
    } catch (error) {
      console.error("SEO analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSEOSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/content-studio/seo-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.title,
          content: content.content,
          currentMetaDescription: seoData.metaDescription,
        }),
      });

      const data = await response.json();
      if (data.suggestions) {
        setSeoData({
          ...seoData,
          metaDescription: data.suggestions.metaDescription || seoData.metaDescription,
          keywords: data.suggestions.keywords || seoData.keywords,
        });
        toast.success("SEO önerileri oluşturuldu");
      }
    } catch (error) {
      toast.error("SEO önerileri oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        meta_title: seoData.metaTitle,
        meta_description: seoData.metaDescription,
        seo_keywords: seoData.keywords,
        canonical_url: seoData.canonicalUrl,
      });
    }
    toast.success("SEO ayarları kaydedildi");
  };

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Gelişmiş SEO Araçları
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-[#E7E7E7]/30 dark:bg-muted/30 p-1">
            <TabsTrigger value="analysis" className="rounded-lg font-ui text-sm">
              Analiz
            </TabsTrigger>
            <TabsTrigger value="metadata" className="rounded-lg font-ui text-sm">
              Metadata
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-lg font-ui text-sm">
              Öneriler
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            {analysis && (
              <>
                <div className="p-4 rounded-xl bg-gradient-to-r from-design-light/10 to-transparent border border-design-light/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-ui font-semibold text-foreground">
                      SEO Skoru
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-base font-display font-bold px-3 py-1",
                        analysis.score >= 80
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                          : analysis.score >= 60
                          ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                      )}
                    >
                      {analysis.score}/100
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-ui mb-1">
                        Kelime Sayısı
                      </p>
                      <p className="text-sm font-display font-bold text-foreground">
                        {analysis.wordCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-ui mb-1">
                        Başlık Sayısı
                      </p>
                      <p className="text-sm font-display font-bold text-foreground">
                        {analysis.headingCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-ui mb-1">
                        Link Sayısı
                      </p>
                      <p className="text-sm font-display font-bold text-foreground">
                        {analysis.linkCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-ui mb-1">
                        Görsel Sayısı
                      </p>
                      <p className="text-sm font-display font-bold text-foreground">
                        {analysis.imageCount}
                      </p>
                    </div>
                  </div>
                </div>

                {analysis.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-ui font-semibold text-foreground">
                        Sorunlar
                      </span>
                    </div>
                    <div className="space-y-1">
                      {analysis.issues.map((issue: string, index: number) => (
                        <div
                          key={index}
                          className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                        >
                          <p className="text-xs font-ui text-yellow-800 dark:text-yellow-300">
                            {issue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-ui font-semibold text-foreground">
                        Öneriler
                      </span>
                    </div>
                    <div className="space-y-1">
                      {analysis.suggestions.map((suggestion: string, index: number) => (
                        <div
                          key={index}
                          className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                        >
                          <p className="text-xs font-ui text-green-800 dark:text-green-300">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="meta-title" className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 block">
                  Meta Başlık
                </Label>
                <Input
                  id="meta-title"
                  value={seoData.metaTitle}
                  onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                  className="h-10 text-sm border border-border/40 dark:border-border/40 rounded-xl font-ui input-modern"
                  maxLength={60}
                />
                <p className="text-[10px] text-muted-foreground font-ui mt-1">
                  {seoData.metaTitle.length}/60 karakter
                </p>
              </div>

              <div>
                <Label htmlFor="meta-description" className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 block">
                  Meta Açıklama
                </Label>
                <Textarea
                  id="meta-description"
                  value={seoData.metaDescription}
                  onChange={(e) =>
                    setSeoData({ ...seoData, metaDescription: e.target.value })
                  }
                  rows={3}
                  className="text-sm border border-border/40 dark:border-border/40 rounded-xl font-ui input-modern"
                  maxLength={160}
                />
                <p className="text-[10px] text-muted-foreground font-ui mt-1">
                  {seoData.metaDescription.length}/160 karakter
                </p>
              </div>

              <div>
                <Label htmlFor="keywords" className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 block">
                  Anahtar Kelimeler
                </Label>
                <Input
                  id="keywords"
                  value={seoData.keywords}
                  onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                  placeholder="kelime1, kelime2, kelime3"
                  className="h-10 text-sm border border-border/40 dark:border-border/40 rounded-xl font-ui input-modern"
                />
              </div>

              <div>
                <Label htmlFor="canonical" className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 block">
                  Canonical URL
                </Label>
                <Input
                  id="canonical"
                  value={seoData.canonicalUrl}
                  onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
                  placeholder="https://example.com/page"
                  className="h-10 text-sm border border-border/40 dark:border-border/40 rounded-xl font-ui input-modern"
                />
              </div>

              <Button
                onClick={handleSave}
                className="w-full h-10 bg-gradient-to-r from-design-dark to-design-dark/90 hover:from-design-dark/95 hover:to-design-dark/90 text-white rounded-xl font-ui hover-scale micro-bounce shadow-lg"
              >
                Kaydet
              </Button>
            </div>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-design-light/10 to-transparent border border-design-light/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-ui font-semibold text-foreground">
                  AI ile SEO Önerileri
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-ui mb-4">
                OpenAI kullanarak içeriğiniz için optimize edilmiş SEO önerileri oluşturun.
              </p>
              <Button
                onClick={generateSEOSuggestions}
                disabled={loading}
                className="w-full h-10 bg-gradient-to-r from-design-dark to-design-dark/90 hover:from-design-dark/95 hover:to-design-dark/90 text-white rounded-xl font-ui hover-scale micro-bounce shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {loading ? "Oluşturuluyor..." : "Önerileri Oluştur"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

