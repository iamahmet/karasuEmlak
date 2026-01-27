"use client";

import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  History,
  Tag,
  Image as ImageIcon,
  Link2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  Share2,
  FileText,
  Eye,
  Calendar,
  Clock,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@karasu/ui";
import { ContentHistory } from "@/components/content-studio/ContentHistory";
import { MediaLibrary } from "@/components/content-studio/MediaLibrary";
import { Input } from "@karasu/ui";
import { toast } from "sonner";
import { useState } from "react";

interface ArticleQuickActionsProps {
  articleId: string;
  articleSlug: string;
  locale: string;
  revisionHistory: any[];
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onFeaturedImageChange: (url: string) => void;
  onNavigateToSEO?: () => void;
}

export function ArticleQuickActions({
  articleId,
  articleSlug,
  locale,
  revisionHistory,
  tags,
  onTagsChange,
  onFeaturedImageChange,
  onNavigateToSEO,
}: ArticleQuickActionsProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const copyArticleUrl = () => {
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin.replace(":3001", ":3000")
      : "http://localhost:3000";
    const url = `${baseUrl}/${locale}/blog/${articleSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("URL kopyalandı");
  };

  const openArticleUrl = () => {
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin.replace(":3001", ":3000")
      : "http://localhost:3000";
    const url = `${baseUrl}/${locale}/blog/${articleSlug}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-2">
      {/* Version History */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
          >
            <History className="h-4 w-4" />
            Versiyon Geçmişi
            {revisionHistory.length > 0 && (
              <Badge variant="outline" className="ml-auto text-xs">
                {revisionHistory.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold text-foreground">
              Versiyon Geçmişi
            </DialogTitle>
          </DialogHeader>
          <ContentHistory 
            contentItemId={articleId} 
            locale={locale}
          />
        </DialogContent>
      </Dialog>

      {/* Tags Management */}
      <Dialog open={showTags} onOpenChange={setShowTags}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
          >
            <Tag className="h-4 w-4" />
            Etiketler
            {tags.length > 0 && (
              <Badge variant="outline" className="ml-auto text-xs">
                {tags.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold text-foreground">
              Etiket Yönetimi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Henüz etiket eklenmedi
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Yeni etiket ekle..."
                className="flex-1"
              />
              <Button
                onClick={handleAddTag}
                size="sm"
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Library */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
          >
            <ImageIcon className="h-4 w-4" />
            Medya Kütüphanesi
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold text-foreground">
              Medya Kütüphanesi
            </DialogTitle>
          </DialogHeader>
          <MediaLibrary
            onSelect={(url) => {
              onFeaturedImageChange(url);
              setShowMediaLibrary(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      {onNavigateToSEO && (
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sm border-design-light/20 hover:bg-design-light/5"
          onClick={onNavigateToSEO}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          AI SEO Asistanı
        </Button>
      )}

      {/* Article URL Actions */}
      <div className="pt-2 border-t border-border">
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
            onClick={copyArticleUrl}
          >
            <Copy className="h-4 w-4" />
            URL'yi Kopyala
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
            onClick={openArticleUrl}
          >
            <ExternalLink className="h-4 w-4" />
            Yeni Sekmede Aç
          </Button>
        </div>
      </div>
    </div>
  );
}
