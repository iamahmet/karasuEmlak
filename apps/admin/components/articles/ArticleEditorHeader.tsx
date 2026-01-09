"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Save,
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  TrendingUp,
  Settings,
  Maximize2,
  Minimize2,
  Focus,
  Download,
  Share2,
  ChevronLeft,
  MoreVertical,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@karasu/ui";

interface ArticleEditorHeaderProps {
  title: string;
  isDirty: boolean;
  saving: boolean;
  lastSaved: Date | null;
  readingTime: number;
  views: number;
  seoScore: number;
  isPublished: boolean;
  isFullscreen: boolean;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
  onFullscreen: () => void;
  onExitFullscreen: () => void;
  onDistractionFree: () => void;
  previewUrl?: string | null;
  locale: string;
}

export function ArticleEditorHeader({
  title,
  isDirty,
  saving,
  lastSaved,
  readingTime,
  views,
  seoScore,
  isPublished,
  isFullscreen,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  onFullscreen,
  onExitFullscreen,
  onDistractionFree,
  previewUrl,
  locale,
}: ArticleEditorHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#062F28]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#0a3d35]/80 shadow-sm -mx-6 -mt-6 mb-6">
      <div className="px-6 py-4">
        {/* Top Row: Title and Actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-display font-bold text-design-dark dark:text-white truncate">
                {title || "Yeni Makale"}
              </h1>
              {isPublished && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs px-2 py-0.5">
                  Yayında
                </Badge>
              )}
              {!isPublished && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  Taslak
                </Badge>
              )}
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-design-gray dark:text-gray-400 flex-wrap">
              {lastSaved && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className={cn(
                    "h-3.5 w-3.5",
                    isDirty ? "text-yellow-500" : "text-green-500"
                  )} />
                  <span className={cn(isDirty && "text-yellow-600 dark:text-yellow-400")}>
                    {isDirty ? "Kaydedilmemiş" : `Son kayıt: ${lastSaved.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} dk okuma
              </span>
              {views > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {views.toLocaleString()} görüntülenme
                </span>
              )}
              <span className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold",
                getSEOScoreBg(seoScore)
              )}>
                <TrendingUp className={cn("h-3.5 w-3.5", getSEOScoreColor(seoScore))} />
                <span className={getSEOScoreColor(seoScore)}>
                  SEO: {seoScore}/100
                </span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save Button */}
            <Button
              onClick={onSave}
              disabled={saving || !isDirty}
              size="sm"
              className={cn(
                "gap-2",
                isDirty
                  ? "bg-design-light hover:bg-design-light/90 text-white"
                  : "bg-slate-100 dark:bg-[#0a3d35] text-slate-600 dark:text-slate-400"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>

            {/* Publish/Unpublish Button */}
            {isPublished ? (
              <Button
                onClick={onUnpublish}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Yayından Kaldır
              </Button>
            ) : (
              <Button
                onClick={onPublish}
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Zap className="h-4 w-4" />
                Yayınla
              </Button>
            )}

            {/* Preview Button */}
            <Button
              onClick={onPreview}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Önizle
            </Button>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onDistractionFree} className="gap-2">
                  <Focus className="h-4 w-4" />
                  Dikkat Dağıtmayan Mod
                </DropdownMenuItem>
                {isFullscreen ? (
                  <DropdownMenuItem onClick={onExitFullscreen} className="gap-2">
                    <Minimize2 className="h-4 w-4" />
                    Tam Ekrandan Çık
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={onFullscreen} className="gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Tam Ekran
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {previewUrl && (
                  <DropdownMenuItem
                    onClick={() => {
                      window.open(previewUrl, "_blank");
                    }}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Yeni Sekmede Aç
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(previewUrl || "");
                    toast.success("URL kopyalandı");
                  }}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  URL'yi Kopyala
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs text-design-gray dark:text-gray-400">
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center gap-4 text-[10px] text-design-gray dark:text-gray-400 pt-2 border-t border-slate-100 dark:border-[#0a3d35]/50">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#0a3d35] rounded text-[10px] font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#0a3d35] rounded text-[10px] font-mono">
              S
            </kbd>
            <span className="ml-1">Kaydet</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#0a3d35] rounded text-[10px] font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#0a3d35] rounded text-[10px] font-mono">
              P
            </kbd>
            <span className="ml-1">Yayınla</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#0a3d35] rounded text-[10px] font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#0a3d35] rounded text-[10px] font-mono">
              K
            </kbd>
            <span className="ml-1">Önizle</span>
          </span>
        </div>
      </div>
    </div>
  );
}
