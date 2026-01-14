'use client';

import { AlertCircle, CheckCircle, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span>SEO Optimize</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span>Kurumsal Dil</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span>AI Detection Free</span>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <a
            href="/content-quality"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            İçerik Kalite Kontrolü
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
