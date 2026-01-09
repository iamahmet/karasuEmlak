"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { FileText, Sparkles, TrendingUp, Plus } from "lucide-react";
import { cn } from "@karasu/lib";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  type: "normal" | "cornerstone" | "programmatic";
  category?: string;
  structure: {
    title: string;
    content: string;
    excerpt?: string;
    metaDescription?: string;
  };
}

const defaultTemplates: Template[] = [
  {
    id: "neighborhood-guide",
    name: "🏘️ Mahalle Rehberi",
    description: "Karasu/Kocaali mahalleleri için kapsamlı rehber (fiyatlar, özellikler, yatırım analizi)",
    type: "cornerstone",
    category: "mahalle",
    structure: {
      title: "Karasu [Mahalle Adı] Mahallesi Rehberi: Fiyatlar, Özellikler ve Yatırım Analizi",
      content: `
        <h2>Mahalle Hakkında Genel Bilgi</h2>
        <p>Mahalle konumu, tarihçe, genel özellikler...</p>
        
        <h2>Ulaşım ve Erişim</h2>
        <p>Merkeze uzaklık, toplu taşıma, ana yollar...</p>
        
        <h2>Denize Yakınlık ve Mesafe</h2>
        <p>Denize mesafe, yürüyüş yolları, plaj erişimi...</p>
        
        <h2>Sosyal Yaşam ve İmkanlar</h2>
        <p>Okul, market, sağlık kuruluşları, sosyal tesisler...</p>
        
        <h2>Emlak Fiyatları ve Trendler</h2>
        <p>Satılık ev fiyatları, kiralık ev fiyatları, trend analizi...</p>
        
        <h2>Yatırım Potansiyeli</h2>
        <p>Kira getirisi, değer artış potansiyeli, risk analizi...</p>
        
        <h2>Kimler İçin Uygun</h2>
        <p>Aile, yatırımcı, emekli, genç profesyonel analizi...</p>
      `,
      excerpt: "Karasu [Mahalle Adı] Mahallesi hakkında kapsamlı rehber: fiyatlar, özellikler, yatırım analizi ve yaşam kalitesi",
      metaDescription: "Karasu [Mahalle Adı] Mahallesi rehberi: emlak fiyatları, mahalle özellikleri, yatırım potansiyeli ve detaylı analiz",
    },
  },
  {
    id: "market-analysis",
    name: "📊 Piyasa Analizi",
    description: "Karasu emlak piyasası analizi ve trend raporu",
    type: "cornerstone",
    category: "analiz",
    structure: {
      title: "Karasu Emlak Piyasası 2025: Trendler, Fırsatlar ve Gelecek Öngörüleri",
      content: `
        <h2>Güncel Piyasa Durumu</h2>
        <p>2025 yılı Karasu emlak piyasası genel durumu...</p>
        
        <h2>Fiyat Trendleri ve Değişimler</h2>
        <p>Satılık ve kiralık ev fiyat trendleri, yıllık değişimler...</p>
        
        <h2>Bölgesel Karşılaştırmalar</h2>
        <p>Karasu vs Kocaali, mahalle bazlı karşılaştırmalar...</p>
        
        <h2>Yatırım Fırsatları</h2>
        <p>Yüksek getiri potansiyeli olan bölgeler, fırsatlar...</p>
        
        <h2>Gelecek Öngörüleri</h2>
        <p>2025-2026 öngörüleri, projeler, gelişmeler...</p>
      `,
      excerpt: "Karasu emlak piyasası 2025 analizi: fiyat trendleri, yatırım fırsatları ve gelecek öngörüleri",
      metaDescription: "Karasu emlak piyasası 2025: detaylı analiz, fiyat trendleri, yatırım fırsatları ve uzman görüşleri",
    },
  },
  {
    id: "investment-guide",
    name: "💰 Yatırım Rehberi",
    description: "Karasu'da emlak yatırımı için kapsamlı rehber",
    type: "cornerstone",
    category: "yatırım",
    structure: {
      title: "Karasu'da Emlak Yatırımı: Kapsamlı Rehber ve Stratejiler",
      content: `
        <h2>Yatırım Potansiyeli Analizi</h2>
        <p>Karasu'nun yatırım potansiyeli, avantajlar, dezavantajlar...</p>
        
        <h2>Kira Getirisi Hesaplamaları</h2>
        <p>Ortalama kira fiyatları, getiri oranları, hesaplama örnekleri...</p>
        
        <h2>Risk Değerlendirmesi</h2>
        <p>Yatırım riskleri, dikkat edilmesi gerekenler...</p>
        
        <h2>Yatırım Stratejileri</h2>
        <p>Kısa vadeli, uzun vadeli stratejiler, öneriler...</p>
        
        <h2>Vergi ve Yasal Bilgiler</h2>
        <p>Emlak vergileri, yasal düzenlemeler, önemli bilgiler...</p>
      `,
      excerpt: "Karasu'da emlak yatırımı rehberi: getiri hesaplamaları, risk analizi, stratejiler ve yasal bilgiler",
      metaDescription: "Karasu emlak yatırım rehberi: kira getirisi, risk analizi, yatırım stratejileri ve uzman önerileri",
    },
  },
  {
    id: "news-article",
    name: "📰 Emlak Haberi",
    description: "Karasu emlak piyasası güncel haberleri",
    type: "normal",
    category: "haber",
    structure: {
      title: "Karasu Emlak Haberi: [Güncel Olay/Başlık]",
      content: `
        <h2>Haber Özeti</h2>
        <p>Güncel olay/başlık hakkında özet bilgi...</p>
        
        <h2>Detaylar ve Etkiler</h2>
        <p>Olayın detayları, emlak piyasasına etkileri...</p>
        
        <h2>Uzman Görüşleri</h2>
        <p>Uzman yorumları ve değerlendirmeler...</p>
        
        <h2>Sonuç</h2>
        <p>Özet ve gelecek beklentileri...</p>
      `,
      excerpt: "Karasu emlak piyasası güncel haber: [konu] hakkında detaylı bilgi ve uzman görüşleri",
      metaDescription: "Karasu emlak haberi: [konu] - güncel gelişmeler, etkiler ve uzman analizleri",
    },
  },
  {
    id: "how-to-guide",
    name: "📖 Nasıl Yapılır Rehberi",
    description: "Emlak işlemleri için adım adım rehberler",
    type: "normal",
    category: "rehber",
    structure: {
      title: "Nasıl Yapılır: [Konu] - Karasu Emlak Rehberi",
      content: `
        <h2>Gereksinimler</h2>
        <ul>
          <li>Gereksinim 1</li>
          <li>Gereksinim 2</li>
        </ul>
        
        <h2>Adım 1: Başlangıç</h2>
        <p>İlk adım açıklaması...</p>
        
        <h2>Adım 2: Devam</h2>
        <p>İkinci adım açıklaması...</p>
        
        <h2>Önemli Notlar</h2>
        <p>Dikkat edilmesi gerekenler, ipuçları...</p>
      `,
      excerpt: "[Konu] hakkında adım adım rehber: Karasu emlak işlemleri için pratik bilgiler",
      metaDescription: "Nasıl yapılır: [konu] - Karasu emlak işlemleri için detaylı adım adım rehber",
    },
  },
  {
    id: "cornerstone-guide",
    name: "⭐ Cornerstone Rehber",
    description: "Kapsamlı, derinlemesine içerik (2000+ kelime)",
    type: "cornerstone",
    category: "rehber",
    structure: {
      title: "Kapsamlı Rehber Başlığı - Karasu Emlak",
      content: `
        <h2>Giriş</h2>
        <p>Rehberin giriş bölümü, konuya genel bakış...</p>
        
        <h2>Ana Bölüm 1</h2>
        <p>Detaylı içerik, veriler, örnekler...</p>
        
        <h2>Ana Bölüm 2</h2>
        <p>Detaylı içerik, karşılaştırmalar, analizler...</p>
        
        <h2>Ana Bölüm 3</h2>
        <p>Detaylı içerik, uzman görüşleri, öneriler...</p>
        
        <h2>Sonuç ve Öneriler</h2>
        <p>Özet, sonuç ve okuyucuya öneriler...</p>
      `,
      excerpt: "Kapsamlı rehber özeti: Karasu emlak konusunda derinlemesine analiz ve uzman görüşleri",
      metaDescription: "Kapsamlı rehber: Karasu emlak konusunda detaylı analiz, veriler ve uzman önerileri",
    },
  },
];

