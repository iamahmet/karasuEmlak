'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Sparkles, TrendingUp, Zap, RefreshCw, Save } from 'lucide-react';
import { cn } from '@karasu/lib';
import { Button } from '@karasu/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { toast } from 'sonner';

interface AdminAICheckerProps {
  content: string;
  title: string;
  contentType?: 'blog' | 'article' | 'guide' | 'news';
  articleId?: string;
  onImproved?: (improvedContent: string) => void;
  className?: string;
}

interface AnalysisResult {
  humanLikeScore: number;
  aiProbability: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  }>;
  strengths: string[];
  suggestions: string[];
}

interface ImprovedResult {
  original: string;
  improved: string;
  changes: Array<{
    type: string;
    improved: string;
    reason: string;
  }>;
  score: {
    before: number;
    after: number;
    improvement: number;
  };
}

export function AdminAIChecker({
  content,
  title,
  contentType = 'blog',
  articleId,
  onImproved,
  className,
}: AdminAICheckerProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [improved, setImproved] = useState<ImprovedResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Auto-analyze on mount
    handleAnalyze();
  }, [content, title]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/content/analyze-and-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          improve: false,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      if (data.success && data.data?.analysis) {
        setAnalysis(data.data.analysis);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImprove = async () => {
    setImproving(true);
    try {
      const response = await fetch('/api/content/analyze-and-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          improve: true,
        }),
      });

      if (!response.ok) throw new Error('Improvement failed');

      const data = await response.json();
      if (data.success && data.data?.improved) {
        setImproved(data.data.improved);
      }
    } catch (error) {
      console.error('Improvement error:', error);
      toast.error('İyileştirme başarısız');
    } finally {
      setImproving(false);
    }
  };

  const handleImproved = async (improvedContent: string) => {
    if (!articleId) {
      toast.error('Makale ID bulunamadı');
      return;
    }
    
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: improvedContent,
        }),
      });

      if (!response.ok) throw new Error('Update failed');

      const data = await response.json();
      if (data.success) {
        toast.success('İçerik başarıyla güncellendi');
        if (onImproved) {
          onImproved(improvedContent);
        }
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Güncelleme başarısız');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (!analysis && !analyzing) {
    return null;
  }

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
                AI İçerik Analizi (Admin)
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                İçerik kalitesi ve AI detection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', analyzing && 'animate-spin')} />
              Yeniden Analiz
            </Button>
            {analysis && (
              <Button
                onClick={handleImprove}
                disabled={improving}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Zap className={cn('h-4 w-4 mr-2', improving && 'animate-spin')} />
                Otomatik İyileştir
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {analyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">İçerik analiz ediliyor...</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cn('p-4 rounded-lg border-2', getScoreBg(analysis.humanLikeScore))}>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">İnsan Yazısı Skoru</div>
                <div className={cn('text-3xl font-bold', getScoreColor(analysis.humanLikeScore))}>
                  {analysis.humanLikeScore}/100
                </div>
              </div>
              <div className={cn('p-4 rounded-lg border-2', getScoreBg(100 - analysis.aiProbability * 100))}>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">AI Olasılığı</div>
                <div className={cn('text-3xl font-bold', getScoreColor(100 - analysis.aiProbability * 100))}>
                  {Math.round(analysis.aiProbability * 100)}%
                </div>
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Tespit Edilen Sorunlar ({analysis.issues.length})
                </h4>
                <div className="space-y-2">
                  {analysis.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={cn('p-3 rounded-lg border', {
                        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800':
                          issue.severity === 'high',
                        'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800':
                          issue.severity === 'medium',
                        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800':
                          issue.severity === 'low',
                      })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {issue.type}
                        </span>
                        <span
                          className={cn('text-xs px-2 py-1 rounded font-semibold', {
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                              issue.severity === 'high',
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400':
                              issue.severity === 'medium',
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':
                              issue.severity === 'low',
                          })}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{issue.message}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Öneri:</strong> {issue.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Güçlü Yönler
                </h4>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  İyileştirme Önerileri
                </h4>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">{index + 1}.</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improved Content */}
            {improved && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    İyileştirilmiş İçerik
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Skor: {improved.score.before} → {improved.score.after} (+{improved.score.improvement})
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: improved.improved }}
                  />
                </div>
                {onImproved && articleId && (
                  <Button
                    onClick={() => handleImproved(improved.improved)}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    İyileştirilmiş İçeriği Kaydet
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
