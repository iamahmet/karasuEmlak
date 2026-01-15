"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface SEOSuggestion {
  id: string;
  type: "critical" | "warning" | "info" | "tip";
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: number;
  actionUrl?: string;
  actionLabel?: string;
  affectedItems?: number;
}

export function SEOSuggestions({ locale = "tr" }: { locale?: string }) {
  const [suggestions, setSuggestions] = useState<SEOSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info" | "tip">("all");

  useEffect(() => {
    fetchSuggestions();
    const interval = setInterval(fetchSuggestions, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchSuggestions = async () => {
    try {
      const supabase = createClient();
      
      // Fetch SEO-related data to generate suggestions
      const [
        articlesResult,
        publishedResult,
        viewsResult,
        backlinksResult,
      ] = await Promise.all([
        supabase.from("articles").select("id, title, slug, meta_description, featured_image, status").limit(100),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("articles").select("views, meta_description").limit(100),
        // seo_competitors table doesn't exist, use empty result
        Promise.resolve({ data: null, count: 0, error: null }),
      ]);

      const articles = articlesResult.data || [];
      const publishedCount = publishedResult.count || 0;
      const articlesWithoutMeta = articles.filter((a) => !a.meta_description || a.meta_description.length < 50);
      const articlesWithoutImage = articles.filter((a) => !a.featured_image);
      const lowViewsArticles = viewsResult.data?.filter((a) => (a.views || 0) < 10) || [];
      const backlinksCount = backlinksResult.count || 0;

      const generatedSuggestions: SEOSuggestion[] = [];

      // Critical suggestions
      if (articlesWithoutMeta.length > 0) {
        generatedSuggestions.push({
          id: "missing-meta-descriptions",
          type: "critical",
          category: "Meta Tags",
          title: `${articlesWithoutMeta.length} içerikte meta açıklama eksik`,
          description: "Meta açıklamalar SEO için kritik öneme sahiptir. Her içeriğin en az 50 karakterlik meta açıklaması olmalıdır.",
          impact: "high",
          priority: 1,
          actionUrl: `/${locale}/seo/content-studio?tab=drafts`,
          actionLabel: "Meta Açıklamaları Ekle",
          affectedItems: articlesWithoutMeta.length,
        });
      }

      if (articlesWithoutImage.length > 0) {
        generatedSuggestions.push({
          id: "missing-featured-images",
          type: "critical",
          category: "Images",
          title: `${articlesWithoutImage.length} içerikte öne çıkan görsel eksik`,
          description: "Öne çıkan görseller hem kullanıcı deneyimini hem de sosyal medya paylaşımlarını iyileştirir.",
          impact: "high",
          priority: 2,
          actionUrl: `/${locale}/seo/content-studio?tab=drafts`,
          actionLabel: "Görselleri Ekle",
          affectedItems: articlesWithoutImage.length,
        });
      }

      // Warning suggestions
      if (lowViewsArticles.length > 5) {
        generatedSuggestions.push({
          id: "low-performing-content",
          type: "warning",
          category: "Performance",
          title: `${lowViewsArticles.length} içerik düşük performans gösteriyor`,
          description: "Bu içeriklerin SEO optimizasyonunu gözden geçirmeyi düşünün.",
          impact: "medium",
          priority: 3,
          actionUrl: `/${locale}/seo/booster?tab=content`,
          actionLabel: "İçerikleri Optimize Et",
          affectedItems: lowViewsArticles.length,
        });
      }

      if (backlinksCount < 50) {
        generatedSuggestions.push({
          id: "low-backlinks",
          type: "warning",
          category: "Backlinks",
          title: "Backlink sayısı düşük",
          description: `Şu anda ${backlinksCount} backlink kaydedilmiş. Daha fazla backlink SEO performansınızı artırabilir.`,
          impact: "medium",
          priority: 4,
          actionUrl: `/${locale}/seo/booster?tab=backlinks`,
          actionLabel: "Backlink Stratejisi",
          affectedItems: undefined,
        });
      }

      // Info suggestions
      if (publishedCount < 20) {
        generatedSuggestions.push({
          id: "increase-content",
          type: "info",
          category: "Content",
          title: "Daha fazla içerik yayınlayın",
          description: `Şu anda ${publishedCount} yayınlanmış içerik var. Daha fazla içerik SEO performansınızı artırabilir.`,
          impact: "medium",
          priority: 5,
          actionUrl: `/${locale}/seo/content-studio?tab=create`,
          actionLabel: "Yeni İçerik Oluştur",
          affectedItems: undefined,
        });
      }

      // Tips
      generatedSuggestions.push({
        id: "internal-linking-tip",
        type: "tip",
        category: "Internal Linking",
        title: "İç bağlantıları artırın",
        description: "İç bağlantılar sayfa otoritesini artırır ve kullanıcı deneyimini iyileştirir.",
        impact: "low",
        priority: 6,
        actionUrl: `/${locale}/seo/control/links`,
        actionLabel: "İç Bağlantıları Yönet",
        affectedItems: undefined,
      });

      // Sort by priority
      generatedSuggestions.sort((a, b) => a.priority - b.priority);
      setSuggestions(generatedSuggestions);
    } catch (error) {
      console.error("Failed to fetch SEO suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "info":
        return <Search className="h-5 w-5 text-blue-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getSuggestionBadge = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "warning":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    }
  };

  const filteredSuggestions = filter === "all" 
    ? suggestions 
    : suggestions.filter((s) => s.type === filter);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-5">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="h-8 px-3 text-xs"
        >
          Tümü ({suggestions.length})
        </Button>
        <Button
          variant={filter === "critical" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("critical")}
          className="h-8 px-3 text-xs"
        >
          Kritik ({suggestions.filter((s) => s.type === "critical").length})
        </Button>
        <Button
          variant={filter === "warning" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("warning")}
          className="h-8 px-3 text-xs"
        >
          Uyarı ({suggestions.filter((s) => s.type === "warning").length})
        </Button>
        <Button
          variant={filter === "info" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("info")}
          className="h-8 px-3 text-xs"
        >
          Bilgi ({suggestions.filter((s) => s.type === "info").length})
        </Button>
        <Button
          variant={filter === "tip" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("tip")}
          className="h-8 px-3 text-xs"
        >
          İpucu ({suggestions.filter((s) => s.type === "tip").length})
        </Button>
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <Card className="card-professional">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600 opacity-50" />
            <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
              {filter === "all" 
                ? "Tüm öneriler tamamlandı! Harika iş çıkarıyorsunuz." 
                : "Bu kategoride öneri bulunmuyor."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className="card-professional hover-lift transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                        {suggestion.title}
                      </h4>
                      <Badge className={cn("text-[10px] px-2 py-0.5", getSuggestionBadge(suggestion.type))}>
                        {suggestion.type === "critical" ? "Kritik" : 
                         suggestion.type === "warning" ? "Uyarı" : 
                         suggestion.type === "info" ? "Bilgi" : "İpucu"}
                      </Badge>
                      <Badge className={cn("text-[10px] px-2 py-0.5", getImpactBadge(suggestion.impact))}>
                        {suggestion.impact === "high" ? "Yüksek Etki" : 
                         suggestion.impact === "medium" ? "Orta Etki" : "Düşük Etki"}
                      </Badge>
                      {suggestion.affectedItems && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                          {suggestion.affectedItems} öğe
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-3">
                      {suggestion.description}
                    </p>
                    {suggestion.actionUrl && suggestion.actionLabel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.href = suggestion.actionUrl!;
                        }}
                        className="h-8 px-3 text-xs gap-1"
                      >
                        {suggestion.actionLabel}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
