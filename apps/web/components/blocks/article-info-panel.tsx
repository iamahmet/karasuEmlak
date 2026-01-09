/**
 * ArticleInfoPanel Component
 * Single source of truth for article metadata display
 * Replaces duplicate "Makale Bilgileri" blocks
 */

'use client';

import { Clock, FileText, Calendar, Star, CheckCircle, Shield, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';

interface ArticleInfoPanelProps {
  readingTime: number;
  wordCount?: number;
  publishedAt?: string;
  featured?: boolean;
  showTrustSignals?: boolean;
  className?: string;
  variant?: 'sidebar' | 'standalone';
}

export function ArticleInfoPanel({
  readingTime,
  wordCount,
  publishedAt,
  featured = false,
  showTrustSignals = false,
  className,
  variant = 'sidebar',
}: ArticleInfoPanelProps) {
  const isSidebar = variant === 'sidebar';
  const padding = isSidebar ? 'p-5' : 'p-6';
  const titleSize = isSidebar ? 'text-sm' : 'text-lg';
  const iconSize = isSidebar ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className={className}>
      {/* Article Info */}
      <Card variant="outlined" className={padding}>
        <CardHeader className={isSidebar ? 'p-0 pb-4' : undefined}>
          <CardTitle className={`${titleSize} font-semibold flex items-center gap-2`}>
            <FileText className={`${iconSize} text-primary`} />
            Makale Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className={isSidebar ? 'p-0 space-y-3 text-sm' : 'space-y-3'}>
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Okuma Süresi</span>
            </div>
            <span className="font-medium text-gray-900">{readingTime} dk</span>
          </div>
          
          {wordCount && (
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Kelime Sayısı</span>
              </div>
              <span className="font-medium text-gray-900">
                {wordCount.toLocaleString('tr-TR')}
              </span>
            </div>
          )}
          
          {publishedAt && (
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Yayın Tarihi</span>
              </div>
              <span className="font-medium text-gray-900">
                {new Date(publishedAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          )}

          {featured && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-900">Öne Çıkan Makale</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Signals (optional) */}
      {showTrustSignals && (
        <Card variant="outlined" className={`${padding} mt-6`}>
          <CardHeader className={isSidebar ? 'p-0 pb-4' : undefined}>
            <CardTitle className={`${titleSize} font-semibold flex items-center gap-2`}>
              <Shield className={`${iconSize} text-primary`} />
              Güvenilirlik
            </CardTitle>
          </CardHeader>
          <CardContent className={isSidebar ? 'p-0 space-y-3' : 'space-y-3'}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className={isSidebar ? 'text-sm text-gray-700' : 'text-gray-700'}>
                Doğrulanmış İçerik
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className={isSidebar ? 'text-sm text-gray-700' : 'text-gray-700'}>
                Güvenli Platform
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className={isSidebar ? 'text-sm text-gray-700' : 'text-gray-700'}>
                15+ Yıl Deneyim
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
