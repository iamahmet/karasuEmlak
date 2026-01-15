"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import {
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ArrowRight,
  Sparkles,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";
import { OneClickSEOOptimizer } from "./OneClickSEOOptimizer";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  meta_description?: string | null;
  seo_keywords?: string | null;
  type: "article" | "news" | "listing";
  seo_score?: number;
}

export function BulkSEOOptimizer({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchContentItems();
  }, [typeFilter, statusFilter]);

  const fetchContentItems = async () => {
    setLoading(true);
    try {
      // Fetch articles
      const articlesResponse = await fetch("/api/articles?limit=50");
      const articlesData = await articlesResponse.json();
      const articles = (articlesData.data?.articles || articlesData.articles || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        content: a.content || "",
        excerpt: a.excerpt,
        meta_description: a.meta_description,
        seo_keywords: a.seo_keywords,
        type: "article" as const,
        seo_score: calculateQuickSEOScore(a),
      }));

      // Fetch news
      const newsResponse = await fetch("/api/news?limit=50");
      const newsData = await newsResponse.json();
      const news = (newsData.data?.articles || newsData.articles || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        content: n.content || "",
        excerpt: n.excerpt,
        meta_description: n.meta_description,
        seo_keywords: n.seo_keywords,
        type: "news" as const,
        seo_score: calculateQuickSEOScore(n),
      }));

      setContentItems([...articles, ...news]);
    } catch (error: any) {
      console.error("Failed to fetch content:", error);
      toast.error("İçerikler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const calculateQuickSEOScore = (item: any): number => {
    let score = 0;
    
    // Title (20 points)
    if (item.title && item.title.length >= 30 && item.title.length <= 60) {
      score += 20;
    } else if (item.title && item.title.length >= 25 && item.title.length <= 70) {
      score += 15;
    } else if (item.title) {
      score += 5;
    }

    // Meta description (20 points)
    if (item.meta_description) {
      if (item.meta_description.length >= 120 && item.meta_description.length <= 160) {
        score += 20;
      } else if (item.meta_description.length >= 100 && item.meta_description.length <= 180) {
        score += 15;
      } else {
        score += 10;
      }
    }

    // Content length (20 points)
    const wordCount = (item.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length;
    if (wordCount >= 800) {
      score += 20;
    } else if (wordCount >= 500) {
      score += 15;
    } else if (wordCount >= 300) {
      score += 10;
    } else {
      score += 5;
    }

    // SEO keywords (10 points)
    // Handle both array and string formats
    const keywords = Array.isArray(item.seo_keywords) 
      ? item.seo_keywords 
      : (item.seo_keywords ? item.seo_keywords.split(",") : []);
    const keywordsCount = Array.isArray(keywords) ? keywords.length : (keywords ? keywords.split(",").length : 0);
    
    if (keywordsCount >= 5) {
      score += 10;
    } else if (keywordsCount > 0) {
      score += 5;
    }

    // Excerpt (10 points)
    if (item.excerpt && item.excerpt.length >= 150 && item.excerpt.length <= 200) {
      score += 10;
    } else if (item.excerpt) {
      score += 5;
    }

    // Heading structure (10 points)
    const headingCount = (item.content || "").match(/<h[2-6][^>]*>/gi)?.length || 0;
    if (headingCount >= 3) {
      score += 10;
    } else if (headingCount >= 2) {
      score += 5;
    }

    // Internal links (10 points)
    const linkCount = (item.content || "").match(/<a[^>]*>/gi)?.length || 0;
    if (linkCount >= 3) {
      score += 10;
    } else if (linkCount >= 1) {
      score += 5;
    }

    return Math.min(score, 100);
  };

  const filteredItems = contentItems.filter((item) => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (typeFilter !== "all" && item.type !== typeFilter) {
      return false;
    }
    return true;
  });

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

  const handleOptimize = async (item: ContentItem) => {
    // Optimize via API and update
    try {
      const response = await fetch("/api/seo/optimize-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          content: item.content,
          excerpt: item.excerpt,
          meta_description: item.meta_description,
          seo_keywords: item.seo_keywords,
          slug: item.slug,
          type: item.type,
          locale: locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Optimizasyon başarısız");
      }

      const data = await response.json();
      
      if (data.success && data.optimized) {
        // Update the item in the list
        setContentItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  title: data.optimized.title,
                  meta_description: data.optimized.meta_description,
                  seo_keywords: data.optimized.seo_keywords,
                  excerpt: data.optimized.excerpt,
                  seo_score: data.optimized.seo_score,
                }
              : i
          )
        );
        toast.success(`${item.title} optimize edildi!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Optimizasyon başarısız");
    }
  };

  return (
    <div className="space-y-6">
      {/* Content List */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-design-light" />
            İçerik Listesi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="İçerik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-professional"
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="input-professional">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="article">Makaleler</SelectItem>
                  <SelectItem value="news">Haberler</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end">
              <Badge variant="outline" className="text-sm">
                {filteredItems.length} içerik
              </Badge>
            </div>
          </div>

          {/* Content Items */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-design-light" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-design-gray dark:text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                İçerik bulunamadı
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer",
                    selectedItem?.id === item.id
                      ? "border-design-light bg-design-light/5 dark:bg-design-light/10"
                      : "border-border/50 hover:border-design-light/50 bg-card"
                  )}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-design-dark dark:text-white truncate">
                          {item.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-2 py-0.5", getScoreBgColor(item.seo_score || 0))}
                        >
                          <span className={cn("font-bold", getScoreColor(item.seo_score || 0))}>
                            {item.seo_score || 0}/100
                          </span>
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {item.type === "article" ? "Makale" : "Haber"}
                        </Badge>
                      </div>
                      <p className="text-xs text-design-gray dark:text-gray-400 line-clamp-2">
                        {item.excerpt || item.meta_description || "Açıklama yok"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptimize(item);
                      }}
                      className="gap-2"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Optimize Et
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Item Optimizer */}
      {selectedItem && (
        <OneClickSEOOptimizer
          content={{
            id: selectedItem.id,
            title: selectedItem.title,
            content: selectedItem.content,
            excerpt: selectedItem.excerpt || undefined,
            meta_description: selectedItem.meta_description || undefined,
            seo_keywords: selectedItem.seo_keywords || undefined,
            slug: selectedItem.slug,
            type: selectedItem.type,
            locale: locale,
          }}
          onOptimize={async (updates) => {
            // Update via API
            try {
              const endpoint = selectedItem.type === "article" 
                ? `/api/articles/${selectedItem.id}`
                : `/api/news/${selectedItem.id}`;
              
              const response = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
              });

              if (response.ok) {
                // Update local state
                setContentItems((prev) =>
                  prev.map((i) =>
                    i.id === selectedItem.id
                      ? { ...i, ...updates, seo_score: calculateQuickSEOScore({ ...selectedItem, ...updates }) }
                      : i
                  )
                );
                setSelectedItem({ ...selectedItem, ...updates });
                toast.success("Optimizasyonlar uygulandı!");
              }
            } catch (error: any) {
              toast.error(error.message || "Güncelleme başarısız");
            }
          }}
          onApplyAll={async (optimized) => {
            // Apply all optimizations
            try {
              const endpoint = selectedItem.type === "article" 
                ? `/api/articles/${selectedItem.id}`
                : `/api/news/${selectedItem.id}`;
              
              const response = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: optimized.title,
                  meta_description: optimized.meta_description,
                  seo_keywords: optimized.seo_keywords,
                  excerpt: optimized.excerpt,
                }),
              });

              if (response.ok) {
                const updated = { ...selectedItem, ...optimized };
                setContentItems((prev) =>
                  prev.map((i) =>
                    i.id === selectedItem.id
                      ? { ...updated, seo_score: optimized.seo_score }
                      : i
                  )
                );
                setSelectedItem(updated);
                toast.success("Tüm optimizasyonlar uygulandı!");
              }
            } catch (error: any) {
              toast.error(error.message || "Güncelleme başarısız");
            }
          }}
        />
      )}
    </div>
  );
}
