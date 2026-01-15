"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Progress } from "@karasu/ui";
import {
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Link2,
  Eye,
  Clock,
  Calendar,
  Tag,
  Users,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { useState } from "react";
import { ArticleQuickActions } from "./ArticleQuickActions";

interface ContentStats {
  words: number;
  characters: number;
  paragraphs: number;
  headings: number;
  images: number;
  links: number;
  readingTime: number;
}

interface SEOScore {
  score: number;
  title: boolean;
  metaDescription: boolean;
  keywords: boolean;
  slug: boolean;
  images: boolean;
  headings: boolean;
  links: boolean;
  issues: string[];
}

interface ArticleEditorSidebarProps {
  contentStats: ContentStats;
  seoScore: SEOScore;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
  category?: {
    name: string;
    slug: string;
  } | null;
  author: string | null;
  onViewArticle?: () => void;
  locale: string;
  articleId: string;
  articleSlug: string;
  revisionHistory: any[];
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onFeaturedImageChange: (url: string) => void;
  onNavigateToSEO?: () => void;
}

export function ArticleEditorSidebar({
  contentStats,
  seoScore,
  isPublished,
  publishedAt,
  createdAt,
  updatedAt,
  views,
  category,
  author,
  onViewArticle,
  locale,
  articleId,
  articleSlug,
  revisionHistory,
  tags,
  onTagsChange,
  onFeaturedImageChange,
  onNavigateToSEO,
}: ArticleEditorSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["stats", "seo"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getSEOScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div className="space-y-4">
      {/* SEO Score Card */}
      <Card className="card-professional border-2 border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-design-light" />
              SEO Skoru
            </CardTitle>
            <Badge
              className={cn(
                "text-xs px-2 py-1 font-bold",
                getSEOScoreBg(seoScore.score)
              )}
            >
              <span className={getSEOScoreColor(seoScore.score)}>
                {seoScore.score}/100
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress
            value={seoScore.score}
            max={100}
            variant={seoScore.score >= 80 ? "success" : seoScore.score >= 60 ? "warning" : "error"}
            className="h-2"
          />
          
          {/* SEO Checklist */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Başlık</span>
              {seoScore.title ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Meta Açıklama</span>
              {seoScore.metaDescription ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Anahtar Kelimeler</span>
              {seoScore.keywords ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Görsel</span>
              {seoScore.images ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Başlıklar</span>
              {seoScore.headings ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Linkler</span>
              {seoScore.links ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
          </div>

          {/* SEO Issues */}
          {seoScore.issues.length > 0 && (
            <div className="pt-2 border-t border-slate-200/50 dark:border-[#0a3d35]/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                  İyileştirme Gerekli
                </span>
              </div>
              <ul className="space-y-1">
                {seoScore.issues.slice(0, 3).map((issue, idx) => (
                  <li key={idx} className="text-[10px] text-yellow-600 dark:text-yellow-400 flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Stats Card */}
      <Card className="card-professional">
        <CardHeader className="pb-3">
          <button
            onClick={() => toggleSection("stats")}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-design-light" />
              İçerik İstatistikleri
            </CardTitle>
            {expandedSections.has("stats") ? (
              <ChevronUp className="h-4 w-4 text-design-gray dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-design-gray dark:text-gray-400" />
            )}
          </button>
        </CardHeader>
        {expandedSections.has("stats") && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3.5 w-3.5 text-design-light" />
                  <span className="text-[10px] text-muted-foreground">Kelime</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {contentStats.words.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3.5 w-3.5 text-design-light" />
                  <span className="text-[10px] text-design-gray dark:text-gray-400">Okuma</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {contentStats.readingTime} dk
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3.5 w-3.5 text-design-light" />
                  <span className="text-[10px] text-design-gray dark:text-gray-400">Paragraf</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {contentStats.paragraphs}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3.5 w-3.5 text-design-light" />
                  <span className="text-[10px] text-design-gray dark:text-gray-400">Başlık</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {contentStats.headings}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-[#0a3d35]/50">
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3 w-3 text-design-light" />
                  <span className="text-[10px] text-design-gray dark:text-gray-400">Görsel</span>
                </div>
                <p className="text-sm font-semibold text-design-dark dark:text-white mt-1">
                  {contentStats.images}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Link2 className="h-3 w-3 text-design-light" />
                  <span className="text-[10px] text-design-gray dark:text-gray-400">Link</span>
                </div>
                <p className="text-sm font-semibold text-design-dark dark:text-white mt-1">
                  {contentStats.links}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Article Info Card */}
      <Card className="card-professional">
        <CardHeader className="pb-3">
          <button
            onClick={() => toggleSection("info")}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-design-light" />
              Makale Bilgileri
            </CardTitle>
            {expandedSections.has("info") ? (
              <ChevronUp className="h-4 w-4 text-design-gray dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-design-gray dark:text-gray-400" />
            )}
          </button>
        </CardHeader>
        {expandedSections.has("info") && (
          <CardContent className="space-y-3">
            {category && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-design-gray dark:text-gray-400">Kategori</span>
                <Badge variant="outline" className="text-[10px]">
                  {category.name}
                </Badge>
              </div>
            )}
            {author && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-design-gray dark:text-gray-400">Yazar</span>
                <span className="text-design-dark dark:text-white font-medium">{author}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Durum</span>
              <Badge
                className={cn(
                  "text-[10px]",
                  isPublished
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                )}
              >
                {isPublished ? "Yayında" : "Taslak"}
              </Badge>
            </div>
            {views > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-design-gray dark:text-gray-400">Görüntülenme</span>
                <span className="text-design-dark dark:text-white font-medium flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {views.toLocaleString()}
                </span>
              </div>
            )}
            {publishedAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-design-gray dark:text-gray-400">Yayın Tarihi</span>
                <span className="text-design-dark dark:text-white font-medium">
                  {new Date(publishedAt).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Oluşturulma</span>
              <span className="text-design-dark dark:text-white font-medium">
                {new Date(createdAt).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-design-gray dark:text-gray-400">Son Güncelleme</span>
              <span className="text-design-dark dark:text-white font-medium">
                {new Date(updatedAt).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            {onViewArticle && isPublished && (
              <Button
                onClick={onViewArticle}
                size="sm"
                variant="outline"
                className="w-full gap-2 mt-3"
              >
                <Eye className="h-3.5 w-3.5" />
                Makaleyi Görüntüle
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="card-professional">
        <CardHeader className="pb-3">
          <button
            onClick={() => toggleSection("actions")}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-design-light" />
              Hızlı İşlemler
            </CardTitle>
            {expandedSections.has("actions") ? (
              <ChevronUp className="h-4 w-4 text-design-gray dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-design-gray dark:text-gray-400" />
            )}
          </button>
        </CardHeader>
        {expandedSections.has("actions") && (
          <CardContent>
            <ArticleQuickActions
              articleId={articleId}
              articleSlug={articleSlug}
              locale={locale}
              revisionHistory={revisionHistory}
              tags={tags}
              onTagsChange={onTagsChange}
              onFeaturedImageChange={onFeaturedImageChange}
              onNavigateToSEO={onNavigateToSEO}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