interface ContentTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  className?: string;
}

export function ContentTemplates({ onSelectTemplate, className }: ContentTemplatesProps) {
  const [templates] = useState<Template[]>(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    toast.success(`${template.name} şablonu yüklendi`);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Şablon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui input-modern"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all" className="text-sm font-ui">Tümü</SelectItem>
            <SelectItem value="normal" className="text-sm font-ui">Normal</SelectItem>
            <SelectItem value="cornerstone" className="text-sm font-ui">Cornerstone</SelectItem>
            <SelectItem value="programmatic" className="text-sm font-ui">Programmatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const Icon =
            template.type === "cornerstone"
              ? Sparkles
              : template.type === "programmatic"
              ? TrendingUp
              : FileText;

          return (
            <Card
              key={template.id}
              className="card-professional hover-lift cursor-pointer group"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-design-light/20 to-design-light/10 group-hover:from-design-light/30 group-hover:to-design-light/20 transition-all duration-300">
                    <Icon className="h-5 w-5 text-design-dark dark:text-design-light" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-design-light/15 text-design-dark dark:text-design-light font-ui font-semibold uppercase">
                    {template.type}
                  </span>
                </div>
                <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                  {template.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-design-gray dark:text-gray-400 font-ui mb-4 line-clamp-2">
                  {template.description}
                </p>
                <Button
                  variant="outline"
                  onClick={() => onSelectTemplate(template)}
                  className="w-full h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Şablonu Kullan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E7E7E7] to-[#E7E7E7]/80 dark:from-[#062F28] dark:to-[#062F28]/80 flex items-center justify-center shadow-lg">
            <FileText className="h-8 w-8 text-design-gray dark:text-gray-400" />
          </div>
          <p className="text-sm text-design-gray dark:text-gray-400 font-ui font-medium">
            Şablon bulunamadı
          </p>
        </div>
      )}
    </div>
  );
}

