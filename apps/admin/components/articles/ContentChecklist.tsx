"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Link2,
  Search,
  TrendingUp,
  Eye,
  Clock,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@karasu/lib";
import { detectLowQualityContent } from "@/lib/utils/content-quality-checker";

interface ChecklistItem {
  id: string;
  label: string;
  icon: any;
  checked: boolean;
  required: boolean;
}

interface ContentChecklistProps {
  article: {
    title?: string | null;
    content?: string | null;
    excerpt?: string | null;
    meta_description?: string | null;
    seo_keywords?: string | null;
    featured_image?: string | null;
  };
  className?: string;
}

export function ContentChecklist({ article, className }: ContentChecklistProps) {
  const wordCount = article.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
  const headingCount = (article.content?.match(/<h[2-6][^>]*>/gi) || []).length || 0;
  const imageCount = (article.content?.match(/<img[^>]*>/gi) || []).length || 0;
  const linkCount = (article.content?.match(/<a[^>]*>/gi) || []).length || 0;

  // Calculate quality score (debounced)
  const [qualityScore, setQualityScore] = useState<{
    overall: number;
    readability: number;
    seo: number;
    engagement: number;
    aiProbability: number;
    issues: number;
    suggestions: string[];
  } | null>(null);
  const [qualityLoading, setQualityLoading] = useState(false);

  useEffect(() => {
    if (!article.content || !article.title || wordCount < 50) {
      setQualityScore(null);
      return;
    }

    // Debounce quality check
    const timeoutId = setTimeout(() => {
      setQualityLoading(true);
      try {
        const score = detectLowQualityContent(article.content || '', article.title || '');
        setQualityScore({
          overall: score.overall,
          readability: score.readability,
          seo: score.seo,
          engagement: score.engagement,
          aiProbability: score.aiProbability,
          issues: score.issues.length,
          suggestions: score.suggestions.slice(0, 3), // Top 3 suggestions
        });
      } catch (error) {
        console.error('Error calculating quality score:', error);
      } finally {
        setQualityLoading(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [article.content, article.title, wordCount]);

  const checklist: ChecklistItem[] = [
    {
      id: "title",
      label: "Başlık (30-60 karakter)",
      icon: FileText,
      checked: !!article.title && article.title.length >= 30 && article.title.length <= 60,
      required: true,
    },
    {
      id: "content",
      label: `İçerik (${wordCount} kelime, min 300)`,
      icon: FileText,
      checked: wordCount >= 300,
      required: true,
    },
    {
      id: "excerpt",
      label: "Özet (150-200 karakter)",
      icon: FileText,
      checked: !!article.excerpt && article.excerpt.length >= 150 && article.excerpt.length <= 200,
      required: false,
    },
    {
      id: "meta_description",
      label: "Meta Açıklama (120-160 karakter)",
      icon: Search,
      checked: !!article.meta_description && article.meta_description.length >= 120 && article.meta_description.length <= 160,
      required: true,
    },
    {
      id: "keywords",
      label: "SEO Anahtar Kelimeleri (min 3)",
      icon: TrendingUp,
      checked: !!article.seo_keywords && typeof article.seo_keywords === 'string' 
        ? article.seo_keywords.split(",").filter(k => k.trim()).length >= 3
        : false,
      required: true,
    },
    {
      id: "featured_image",
      label: "Öne Çıkan Görsel",
      icon: ImageIcon,
      checked: !!article.featured_image,
      required: true,
    },
    {
      id: "headings",
      label: `Başlıklar (${headingCount}, min 2)`,
      icon: FileText,
      checked: headingCount >= 2,
      required: false,
    },
    {
      id: "images",
      label: `Görseller (${imageCount}, min 1)`,
      icon: ImageIcon,
      checked: imageCount >= 1,
      required: false,
    },
    {
      id: "links",
      label: `Linkler (${linkCount}, min 2)`,
      icon: Link2,
      checked: linkCount >= 2,
      required: false,
    },
  ];

  const completedCount = checklist.filter(item => item.checked).length;
  const requiredCompleted = checklist.filter(item => item.required && item.checked).length;
  const requiredTotal = checklist.filter(item => item.required).length;
  const completionRate = Math.round((completedCount / checklist.length) * 100);

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            İçerik Kontrol Listesi
          </CardTitle>
          <Badge 
            variant={completionRate === 100 ? "default" : completionRate >= 70 ? "secondary" : "error"}
            className="text-xs"
          >
            {completionRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              Tamamlanan: {completedCount}/{checklist.length}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Zorunlu: {requiredCompleted}/{requiredTotal}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                completionRate === 100 
                  ? "bg-green-500"
                  : completionRate >= 70
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {checklist.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-colors",
                  item.checked
                    ? "bg-green-50 dark:bg-green-900/10"
                    : item.required
                    ? "bg-red-50 dark:bg-red-900/10"
                    : "bg-gray-50 dark:bg-gray-900/10"
                )}
              >
                {item.checked ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : item.required ? (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <Icon className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className={cn(
                  "text-xs flex-1",
                  item.checked
                    ? "text-green-800 dark:text-green-200"
                    : item.required
                    ? "text-red-800 dark:text-red-200"
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {item.label}
                </span>
                {item.required && (
                  <Badge variant="outline" className="text-[10px]">
                    Zorunlu
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Quality Score */}
        {qualityScore && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Kalite Skoru</span>
                </div>
                <Badge
                  variant={
                    qualityScore.overall >= 70
                      ? "default"
                      : qualityScore.overall >= 50
                      ? "secondary"
                      : "error"
                  }
                  className="text-xs"
                >
                  {qualityScore.overall}/100
                </Badge>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    qualityScore.overall >= 70
                      ? "bg-green-500"
                      : qualityScore.overall >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  style={{ width: `${qualityScore.overall}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                <div>Okunabilirlik: {qualityScore.readability}</div>
                <div>SEO: {qualityScore.seo}</div>
                <div>Etkileşim: {qualityScore.engagement}</div>
              </div>
              {qualityScore.aiProbability > 0.5 && (
                <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-300">AI Detection Uyarısı</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">AI Olasılığı:</span>
                      <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                        {Math.round(qualityScore.aiProbability * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">İnsan Yazısı Skoru:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {Math.round((1 - qualityScore.aiProbability) * 100)}%
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Öneri:</strong> İçeriği daha doğal ve özgün hale getirin. Generic ifadeleri kaldırın, cümle yapılarını çeşitlendirin.
                      </p>
                      <a
                        href="/content-quality"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Detaylı AI Checker Raporu →
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {qualityScore.issues > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="font-medium mb-1">Tespit Edilen Sorunlar: {qualityScore.issues}</div>
                  {qualityScore.suggestions.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                      {qualityScore.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {qualityLoading && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="h-3.5 w-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span>Kalite skoru hesaplanıyor...</span>
            </div>
          </div>
        )}

        {/* Reading Time Estimate */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Tahmini Okuma Süresi: {Math.ceil(wordCount / 200)} dakika</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

