'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Search, Calendar, Flame } from 'lucide-react';
import { createClient } from '@karasu/lib/supabase/client';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  published_at?: string;
  created_at: string;
}

export function NewsManager() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);

  useEffect(() => {
    fetchNews();
  }, [featuredFilter]);

  async function fetchNews() {
    const supabase = createClient();
    setLoading(true);

    try {
      let query = supabase
        .from('news_articles')
        .select('*')
        .is('deleted_at', null)
        .order('published_at', { ascending: false });

      if (featuredFilter !== null) {
        query = query.eq('featured', featuredFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({ featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;
      fetchNews();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  }

  async function togglePublished(id: string, currentPublished: boolean) {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          published: !currentPublished,
          published_at: !currentPublished ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      fetchNews();
    } catch (error) {
      console.error('Error toggling published:', error);
    }
  }

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: news.length,
    published: news.filter(n => n.published).length,
    featured: news.filter(n => n.featured).length,
    breaking: news.filter(n => n.featured && n.published).length,
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Haber ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeaturedFilter(featuredFilter === true ? null : true)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              featuredFilter === true
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Flame className="h-4 w-4 inline-block mr-1" />
            Son Dakika
          </button>

          <Button onClick={fetchNews} variant="outline">
            Yenile
          </Button>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Haber
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Toplam Haber</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-sm text-gray-500">Yayında</div>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.breaking}</div>
          <div className="text-sm text-gray-500">Son Dakika</div>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
          <div className="text-sm text-gray-500">Öne Çıkan</div>
        </div>
      </div>

      {/* News List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                    {item.featured && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        SON DAKİKA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {item.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.published_at).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(item.id, item.featured)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.featured
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={item.featured ? 'Son dakikadan kaldır' : 'Son dakika yap'}
                  >
                    <Flame className={`h-4 w-4 ${item.featured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => togglePublished(item.id, item.published)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.published
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {item.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-sm text-red-900 mb-2 flex items-center gap-2">
          <Flame className="h-4 w-4" />
          Son Dakika Haberleri
        </h4>
        <p className="text-sm text-red-700">
          "Son Dakika" olarak işaretlenen haberler homepage news ticker'da otomatik görünür.
          En fazla 5 son dakika haberi gösterilir.
        </p>
      </div>
    </div>
  );
}

