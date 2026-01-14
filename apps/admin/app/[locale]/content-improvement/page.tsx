'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Badge } from '@karasu/ui';
import {
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Input } from '@karasu/ui';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@karasu/lib/supabase/client';
import dynamic from 'next/dynamic';
import { AdminAIChecker } from '@/components/admin/content/AdminAIChecker';
import { BatchImprovement } from '@/components/admin/content/BatchImprovement';

interface Article {
  id: string;
  title: string;
  slug: string;
  content?: string;
  status: string;
  created_at: string;
}

export default function ContentImprovementPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (selectedArticleId) {
      fetchArticleDetails(selectedArticleId);
    }
  }, [selectedArticleId]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchArticleDetails(articleId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setSelectedArticle(data);
    } catch (error) {
      console.error('Error fetching article details:', error);
    }
  }

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-container responsive-padding">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-design-light mx-auto mb-4" />
            <p className="text-design-gray dark:text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container responsive-padding">
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-design-light" />
          AI İçerik İyileştirme
        </h1>
        <p className="admin-page-description">
          İçeriklerinizi AI ile analiz edin, iyileştirin ve kalite skorlarını artırın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="lg:col-span-1">
          <Card className="card-professional">
            <CardHeader className="card-professional-header">
              <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                Makaleler
              </CardTitle>
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-design-gray dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 input-professional"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-modern">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-8 text-design-gray dark:text-gray-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Makale bulunamadı</p>
                  </div>
                ) : (
                  filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticleId(article.id)}
                      className={`
                        w-full text-left p-3 rounded-lg border transition-all duration-300
                        ${
                          selectedArticleId === article.id
                            ? 'border-design-light bg-design-light/10 dark:bg-design-light/20'
                            : 'border-[#E7E7E7] dark:border-[#0a3d35] hover:border-design-light/50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-display font-semibold text-design-dark dark:text-white truncate">
                            {article.title}
                          </h3>
                          <p className="text-xs text-design-gray dark:text-gray-400 mt-1 truncate">
                            /{article.slug}
                          </p>
                        </div>
                        {selectedArticleId === article.id && (
                          <CheckCircle className="h-4 w-4 text-design-light flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Checker */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <AdminAIChecker
              articleId={selectedArticle.id}
              title={selectedArticle.title}
              content={selectedArticle.content || ''}
              onImproved={() => {
                fetchArticleDetails(selectedArticle.id);
                fetchArticles();
              }}
            />
          ) : (
            <Card className="card-professional">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-design-light mx-auto mb-4 opacity-50" />
                <p className="text-design-gray dark:text-gray-400">
                  Analiz etmek için bir makale seçin
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Batch Improvement */}
      <div className="mt-6">
        <BatchImprovement articles={articles} />
      </div>
    </div>
  );
}
