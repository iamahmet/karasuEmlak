'use client';

import { AlertCircle, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';

/**
 * Content Quality Reminder Component
 * Displays quality standards reminder when creating/editing articles
 * Modern, minimal design inspired by WordPress/WooCommerce
 */
export function ContentQualityReminder() {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground/70" />
          <CardTitle className="text-sm font-medium text-foreground">
            İçerik Kalite Standartları
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="bg-muted/30 border border-border rounded p-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-foreground/60 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-foreground mb-0.5">Önemli Hatırlatmalar</div>
              <div className="text-xs text-foreground/70 leading-relaxed">
                Tüm içeriklerimiz kurumsal kimliğimize uygun, SEO optimize ve AI detection'dan kaçınmalıdır.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
          <div className="flex items-start gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80 leading-relaxed">
              <strong className="font-medium text-foreground">Minimum 300 kelime</strong> (ideal: 800-2000)
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80 leading-relaxed">
              <strong className="font-medium text-foreground">H2-H3 başlıkları</strong> kullan (TOC için)
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80 leading-relaxed">
              <strong className="font-medium text-foreground">Yerel referanslar</strong> ekle (Karasu, Kocaali)
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80 leading-relaxed">
              <strong className="font-medium text-foreground">3-5 iç link</strong> ekle
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80 leading-relaxed">
              <strong className="font-medium text-foreground">Görseller</strong> için alt text ekle
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80 leading-relaxed">
              <strong className="font-medium text-foreground">CTA</strong> ekle (en az 2 adet)
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-start gap-1.5 text-xs">
            <AlertCircle className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
            <div className="text-foreground/80">
              <strong className="font-medium text-foreground">Kaçınılması gerekenler:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-foreground/70">
                <li>Generic ifadeler ("bu makalede", "sonuç olarak")</li>
                <li>Tekrar eden kelimeler (5'ten fazla)</li>
                <li>Uzun paragraflar (10+ cümle)</li>
                <li>Görselsiz içerik</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5 text-foreground/60" />
            <a
              href="/content-improvement"
              className="text-foreground/80 hover:text-foreground font-medium hover:underline"
            >
              AI İçerik İyileştirme Sistemi →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
