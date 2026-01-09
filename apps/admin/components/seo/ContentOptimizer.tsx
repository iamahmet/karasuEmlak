'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Textarea } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { CheckCircle2, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface ContentAnalysis {
  wordCount: number;
  keywordDensity: number;
  readabilityScore: number;
  suggestions: string[];
  missingElements: string[];
  strengths: string[];
}

export function ContentOptimizer({ locale }: { locale?: string }) {
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!content.trim() || !keyword.trim()) return;

    setLoading(true);
    try {
      const data = await fetchWithRetry<{ success: boolean; data?: ContentAnalysis }>(
        '/api/services/seo/content',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, keyword, action: 'analyze' }),
        }
      );

      if (data.success && data.data) {
        setAnalysis(data.data as unknown as ContentAnalysis);
      }
    } catch (error) {
      console.error('Content analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          İçerik Optimizasyonu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Hedef Anahtar Kelime
          </label>
          <Input
            placeholder="Örn: karasu satılık ev"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            İçerik
          </label>
          <Textarea
            placeholder="Analiz edilecek içeriği buraya yapıştırın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
          />
        </div>

        <Button onClick={handleAnalyze} disabled={loading || !content || !keyword}>
          {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-xs text-gray-500">Kelime Sayısı</span>
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.wordCount}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-xs text-gray-500">Anahtar Kelime Yoğunluğu</span>
                <p className="text-2xl font-bold text-green-600">
                  {analysis.keywordDensity.toFixed(2)}%
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-xs text-gray-500">Okunabilirlik</span>
                <p className="text-2xl font-bold text-orange-600">
                  {analysis.readabilityScore.toFixed(0)}
                </p>
              </div>
            </div>

            {analysis.strengths.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Güçlü Yönler
                </h3>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-400">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Öneriler
                </h3>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-orange-700 dark:text-orange-400">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.missingElements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Eksik Öğeler
                </h3>
                <ul className="space-y-1">
                  {analysis.missingElements.map((element, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-400">
                      • {element}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
