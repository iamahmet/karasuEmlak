"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@karasu/lib";
import Link from "next/link";
import { SEOSuggestions } from "./SEOSuggestions";
import { SEOPerformanceMetrics } from "./SEOPerformanceMetrics";

interface SEOMetric {
  label: string;
  value: number | string;
  change?: number;
  status: "good" | "warning" | "critical";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function SEOOverview({ locale }: { locale: string }) {
  const [metrics, setMetrics] = useState<SEOMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch articles with SEO data
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, meta_description, keywords, views, status")
        .eq("status", "published")
        .limit(100);

      const totalArticles = articles?.length || 0;
      const articlesWithMeta = articles?.filter((a: any) => a.meta_description).length || 0;
      const articlesWithKeywords = articles?.filter((a: any) => {
        const keywords = a.keywords;
        return Array.isArray(keywords) ? keywords.length > 0 : !!keywords;
      }).length || 0;
      const totalViews = articles?.reduce((sum: number, a: any) => sum + (a.views || 0), 0) || 0;
      const avgViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

      // Calculate SEO score
      const metaScore = totalArticles > 0 ? (articlesWithMeta / totalArticles) * 100 : 0;
      const keywordScore = totalArticles > 0 ? (articlesWithKeywords / totalArticles) * 100 : 0;
      const contentScore = totalArticles > 0 ? Math.min(100, (totalArticles / 50) * 100) : 0;
      const performanceScore = avgViews > 1000 ? 100 : (avgViews / 1000) * 100;
      
      const score = Math.round((metaScore + keywordScore + contentScore + performanceScore) / 4);
      setOverallScore(score);

      const metricsData: SEOMetric[] = [
        {
          label: "SEO Skoru",
          value: score,
          change: 5,
          status: score >= 80 ? "good" : score >= 60 ? "warning" : "critical",
          icon: Target,
          color: "text-blue-600",
        },
        {
          label: "Toplam İçerik",
          value: totalArticles,
          change: 12,
          status: totalArticles >= 50 ? "good" : totalArticles >= 20 ? "warning" : "critical",
          icon: FileText,
          color: "text-green-600",
        },
        {
          label: "Meta Açıklama Oranı",
          value: `${Math.round(metaScore)}%`,
          change: 8,
          status: metaScore >= 90 ? "good" : metaScore >= 70 ? "warning" : "critical",
          icon: Search,
          color: "text-purple-600",
        },
        {
          label: "Keyword Oranı",
          value: `${Math.round(keywordScore)}%`,
          change: 10,
          status: keywordScore >= 80 ? "good" : keywordScore >= 60 ? "warning" : "critical",
          icon: Zap,
          color: "text-orange-600",
        },
        {
          label: "Ortalama Görüntülenme",
          value: avgViews.toLocaleString("tr-TR"),
          change: 15,
          status: avgViews >= 1000 ? "good" : avgViews >= 500 ? "warning" : "critical",
          icon: BarChart3,
          color: "text-cyan-600",
        },
        {
          label: "Indexlenen Sayfalar",
          value: totalArticles,
          change: 5,
          status: "good",
          icon: Globe,
          color: "text-indigo-600",
        },
      ];

      setMetrics(metricsData);
    } catch (error) {
      console.error("Failed to fetch SEO data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SEOMetric["status"]) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const getStatusIcon = (status: SEOMetric["status"]) => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-5">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="card-professional bg-gradient-to-br from-design-light/10 via-design-light/5 to-transparent border-2 border-design-light/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">
                Genel SEO Skoru
              </h3>
              <p className="text-sm text-muted-foreground font-ui">
                Tüm SEO metriklerinizin toplam performansı
              </p>
            </div>
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-design-light/20 to-design-light/10 flex items-center justify-center border-4 border-design-light/30">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-foreground">
                    {overallScore}
                  </div>
                  <div className="text-xs text-muted-foreground font-ui">/ 100</div>
                </div>
              </div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent"
                style={{
                  borderTopColor: overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444",
                  transform: "rotate(-90deg)",
                  clipPath: `inset(0 ${100 - overallScore}% 0 0)`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const StatusIcon = getStatusIcon(metric.status);
          const isPositive = (metric.change || 0) > 0;
          
          return (
            <Card
              key={index}
              className="card-professional hover-lift transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", metric.color)} />
                    <p className="text-xs text-muted-foreground font-ui font-semibold">
                      {metric.label}
                    </p>
                  </div>
                  <Badge className={cn("text-[10px] px-2 py-0.5", getStatusColor(metric.status))}>
                    {StatusIcon}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  {metric.change !== undefined && (
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-ui font-semibold",
                          isPositive ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SEO Suggestions */}
      <SEOSuggestions locale={locale} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/${locale}/seo/booster?tab=analyzer`}>
          <Card className="card-professional hover-lift cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground font-ui">
                    SEO Analiz Başlat
                  </h4>
                  <p className="text-xs text-muted-foreground font-ui">
                    Site genelinde SEO analizi yap
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/seo/booster?tab=technical`}>
          <Card className="card-professional hover-lift cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground font-ui">
                    Teknik SEO Kontrolü
                  </h4>
                  <p className="text-xs text-muted-foreground font-ui">
                    Teknik SEO sorunlarını tespit et
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/seo/booster?tab=content`}>
          <Card className="card-professional hover-lift cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground font-ui">
                    İçerik Optimizasyonu
                  </h4>
                  <p className="text-xs text-muted-foreground font-ui">
                    İçerikleri SEO için optimize et
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* SEO Performance Metrics */}
      <SEOPerformanceMetrics locale={locale} />
    </div>
  );
}

