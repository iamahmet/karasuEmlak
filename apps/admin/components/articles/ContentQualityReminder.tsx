'use client';

import { AlertCircle, CheckCircle, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
// Alert component might not be available, using div instead

/**
 * Content Quality Reminder Component
 * Displays quality standards reminder when creating/editing articles
 */
export function ContentQualityReminder() {
  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            İçerik Kalite Standartları
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Önemli Hatırlatmalar</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Tüm içeriklerimiz kurumsal kimliğimize uygun, SEO optimize ve AI detection'dan kaçınmalıdır.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Minimum 300 kelime</strong> (ideal: 800-2000)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>H2-H3 başlıkları</strong> kullan (TOC için)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Yerel referanslar</strong> ekle (Karasu, Kocaali)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>3-5 iç link</strong> ekle
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Görseller</strong> için alt text ekle
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>CTA</strong> ekle (en az 2 adet)
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2 text-xs">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-gray-700 dark:text-gray-300">
              <strong>Kaçınılması gerekenler:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                <li>Generic ifadeler ("bu makalede", "sonuç olarak")</li>
                <li>Tekrar eden kelimeler (5'ten fazla)</li>
                <li>Uzun paragraflar (10+ cümle)</li>
                <li>Görselsiz içerik</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-4 w-4 text-blue-600" />
            <a
              href="/admin/content-improvement"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              AI İçerik İyileştirme Sistemi →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
