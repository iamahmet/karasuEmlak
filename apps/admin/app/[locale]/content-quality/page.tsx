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
  issues: string[];
}

export default function ContentQualityPage() {
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
      const response = await fetch('/api/content-quality/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLowQualityItems(data.lowQuality || []);
      }
    } catch (error) {
      console.error('Error fetching quality stats:', error);
    } finally {
      setLoading(false);
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
        alert(`İşlem tamamlandı: ${data.processed} içerik işlendi, ${data.updated} güncellendi`);
        fetchQualityStats(); // Refresh stats
      } else {
        alert('İşlem başarısız oldu');
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
        <h1 className="admin-page-title">İçerik Kalitesi</h1>
        <p className="admin-page-description">
          Tüm içeriklerinizin kalite skorlarını görüntüleyin ve düşük kaliteli içerikleri iyileştirin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid-4 mb-6">
        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              Toplam İçerik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-design-dark dark:text-white">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Yüksek Kalite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-green-600 dark:text-green-400">
              {stats.highQuality}
            </div>
            <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
              {stats.total > 0 ? Math.round((stats.highQuality / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              Orta Kalite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-yellow-600 dark:text-yellow-400">
              {stats.mediumQuality}
            </div>
            <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
              {stats.total > 0 ? Math.round((stats.mediumQuality / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              Düşük Kalite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-red-600 dark:text-red-400">
              {stats.lowQuality}
            </div>
            <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
              {stats.total > 0 ? Math.round((stats.lowQuality / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Average Score Card */}
      <Card className="card-professional mb-6">
        <CardHeader className="card-professional-header">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
            Ortalama Kalite Skoru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-display font-bold ${getQualityColor(stats.averageScore)}`}>
              {stats.averageScore.toFixed(1)}
            </div>
            <div className="flex-1">
              <div className="w-full bg-[#E7E7E7] dark:bg-[#0a3d35] rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.averageScore >= 70
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : stats.averageScore >= 50
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${stats.averageScore}%` }}
                />
              </div>
              <p className="text-sm text-design-gray dark:text-gray-400 mt-2">
                {stats.averageScore >= 70
                  ? 'Mükemmel! İçerikleriniz yüksek kalitede.'
                  : stats.averageScore >= 50
                  ? 'İyi, ancak bazı iyileştirmeler yapılabilir.'
                  : 'Dikkat! İçerik kalitesini artırmak için önlemler alınmalı.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="card-professional mb-6">
        <CardHeader className="card-professional-header">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
            Toplu İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runBatchProcessing}
              disabled={processing}
              className="btn-primary-professional"
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
              className="btn-secondary-professional"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Low Quality Items */}
      <Card className="card-professional">
        <CardHeader className="card-professional-header">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
              Düşük Kaliteli İçerikler
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-design-gray dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 input-professional"
                />
              </div>
              <div className="flex items-center gap-1 border border-[#E7E7E7] dark:border-[#0a3d35] rounded-xl p-1">
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
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <p className="text-design-gray dark:text-gray-400">
                {searchQuery || filter !== 'all'
                  ? 'Arama kriterlerinize uygun içerik bulunamadı.'
                  : 'Tüm içerikler yeterli kalitede!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
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
                        {getQualityBadge(item.qualityScore)}
                      </div>
                      <p className="text-sm text-design-gray dark:text-gray-400 mb-2">
                        /{item.slug} • {item.type === 'article' ? 'Makale' : 'Haber'}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${getQualityColor(item.qualityScore)}`}>
                          Skor: {item.qualityScore.toFixed(1)}
                        </span>
                      </div>
                      {item.issues && item.issues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-1">
                            Tespit Edilen Sorunlar:
                          </p>
                          <ul className="list-disc list-inside text-xs text-design-gray dark:text-gray-400 space-y-1">
                            {item.issues.slice(0, 3).map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                            {item.issues.length > 3 && (
                              <li className="text-design-gray dark:text-gray-400">
                                +{item.issues.length - 3} sorun daha
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const path = item.type === 'article' ? '/articles' : '/haberler';
                          window.location.href = `${path}/${item.id}`;
                        }}
                        className="btn-secondary-professional"
                      >
                        Düzenle
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
