"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Newspaper, 
  Camera, 
  Video as VideoIcon,
  CheckCircle2,
  ArrowRight,
  Zap
} from "lucide-react";
import { cn } from "@karasu/lib";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: "news" | "feature" | "opinion" | "breaking";
  structure: {
    title?: string;
    content: string;
    excerpt?: string;
  };
}

const templates: Template[] = [
  {
    id: "breaking-news",
    name: "Son Dakika Haberi",
    description: "Acil haberler için hızlı şablon",
    icon: Zap,
    category: "breaking",
    structure: {
      title: "[BAŞLIK]",
      content: `<h2>Son Dakika</h2>
<p>[Haber detayları buraya...]</p>
<h3>Gelişmeler</h3>
<p>[Gelişmeler buraya...]</p>`,
      excerpt: "[Kısa özet...]"
    }
  },
  {
    id: "standard-news",
    name: "Standart Haber",
    description: "Klasik haber formatı",
    icon: Newspaper,
    category: "news",
    structure: {
      title: "[Haber Başlığı]",
      content: `<h2>Giriş</h2>
<p>[Haberin giriş paragrafı...]</p>
<h2>Gelişme</h2>
<p>[Detaylar...]</p>
<h2>Sonuç</h2>
<p>[Sonuç ve değerlendirme...]</p>`,
      excerpt: "[Haber özeti...]"
    }
  },
  {
    id: "feature-article",
    name: "Özel Dosya",
    description: "Detaylı özel haber formatı",
    icon: FileText,
    category: "feature",
    structure: {
      title: "[Özel Dosya Başlığı]",
      content: `<h2>Giriş</h2>
<p>[Dosyanın girişi...]</p>
<h2>Ana Bölüm 1</h2>
<p>[İçerik...]</p>
<h2>Ana Bölüm 2</h2>
<p>[İçerik...]</p>
<h2>Sonuç</h2>
<p>[Değerlendirme...]</p>`,
      excerpt: "[Dosya özeti...]"
    }
  },
  {
    id: "photo-gallery",
    name: "Foto Galeri",
    description: "Fotoğraf galerisi formatı",
    icon: Camera,
    category: "feature",
    structure: {
      title: "[Foto Galeri Başlığı]",
      content: `<h2>Galeri</h2>
<p>[Galeri açıklaması...]</p>
<!-- Görseller buraya eklenecek -->`,
      excerpt: "[Galeri özeti...]"
    }
  },
  {
    id: "video-news",
    name: "Video Haber",
    description: "Video içerikli haber formatı",
    icon: VideoIcon,
    category: "news",
    structure: {
      title: "[Video Haber Başlığı]",
      content: `<h2>Video Haber</h2>
<p>[Haber açıklaması...]</p>
<!-- Video buraya eklenecek -->`,
      excerpt: "[Video haber özeti...]"
    }
  },
  {
    id: "opinion-piece",
    name: "Köşe Yazısı",
    description: "Yorum ve analiz formatı",
    icon: TrendingUp,
    category: "opinion",
    structure: {
      title: "[Köşe Yazısı Başlığı]",
      content: `<h2>Giriş</h2>
<p>[Yazarın görüşü...]</p>
<h2>Analiz</h2>
<p>[Detaylı analiz...]</p>
<h2>Sonuç</h2>
<p>[Değerlendirme ve öneriler...]</p>`,
      excerpt: "[Yazı özeti...]"
    }
  }
];

interface ContentTemplatesProps {
  onSelect: (template: Template) => void;
  className?: string;
}

export function ContentTemplates({ onSelect, className }: ContentTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "Tümü", icon: FileText },
    { id: "breaking", name: "Son Dakika", icon: Zap },
    { id: "news", name: "Haber", icon: Newspaper },
    { id: "feature", name: "Özel Dosya", icon: FileText },
    { id: "opinion", name: "Köşe Yazısı", icon: TrendingUp },
  ];

  const filteredTemplates = selectedCategory && selectedCategory !== "all"
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          İçerik Şablonları
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground border-design-light"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-design-light/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-design-light hover:bg-design-light/5 transition-all text-left group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-design-light/20 transition-colors">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {template.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] mt-0.5"
                      >
                        {categories.find(c => c.id === template.category)?.name}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Bu kategoride şablon bulunamadı</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

