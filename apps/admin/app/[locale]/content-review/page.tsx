'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Badge } from '@karasu/ui';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
} from 'lucide-react';
import { Input } from '@karasu/ui';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@karasu/lib/supabase/client';

interface ReviewItem {
  id: string;
  title: string;
  slug: string;
  type: 'article' | 'news';
  status: 'draft' | 'review' | 'published';
  author?: string;
  created_at: string;
  updated_at: string;
  content_preview?: string;
}

export default function ContentReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'review' | 'draft' | 'published'>('review');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviewItems();
  }, [filter]);

  async function fetchReviewItems() {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, slug, status, created_at, updated_at, content')
        .order('updated_at', { ascending: false })
        .limit(50);

      // Fetch news
      const { data: news } = await supabase
        .from('news')
        .select('id, title, slug, status, created_at, updated_at, content')
        .order('updated_at', { ascending: false })
        .limit(50);

      const allItems: ReviewItem[] = [
        ...(articles || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          type: 'article' as const,
          status: item.status || 'draft',
          created_at: item.created_at,
          updated_at: item.updated_at,
          content_preview: item.content?.substring(0, 150),
        })),
        ...(news || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          type: 'news' as const,
          status: item.status || 'draft',
          created_at: item.created_at,
          updated_at: item.updated_at,
          content_preview: item.content?.substring(0, 150),
        })),
      ];

      // Filter by status
      let filtered = allItems;
      if (filter === 'review') {
        filtered = allItems.filter(item => item.status === 'review');
      } else if (filter === 'draft') {
        filtered = allItems.filter(item => item.status === 'draft');
      } else if (filter === 'published') {
        filtered = allItems.filter(item => item.status === 'published');
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setItems(filtered);
    } catch (error) {
      console.error('Error fetching review items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(itemId: string, type: 'article' | 'news', newStatus: 'draft' | 'review' | 'published') {
    try {
      const supabase = createClient();
      const table = type === 'article' ? 'articles' : 'news';
      
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;
      
      fetchReviewItems(); // Refresh
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Durum güncellenirken hata oluştu');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Yayında</Badge>;
      case 'review':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">İncelemede</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400">Taslak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        <h1 className="admin-page-title">İçerik İnceleme</h1>
        <p className="admin-page-description">
          İnceleme bekleyen içerikleri onaylayın, reddedin veya düzenleyin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid-3 mb-6">
        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              İncelemede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-yellow-600 dark:text-yellow-400">
              {items.filter(i => i.status === 'review').length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              Taslak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-gray-600 dark:text-gray-400">
              {items.filter(i => i.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              Yayında
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-green-600 dark:text-green-400">
              {items.filter(i => i.status === 'published').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-professional mb-6">
        <CardHeader className="card-professional-header">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
              İçerikler
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-design-gray dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 input-professional"
                />
              </div>
              <div className="flex items-center gap-1 border border-[#E7E7E7] dark:border-[#0a3d35] rounded-lg p-1">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="text-xs"
                >
                  Tümü
                </Button>
                <Button
                  variant={filter === 'review' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('review')}
                  className="text-xs"
                >
                  İncelemede
                </Button>
                <Button
                  variant={filter === 'draft' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('draft')}
                  className="text-xs"
                >
                  Taslak
                </Button>
                <Button
                  variant={filter === 'published' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('published')}
                  className="text-xs"
                >
                  Yayında
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReviewItems}
                className="btn-secondary-professional"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-design-gray dark:text-gray-400 mx-auto mb-4" />
              <p className="text-design-gray dark:text-gray-400">
                {searchQuery || filter !== 'all'
                  ? 'Arama kriterlerinize uygun içerik bulunamadı.'
                  : 'İnceleme bekleyen içerik bulunmuyor.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60 hover:bg-white/80 dark:hover:bg-[#0a3d35]/80 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-display font-bold text-design-dark dark:text-white truncate">
                          {item.title}
                        </h3>
                        {getStatusBadge(item.status)}
                        <Badge variant="outline" className="text-xs">
                          {item.type === 'article' ? 'Makale' : 'Haber'}
                        </Badge>
                      </div>
                      <p className="text-sm text-design-gray dark:text-gray-400 mb-2">
                        /{item.slug}
                      </p>
                      {item.content_preview && (
                        <p className="text-sm text-design-gray dark:text-gray-400 line-clamp-2 mb-3">
                          {item.content_preview}...
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-design-gray dark:text-gray-400">
                        <span>Oluşturulma: {new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                        <span>•</span>
                        <span>Güncelleme: {new Date(item.updated_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const path = item.type === 'article' ? '/articles' : '/haberler';
                          router.push(`${path}/${item.id}`);
                        }}
                        className="btn-secondary-professional"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Görüntüle
                      </Button>
                      {item.status === 'review' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateStatus(item.id, item.type, 'published')}
                            className="btn-primary-professional"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Onayla
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(item.id, item.type, 'draft')}
                            className="btn-secondary-professional"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reddet
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
