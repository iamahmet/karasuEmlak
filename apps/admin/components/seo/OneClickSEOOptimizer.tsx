"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Progress } from "@karasu/ui";
import {
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  Target,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface SEOOptimizationResult {
  title: string;
  meta_description: string;
  seo_keywords: string;
  excerpt: string;
  content_improvements: {
    suggested_headings?: string[];
    suggested_internal_links?: Array<{
      text: string;
      url: string;
      position: string;
    }>;
    suggested_faq?: Array<{
      question: string;
      answer: string;
    }>;
    word_count_target?: number;
    keyword_density?: string;
    lsi_keywords?: string[];
  };
  seo_score: number;
  improvements: string[];
}

interface OneClickSEOOptimizerProps {
  content: {
    id: string;
    title: string;
    content: string;
    excerpt?: string | null;
    meta_description?: string | null;
    seo_keywords?: string | null;
    slug?: string;
    type?: "article" | "news" | "listing";
    locale?: string;
  };
  onOptimize: (optimized: {
    title?: string;
    meta_description?: string;
    seo_keywords?: string;
    excerpt?: string;
  }) => void;
  onApplyAll?: (optimized: SEOOptimizationResult) => void;
  className?: string;
}

export function OneClickSEOOptimizer({
  content,
  onOptimize,
  onApplyAll,
  className,
}: OneClickSEOOptimizerProps) {
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<SEOOptimizationResult | null>(null);
  const [applying, setApplying] = useState(false);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());

  const handleOptimize = async () => {
    setOptimizing(true);
    setResult(null);
    setAppliedFields(new Set());

    try {
      const response = await fetch("/api/seo/optimize-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.title,
          content: content.content,
          excerpt: content.excerpt,
          meta_description: content.meta_description,
          seo_keywords: content.seo_keywords,
          slug: content.slug,
          type: content.type || "article",
          locale: content.locale || "tr",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Optimizasyon başarısız");
      }

      const data = await response.json();
      
      if (!data.success || !data.optimized) {
        throw new Error("Geçersiz optimizasyon sonucu");
      }

      setResult(data.optimized);
      toast.success("SEO optimizasyonu tamamlandı!");
    } catch (error: any) {
      console.error("Optimization error:", error);
      toast.error(error.message || "Optimizasyon yapılamadı");
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplyField = (field: "title" | "meta_description" | "seo_keywords" | "excerpt") => {
    if (!result) return;

    const value = result[field];
    if (value) {
      onOptimize({ [field]: value });
      setAppliedFields((prev) => new Set(prev).add(field));
      toast.success(`${field === "title" ? "Başlık" : field === "meta_description" ? "Meta açıklama" : field === "seo_keywords" ? "SEO anahtar kelimeleri" : "Özet"} uygulandı`);
    }
  };

  const handleApplyAll = async () => {
    if (!result) return;

    setApplying(true);
    try {
      onOptimize({
        title: result.title,
        meta_description: result.meta_description,
        seo_keywords: result.seo_keywords,
        excerpt: result.excerpt,
      });

      if (onApplyAll) {
        onApplyAll(result);
      }

      setAppliedFields(new Set(["title", "meta_description", "seo_keywords", "excerpt"]));
      toast.success("Tüm optimizasyonlar uygulandı!");
    } catch (error: any) {
      toast.error(error.message || "Uygulama başarısız");
    } finally {
      setApplying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <Card className={cn("card-professional bg-card relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-design-light/5 to-transparent rounded-full blur-3xl"></div>
      
      <CardHeader className="pb-4 px-5 pt-5 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-display font-bold text-foreground flex items-center gap-3">
            <span className="w-1 h-6 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full shadow-lg"></span>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Tek Tıkla SEO Optimizasyonu
            </div>
          </CardTitle>
          {result && (
            <Badge className={cn("text-xs px-3 py-1", getScoreBgColor(result.seo_score))}>
              <span className={cn("font-bold", getScoreColor(result.seo_score))}>
                SEO Skoru: {result.seo_score}/100
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 relative z-10 space-y-6">
        {/* Optimize Button */}
        {!result && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-design-light/20 to-design-light/10 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              AI Destekli SEO Optimizasyonu
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              En güçlü SEO teknikleri ile içeriğinizi tek tıkla optimize edin. 
              Başlık, meta açıklama, anahtar kelimeler ve içerik yapısı profesyonel seviyede optimize edilecek.
            </p>
            <Button
              onClick={handleOptimize}
              disabled={optimizing}
              size="lg"
              className="gap-2 bg-gradient-to-r from-design-light to-design-light/90 hover:from-design-light hover:to-design-light text-white shadow-lg hover:shadow-xl"
            >
              {optimizing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Optimize Ediliyor...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  SEO'yu Optimize Et
                </>
              )}
            </Button>
          </div>
        )}

        {/* Optimization Results */}
        {result && (
          <div className="space-y-6">
            {/* SEO Score */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-[#062F28] dark:to-[#0a3d35] border border-slate-200/50 dark:border-[#0a3d35]/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">SEO Skoru</span>
                </div>
                <span className={cn("text-2xl font-bold", getScoreColor(result.seo_score))}>
                  {result.seo_score}/100
                </span>
              </div>
              <Progress 
                value={result.seo_score} 
                max={100}
                variant={result.seo_score >= 80 ? "success" : result.seo_score >= 60 ? "warning" : "error"}
                className="h-2"
              />
            </div>

            {/* Optimized Fields */}
            <div className="space-y-4">
              {/* Title */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">Başlık</span>
                  </div>
                  {appliedFields.has("title") ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Uygulandı
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyField("title")}
                      className="h-7 text-xs"
                    >
                      Uygula
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-through mb-1">
                  {content.title}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {result.title}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{content.title.length} → {result.title.length} karakter</span>
                  {result.title.length >= 30 && result.title.length <= 60 && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-[10px]">
                      ✓ Optimal
                    </Badge>
                  )}
                </div>
              </div>

              {/* Meta Description */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">Meta Açıklama</span>
                  </div>
                  {appliedFields.has("meta_description") ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Uygulandı
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyField("meta_description")}
                      className="h-7 text-xs"
                    >
                      Uygula
                    </Button>
                  )}
                </div>
                {content.meta_description && (
                  <p className="text-sm text-muted-foreground line-through mb-1">
                    {content.meta_description}
                  </p>
                )}
                <p className="text-sm font-medium text-foreground">
                  {result.meta_description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {content.meta_description?.length || 0} → {result.meta_description.length} karakter
                  </span>
                  {result.meta_description.length >= 120 && result.meta_description.length <= 160 && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-[10px]">
                      ✓ Optimal
                    </Badge>
                  )}
                </div>
              </div>

              {/* SEO Keywords */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">SEO Anahtar Kelimeleri</span>
                  </div>
                  {appliedFields.has("seo_keywords") ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Uygulandı
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyField("seo_keywords")}
                      className="h-7 text-xs"
                    >
                      Uygula
                    </Button>
                  )}
                </div>
                {content.seo_keywords && (
                  <p className="text-sm text-muted-foreground line-through mb-1">
                    {content.seo_keywords}
                  </p>
                )}
                <p className="text-sm font-medium text-foreground">
                  {result.seo_keywords}
                </p>
              </div>

              {/* Excerpt */}
              {result.excerpt && (
                <div className="p-4 rounded-xl border border-border/50 bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm text-foreground">Özet</span>
                    </div>
                    {appliedFields.has("excerpt") ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Uygulandı
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyField("excerpt")}
                        className="h-7 text-xs"
                      >
                        Uygula
                      </Button>
                    )}
                  </div>
                  {content.excerpt && (
                    <p className="text-sm text-muted-foreground line-through mb-1">
                      {content.excerpt}
                    </p>
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {result.excerpt}
                  </p>
                </div>
              )}
            </div>

            {/* Content Improvements */}
            {result.content_improvements && (
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  İçerik İyileştirme Önerileri
                </h4>
                <div className="space-y-3">
                  {result.content_improvements.suggested_headings && result.content_improvements.suggested_headings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Önerilen Başlıklar:</p>
                      <ul className="list-disc list-inside text-xs text-foreground space-y-1">
                        {result.content_improvements.suggested_headings.map((heading, i) => (
                          <li key={i}>{heading}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.content_improvements.lsi_keywords && result.content_improvements.lsi_keywords.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">LSI Anahtar Kelimeler:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.content_improvements.lsi_keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.content_improvements.word_count_target && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Hedef Kelime Sayısı: {result.content_improvements.word_count_target} kelime
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Improvements List */}
            {result.improvements && result.improvements.length > 0 && (
              <div className="p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  İyileştirme Önerileri
                </h4>
                <ul className="space-y-1">
                  {result.improvements.map((improvement, i) => (
                    <li key={i} className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-[#0a3d35]/50">
              <Button
                onClick={handleApplyAll}
                disabled={applying || appliedFields.size === 4}
                className="flex-1 gap-2 bg-gradient-to-r from-design-light to-design-light/90 hover:from-design-light hover:to-design-light text-white"
              >
                {applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uygulanıyor...
                  </>
                ) : appliedFields.size === 4 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Tümü Uygulandı
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Tümünü Uygula
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  setAppliedFields(new Set());
                }}
                variant="outline"
                className="gap-2"
              >
                Yeni Optimizasyon
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
