'use client';

import { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Info, ExternalLink, TrendingUp, Shield, FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import Link from 'next/link';
import { cn } from '@karasu/lib';

interface AICheckerInfoProps {
  className?: string;
}

export function AICheckerInfo({ className }: AICheckerInfoProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = {
    totalPages: 15,
    pagesWithChecker: 12,
    avgHumanLikeScore: 78,
    issuesDetected: 23,
    improvementsSuggested: 45,
  };

  const recentIssues = [
    { page: 'Karasu Satılık Yazlık', score: 65, issue: 'Generic phrases detected', severity: 'medium' },
    { page: 'Yatırım Rehberi', score: 82, issue: 'Minor repetition', severity: 'low' },
    { page: 'Blog: Emlak Piyasası', score: 71, issue: 'Tone too formal', severity: 'low' },
  ];

  const improvementTips = [
    'Generic ifadeleri kaldırın: "bu makalede", "sonuç olarak", "kısacası"',
    'Tekrar eden kelimeleri eş anlamlılarıyla değiştirin',
    'Cümle uzunluklarını çeşitlendirin (kısa + uzun karışımı)',
    'Daha samimi ve doğal bir ton kullanın',
    'Resmi ifadeleri daha samimi alternatiflerle değiştirin',
  ];

  return (
    <Card className={cn('border-2', className)}>
      <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                AI Checker Sistemi
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                İçerik kalitesi ve AI detection
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            aria-label={expanded ? 'Bilgileri gizle' : 'Bilgileri göster'}
            title={expanded ? 'Bilgileri gizle' : 'Bilgileri göster'}
          >
            <svg
              className={cn('w-5 h-5 text-gray-400 transition-transform', {
                'rotate-180': expanded,
              })}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Kontrol Edilen Sayfa</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pagesWithChecker}</div>
            <div className="text-xs text-gray-500">/{stats.totalPages} sayfa</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ortalama Skor</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgHumanLikeScore}</div>
            <div className="text-xs text-gray-500">/ 100</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tespit Edilen Sorun</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.issuesDetected}</div>
            <div className="text-xs text-gray-500">toplam</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Öneri</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.improvementsSuggested}</div>
            <div className="text-xs text-gray-500">öneri</div>
          </div>
        </div>

        {/* Recent Issues */}
        {expanded && (
          <div className="space-y-4 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Son Tespit Edilen Sorunlar
              </h4>
              <div className="space-y-2">
                {recentIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={cn('p-3 rounded-lg border', {
                      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800':
                        issue.severity === 'medium',
                      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800':
                        issue.severity === 'low',
                    })}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{issue.page}</span>
                      <span
                        className={cn('text-xs px-2 py-1 rounded font-semibold', {
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400':
                            issue.severity === 'medium',
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':
                            issue.severity === 'low',
                        })}
                      >
                        {issue.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{issue.issue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Tips */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                İyileştirme İpuçları
              </h4>
              <ul className="space-y-2">
                {improvementTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/content-quality"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  <FileText className="h-4 w-4" />
                  İçerik Kalitesi Raporu
                </Link>
                <Link
                  href="/admin/articles"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold"
                >
                  <ExternalLink className="h-4 w-4" />
                  Makaleleri Yönet
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Sistem Aktif</span>
            </div>
            <span className="text-xs text-gray-500">
              {Math.round((stats.pagesWithChecker / stats.totalPages) * 100)}% kapsama
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
