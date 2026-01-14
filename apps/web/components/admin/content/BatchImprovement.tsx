'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@karasu/ui';
import { Sparkles, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  slug: string;
  status?: string;
  content?: string;
}

interface BatchImprovementProps {
  articles: Article[];
}

interface ImprovementResult {
  articleId: string;
  title: string;
  slug: string;
  improved: boolean;
  scoreBefore: number;
  scoreAfter: number;
  error?: string;
}

export function BatchImprovement({ articles }: BatchImprovementProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImprovementResult[] | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  const handleBatchImprove = async (autoApply: boolean = false) => {
    if (selectedArticles.size === 0) {
      toast.error('Lütfen en az bir makale seçin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/content/batch-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleIds: Array.from(selectedArticles),
          autoApply,
        }),
      });

      if (!response.ok) throw new Error('Batch improvement failed');

      const data = await response.json();
      if (data.success && data.data) {
        setResults(data.data.results);
        toast.success(
          `${data.data.improved} makale iyileştirildi, ${data.data.skipped} atlandı`
        );
      }
    } catch (error: any) {
      console.error('Batch improvement error:', error);
      toast.error(error.message || 'Toplu iyileştirme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const toggleArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const selectAll = () => {
    setSelectedArticles(new Set(articles.map(a => a.id)));
  };

  const deselectAll = () => {
    setSelectedArticles(new Set());
  };

  const improvedCount = results?.filter(r => r.improved).length || 0;
  const errorCount = results?.filter(r => r.error).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Toplu İçerik İyileştirme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              Tümünü Seç
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              Seçimi Temizle
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedArticles.size} / {articles.length} seçili
            </span>
          </div>
        </div>

        {/* Article List */}
        <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
          {articles.map((article) => (
            <label
              key={article.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedArticles.has(article.id)}
                onChange={() => toggleArticle(article.id)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {article.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  /{article.slug} • {article.status}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleBatchImprove(false)}
            disabled={loading || selectedArticles.size === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analiz Ediliyor...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Sadece Analiz Et
              </>
            )}
          </Button>
          <Button
            onClick={() => handleBatchImprove(true)}
            disabled={loading || selectedArticles.size === 0}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                İyileştiriliyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analiz Et ve Otomatik İyileştir
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Sonuçlar
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 dark:text-green-400">
                  ✅ {improvedCount} iyileştirildi
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ⏭️ {results.length - improvedCount - errorCount} atlandı
                </span>
                {errorCount > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    ❌ {errorCount} hata
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.articleId}
                  className={`p-3 rounded-lg border ${
                    result.improved
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : result.error
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Skor: {result.scoreBefore} → {result.scoreAfter}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Hata: {result.error}
                        </div>
                      )}
                    </div>
                    <div>
                      {result.improved ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : result.error ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
