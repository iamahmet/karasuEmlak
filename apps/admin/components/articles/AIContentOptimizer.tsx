"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface OptimizationSuggestion {
  type: "improvement" | "warning" | "info";
  category: "seo" | "content" | "readability" | "structure";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AIContentOptimizerProps {
  article: {
    title?: string;
    content?: string;
    excerpt?: string | null;
    meta_description?: string | null;
    seo_keywords?: string | null;
    featured_image?: string | null;
  };
  onOptimize: (updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    meta_description?: string;
    seo_keywords?: string;
  }) => void;
  className?: string;
}

export function AIContentOptimizer({ article, onOptimize, className }: AIContentOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [optimizing, setOptimizing] = useState<string | null>(null);

  const analyzeContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/analyze-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          meta_description: article.meta_description,
          seo_keywords: article.seo_keywords,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.suggestions) {
        setSuggestions(data.suggestions);
        toast.success("İçerik analiz edildi");
      } else {
        throw new Error(data.error || "Analiz yapılamadı");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Analiz yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  const optimizeField = async (field: "title" | "content" | "excerpt" | "meta_description" | "seo_keywords") => {
    // Validate field and currentValue
    const currentValue = article[field];
    if (!field) {
      toast.error("Alan belirtilmedi");
      return;
    }
    if (currentValue === undefined || currentValue === null || currentValue === "") {
      toast.error(`${field === "title" ? "Başlık" : field === "content" ? "İçerik" : field === "excerpt" ? "Özet" : field === "meta_description" ? "Meta açıklama" : "SEO anahtar kelimeleri"} boş, önce bir değer girin`);
      return;
    }

    setOptimizing(field);
    try {
      const response = await fetch("/api/ai/optimize-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          currentValue: currentValue || "",
          context: {
            title: article.title || "",
            content: article.content || "",
            excerpt: article.excerpt || "",
          },
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.optimized) {
        onOptimize({ [field]: data.optimized });
        toast.success(`${field === "title" ? "Başlık" : field === "content" ? "İçerik" : field === "excerpt" ? "Özet" : field === "meta_description" ? "Meta açıklama" : "SEO anahtar kelimeleri"} optimize edildi`);
      } else {
        throw new Error(data.error || "Optimizasyon yapılamadı");
      }
    } catch (error: any) {
      console.error("Optimization error:", error);
      toast.error(error.message || "Optimizasyon yapılamadı");
    } finally {
      setOptimizing(null);
    }
  };

  const wordCount = article.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
  const headingCount = (article.content?.match(/<h[2-6][^>]*>/gi) || []).length || 0;
  const linkCount = (article.content?.match(/<a[^>]*>/gi) || []).length || 0;

  // Quick analysis
  const quickIssues: OptimizationSuggestion[] = [];
  
  if (article.title && (article.title.length < 30 || article.title.length > 60)) {
    quickIssues.push({
      type: "warning",
      category: "seo",
      title: "Başlık uzunluğu",
      description: `Başlık ${article.title.length} karakter. SEO için 30-60 karakter arası önerilir.`,
      action: {
        label: "Optimize Et",
        onClick: () => optimizeField("title"),
      },
    });
  }

  if (wordCount < 300) {
    quickIssues.push({
      type: "warning",
      category: "content",
      title: "İçerik çok kısa",
      description: `İçerik ${wordCount} kelime. Minimum 300 kelime önerilir.`,
    });
  }

  if (!article.meta_description || article.meta_description.length < 120 || article.meta_description.length > 160) {
    quickIssues.push({
      type: "warning",
      category: "seo",
      title: "Meta açıklama",
      description: article.meta_description 
        ? `Meta açıklama ${article.meta_description.length} karakter. 120-160 karakter arası önerilir.`
        : "Meta açıklama eksik.",
      action: {
        label: "Optimize Et",
        onClick: () => optimizeField("meta_description"),
      },
    });
  }

  const keywordsArray = Array.isArray(article.seo_keywords) ? article.seo_keywords : (typeof article.seo_keywords === 'string' ? article.seo_keywords.split(",").filter(k => k.trim()) : []);
  if (!article.seo_keywords || keywordsArray.length < 3) {
    quickIssues.push({
      type: "warning",
      category: "seo",
      title: "SEO anahtar kelimeleri",
      description: "En az 3 SEO anahtar kelimesi önerilir.",
      action: {
        label: "Optimize Et",
        onClick: () => optimizeField("seo_keywords"),
      },
    });
  }

  if (headingCount < 2) {
    quickIssues.push({
      type: "info",
      category: "structure",
      title: "Başlık sayısı",
      description: `Sadece ${headingCount} başlık var. Daha fazla başlık ekleyerek içeriği yapılandırın.`,
    });
  }

  if (linkCount < 2) {
    quickIssues.push({
      type: "info",
      category: "content",
      title: "İç linkler",
      description: "Daha fazla iç link ekleyerek SEO'yu iyileştirin.",
    });
  }

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-design-light" />
            AI İçerik Optimizasyonu
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={analyzeContent}
            disabled={loading}
            className="h-9 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Analiz...
              </>
            ) : (
              <>
                <Search className="h-3 w-3 mr-1" />
                Detaylı Analiz
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Optimize all fields
              Promise.all([
                optimizeField("title"),
                optimizeField("meta_description"),
                optimizeField("seo_keywords"),
              ]);
            }}
            disabled={optimizing !== null}
            className="h-9 text-xs"
          >
            {optimizing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Optimize...
              </>
            ) : (
              <>
                <Wand2 className="h-3 w-3 mr-1" />
                Tümünü Optimize Et
              </>
            )}
          </Button>
        </div>

        {/* Quick Issues */}
        {quickIssues.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Hızlı İyileştirmeler
            </h3>
            {quickIssues.map((issue, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  issue.type === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                    : issue.type === "improvement"
                    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {issue.type === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      ) : issue.type === "improvement" ? (
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                      <h4 className="text-sm font-semibold text-design-dark dark:text-white">
                        {issue.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px]">
                        {issue.category === "seo" ? "SEO" : issue.category === "content" ? "İçerik" : issue.category === "readability" ? "Okunabilirlik" : "Yapı"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {issue.description}
                    </p>
                  </div>
                  {issue.action && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={issue.action.onClick}
                      disabled={optimizing === issue.category}
                      className="h-7 px-2 text-xs"
                    >
                      {optimizing === issue.category ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          {issue.action.label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-design-light" />
              AI Önerileri
            </h3>
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  suggestion.type === "improvement"
                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                    : suggestion.type === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                    : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {suggestion.type === "improvement" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : suggestion.type === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                      <h4 className="text-sm font-semibold text-design-dark dark:text-white">
                        {suggestion.title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                  </div>
                  {suggestion.action && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={suggestion.action.onClick}
                      className="h-7 px-2 text-xs"
                    >
                      {suggestion.action.label}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {quickIssues.length === 0 && suggestions.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50 text-green-500" />
            <p className="text-sm">
              İçerik analiz edilmeye hazır. "Detaylı Analiz" butonuna tıklayın.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


