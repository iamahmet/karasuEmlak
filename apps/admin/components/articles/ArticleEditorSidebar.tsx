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
    if (score >= 80) return "text-foreground";
    if (score >= 60) return "text-foreground/80";
    return "text-foreground/70";
  };

  const getSEOScoreBg = (score: number) => {
    if (score >= 80) return "bg-muted";
    if (score >= 60) return "bg-muted/50";
    return "bg-muted/30";
  };

  return (
    <div className="space-y-4">
      {/* SEO Score Card */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-foreground/70" />
              SEO Skoru
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-0.5 font-medium",
                getSEOScoreBg(seoScore.score)
              )}
            >
              <span className={getSEOScoreColor(seoScore.score)}>
                {seoScore.score}/100
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          <Progress
            value={seoScore.score}
            max={100}
            className="h-1.5"
          />
          
          {/* SEO Checklist */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Başlık</span>
              {seoScore.title ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Meta Açıklama</span>
              {seoScore.metaDescription ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Anahtar Kelimeler</span>
              {seoScore.keywords ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Görsel</span>
              {seoScore.images ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Başlıklar</span>
              {seoScore.headings ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Linkler</span>
              {seoScore.links ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground/50" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-foreground/40" />
              )}
            </div>
          </div>

          {/* SEO Issues */}
          {seoScore.issues.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-foreground/50" />
                <span className="text-xs font-medium text-foreground/80">
                  İyileştirme Gerekli
                </span>
              </div>
              <ul className="space-y-1">
                {seoScore.issues.slice(0, 3).map((issue, idx) => (
                  <li key={idx} className="text-xs text-foreground/70 flex items-start gap-1.5 leading-relaxed">
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
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <button
            onClick={() => toggleSection("stats")}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-foreground/70" />
              İçerik İstatistikleri
            </CardTitle>
            {expandedSections.has("stats") ? (
              <ChevronUp className="h-4 w-4 text-foreground/50" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/50" />
            )}
          </button>
        </CardHeader>
        {expandedSections.has("stats") && (
          <CardContent className="space-y-2.5 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded border border-border bg-muted/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText className="h-3 w-3 text-foreground/60" />
                  <span className="text-xs text-foreground/70">Kelime</span>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {contentStats.words.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded border border-border bg-muted/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3 w-3 text-foreground/60" />
                  <span className="text-xs text-foreground/70">Okuma</span>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {contentStats.readingTime} dk
                </p>
              </div>
              <div className="p-2 rounded border border-border bg-muted/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText className="h-3 w-3 text-foreground/60" />
                  <span className="text-xs text-foreground/70">Paragraf</span>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {contentStats.paragraphs}
                </p>
              </div>
              <div className="p-2 rounded border border-border bg-muted/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText className="h-3 w-3 text-foreground/60" />
                  <span className="text-xs text-foreground/70">Başlık</span>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {contentStats.headings}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div className="p-2 rounded border border-border bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3 text-foreground/60" />
                  <span className="text-xs text-foreground/70">Görsel</span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {contentStats.images}
                </p>
              </div>
              <div className="p-2 rounded border border-border bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <Link2 className="h-3 w-3 text-foreground/60" />
                  <span className="text-xs text-foreground/70">Link</span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {contentStats.links}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Article Info Card */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <button
            onClick={() => toggleSection("info")}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-foreground/70" />
              Makale Bilgileri
            </CardTitle>
            {expandedSections.has("info") ? (
              <ChevronUp className="h-4 w-4 text-foreground/50" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/50" />
            )}
          </button>
        </CardHeader>
        {expandedSections.has("info") && (
          <CardContent className="space-y-2 pt-0">
            {category && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70">Kategori</span>
                <Badge variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              </div>
            )}
            {author && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70">Yazar</span>
                <span className="text-foreground font-medium">{author}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Durum</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  isPublished
                    ? "bg-muted"
                    : "bg-muted/50"
                )}
              >
                {isPublished ? "Yayında" : "Taslak"}
              </Badge>
            </div>
            {views > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70">Görüntülenme</span>
                <span className="text-foreground font-medium flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {views.toLocaleString()}
                </span>
              </div>
            )}
            {publishedAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70">Yayın Tarihi</span>
                <span className="text-foreground font-medium">
                  {new Date(publishedAt).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Oluşturulma</span>
              <span className="text-foreground font-medium">
                {new Date(createdAt).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">Son Güncelleme</span>
              <span className="text-foreground font-medium">
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
                className="w-full gap-2 mt-2"
              >
                <Eye className="h-3.5 w-3.5" />
                Makaleyi Görüntüle
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <button
            onClick={() => toggleSection("actions")}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground/70" />
              Hızlı İşlemler
            </CardTitle>
            {expandedSections.has("actions") ? (
              <ChevronUp className="h-4 w-4 text-foreground/50" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/50" />
            )}
          </button>
        </CardHeader>
        {expandedSections.has("actions") && (
          <CardContent className="pt-0">
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
