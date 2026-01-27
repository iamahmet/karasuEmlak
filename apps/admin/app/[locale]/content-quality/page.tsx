'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Badge } from '@karasu/ui';
import {
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Filter,
  Download,
  Search,
} from 'lucide-react';
import { Input } from '@karasu/ui';
import { useRouter } from '@/i18n/routing';

interface QualityStats {
  total: number;
  highQuality: number; // >= 70
  mediumQuality: number; // 50-69
  lowQuality: number; // < 50
  averageScore: number;
  needsReview: number;
}

interface LowQualityItem {
  id: string;
  title: string;
  slug: string;
  type: 'article' | 'news';
  qualityScore: number;
  issues: string[] | number;
}

export default function ContentQualityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QualityStats>({
    total: 0,
    highQuality: 0,
    mediumQuality: 0,
    lowQuality: 0,
    averageScore: 0,
    needsReview: 0,
  });
  const [lowQualityItems, setLowQualityItems] = useState<LowQualityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch quality stats
  useEffect(() => {
    fetchQualityStats();
  }, []);

  async function fetchQualityStats() {
    setLoading(true);
    try {
      console.log('[Content Quality] Fetching stats from API...');
      const response = await fetch('/api/content-quality/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[Content Quality] Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('[Content Quality] Response data:', {
        hasStats: !!data.stats,
        total: data.stats?.total,
        highQuality: data.stats?.highQuality,
        mediumQuality: data.stats?.mediumQuality,
        lowQuality: data.stats?.lowQuality,
        averageScore: data.stats?.averageScore,
        lowQualityCount: data.lowQuality?.length || 0,
        lowQualityItems: data.lowQuality,
        error: data.error,
        fullResponse: data, // Full response for debugging
      });
      
      // Always set data, even if response is not ok (API returns 200 with empty data)
      if (data && data.stats) {
        setStats({
          total: Number(data.stats.total) || 0,
          highQuality: Number(data.stats.highQuality) || 0,
          mediumQuality: Number(data.stats.mediumQuality) || 0,
          lowQuality: Number(data.stats.lowQuality) || 0,
          averageScore: Number(data.stats.averageScore) || 0,
          needsReview: Number(data.stats.needsReview) || 0,
        });
        console.log('[Content Quality] Stats set:', {
          total: data.stats.total,
          highQuality: data.stats.highQuality,
          mediumQuality: data.stats.mediumQuality,
          lowQuality: data.stats.lowQuality,
        });
      } else {
        // Fallback to empty stats
        console.warn('[Content Quality] No stats in response, using defaults');
        setStats({
          total: 0,
          highQuality: 0,
          mediumQuality: 0,
          lowQuality: 0,
          averageScore: 0,
          needsReview: 0,
        });
      }
      
      if (data && Array.isArray(data.lowQuality)) {
        console.log('[Content Quality] Setting low quality items:', data.lowQuality.length);
        setLowQualityItems(data.lowQuality);
      } else {
        console.warn('[Content Quality] No lowQuality array in response');
        setLowQualityItems([]);
      }
      
      if (!response.ok && data && data.error) {
        console.warn('[Content Quality] API warning:', data.error);
      }
    } catch (error: any) {
      console.error('[Content Quality] Error fetching quality stats:', error);
      // Set empty state on error to prevent UI crash
      setStats({
        total: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
        averageScore: 0,
        needsReview: 0,
      });
      setLowQualityItems([]);
    } finally {
      setLoading(false);
      console.log('[Content Quality] Fetch completed');
    }
  }

  async function runBatchProcessing() {
    setProcessing(true);
    try {
      const response = await fetch('/api/content-quality/batch-process', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          alert(`Hata: ${data.error}`);
        } else {
          alert(`İşlem tamamlandı: ${data.processed} içerik işlendi, ${data.updated} güncellendi`);
          fetchQualityStats(); // Refresh stats
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        alert(`İşlem başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Error running batch processing:', error);
      alert('İşlem sırasında hata oluştu');
    } finally {
      setProcessing(false);
    }
  }

  const filteredItems = lowQualityItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'low') return matchesSearch && item.qualityScore < 50;
    if (filter === 'medium') return matchesSearch && item.qualityScore >= 50 && item.qualityScore < 70;
    if (filter === 'high') return matchesSearch && item.qualityScore >= 70;
    
    return matchesSearch;
  });

  const getQualityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Yüksek</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">Orta</Badge>;
    return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">Düşük</Badge>;
  };

  if (loading) {
    return (
      <div className="admin-container responsive-padding space-section">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-design-light mx-auto mb-4" />
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      {/* Header */}
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">İçerik Kalitesi</h1>
          <p className="admin-page-description">
            Tüm içeriklerinizin kalite skorlarını görüntüleyin ve düşük kaliteli içerikleri iyileştirin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid-4 mb-6">
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-sm font-ui font-semibold text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              Toplam İçerik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-sm font-ui font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Yüksek Kalite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-green-600 dark:text-green-400">
              {stats.highQuality}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.highQuality / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-sm font-ui font-semibold text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              Orta Kalite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-yellow-600 dark:text-yellow-400">
              {stats.mediumQuality}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.mediumQuality / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-sm font-ui font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              Düşük Kalite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-red-600 dark:text-red-400">
              {stats.lowQuality}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.lowQuality / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Average Score Card */}
      <Card className="card-professional mb-6">
        <CardHeader>
          <CardTitle className="text-base font-display font-bold text-foreground">
            Ortalama Kalite Skoru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-display font-bold ${getQualityColor(stats.averageScore || 0)}`}>
              {(stats.averageScore || 0).toFixed(1)}
            </div>
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    (stats.averageScore || 0) >= 70
                      ? 'bg-primary'
                      : (stats.averageScore || 0) >= 50
                      ? 'bg-yellow-500'
                      : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, stats.averageScore || 0))}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {(stats.averageScore || 0) >= 70
                  ? 'Mükemmel! İçerikleriniz yüksek kalitede.'
                  : (stats.averageScore || 0) >= 50
                  ? 'İyi, ancak bazı iyileştirmeler yapılabilir.'
                  : 'Dikkat! İçerik kalitesini artırmak için önlemler alınmalı.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="card-professional mb-6">
        <CardHeader>
          <CardTitle className="text-base font-display font-bold text-foreground">
            Toplu İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runBatchProcessing}
              disabled={processing}
              className="bg-design-light hover:bg-design-light/90 text-white"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tüm İçerikleri Analiz Et
                </>
              )}
            </Button>
            <Button
              onClick={fetchQualityStats}
              variant="outline"
              className="border-border"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Low Quality Items */}
      <Card className="card-professional">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-bold text-foreground">
              Düşük Kaliteli İçerikler
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-1 border border-border rounded-xl p-1">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="text-xs"
                >
                  Tümü
                </Button>
                <Button
                  variant={filter === 'low' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('low')}
                  className="text-xs"
                >
                  Düşük
                </Button>
                <Button
                  variant={filter === 'medium' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('medium')}
                  className="text-xs"
                >
                  Orta
                </Button>
                <Button
                  variant={filter === 'high' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('high')}
                  className="text-xs"
                >
                  Yüksek
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              {stats.total === 0 ? (
                <>
                  <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Henüz İçerik Yok
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Database'de henüz içerik bulunmuyor. İçerik ekledikten sonra bu sayfada görünecektir.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/articles')}
                      className="border-border"
                    >
                      Makale Ekle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/haberler')}
                      className="border-border"
                    >
                      Haber Ekle
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || filter !== 'all'
                      ? 'Arama kriterlerinize uygun içerik bulunamadı.'
                      : 'Tüm içerikler yeterli kalitede!'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card/80 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-display font-bold text-foreground truncate">
                          {item.title}
                        </h3>
                        {getQualityBadge(item.qualityScore)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        /{item.slug} • {item.type === 'article' ? 'Makale' : 'Haber'}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${getQualityColor(item.qualityScore)}`}>
                          Skor: {(item.qualityScore || 0).toFixed(1)}
                        </span>
                      </div>
                      {Array.isArray(item.issues) && item.issues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            Tespit Edilen Sorunlar:
                          </p>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                            {item.issues.slice(0, 3).map((issue: string, idx: number) => (
                              <li key={idx}>{issue}</li>
                            ))}
                            {item.issues.length > 3 && (
                              <li className="text-muted-foreground">
                                +{item.issues.length - 3} sorun daha
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      {typeof item.issues === 'number' && item.issues > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {item.issues} sorun tespit edildi
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (item.type === 'article') {
                            router.push(`/articles/${item.id}`);
                          } else {
                            // News articles use /edit route
                            router.push(`/haberler/${item.id}/edit`);
                          }
                        }}
                        className="border-border"
                      >
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!confirm(`${item.title} içeriğini iyileştirmek istediğinizden emin misiniz?`)) {
                            return;
                          }
                          try {
                            const response = await fetch(`/api/content-quality/improve/${item.id}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ type: item.type }),
                            });
                            if (response.ok) {
                              const data = await response.json();
                              const message = data.improved 
                                ? `İyileştirme tamamlandı! Yeni skor: ${data.newScore}/100 (${data.scoreImprovement > 0 ? '+' : ''}${data.scoreImprovement} puan artış)`
                                : `Analiz tamamlandı! Skor: ${data.newScore}/100`;
                              alert(message);
                              fetchQualityStats();
                            } else {
                              const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
                              alert(`İyileştirme başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
                            }
                          } catch (error) {
                            console.error('Error improving content:', error);
                            alert('İyileştirme sırasında hata oluştu');
                          }
                        }}
                        className="bg-design-light hover:bg-design-light/90 text-white"
                      >
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        İyileştir
                      </Button>
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
