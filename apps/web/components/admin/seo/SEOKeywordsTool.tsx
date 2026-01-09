'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Search, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  competition?: 'low' | 'medium' | 'high';
}

export function SEOKeywordsTool() {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      // Get suggestions from free Google Autocomplete API
      const suggestionsData = await fetchWithRetry<{ success: boolean; data?: KeywordSuggestion[] }>(
        `/api/seo/keyword-research?keyword=${encodeURIComponent(keyword)}&country=tr`
      );

      // Get analysis
      const analysisData = await fetchWithRetry<{ success: boolean; data?: any }>(
        `/api/seo/keyword-research?keyword=${encodeURIComponent(keyword)}&country=tr&action=analyze`
      );

      if (suggestionsData.success && suggestionsData.data) {
        setSuggestions(suggestionsData.data as unknown as KeywordSuggestion[]);
      }

      if (analysisData.success && analysisData.data) {
        setAnalysis(analysisData.data);
      }
    } catch (error) {
      console.error('Keyword search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Anahtar Kelime Araştırması
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Örn: karasu satılık ev"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Aranıyor...' : 'Ara'}
          </Button>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Arama Hacmi
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {analysis.searchVolume?.toLocaleString('tr-TR') || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
                  Rekabet
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {analysis.competition || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-300">
                  Zorluk
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {analysis.difficulty || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Önerilen Anahtar Kelimeler</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm">{suggestion.keyword}</span>
                  {suggestion.searchVolume && (
                    <span className="text-xs text-gray-500">
                      {suggestion.searchVolume.toLocaleString('tr-TR')} arama/ay
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
