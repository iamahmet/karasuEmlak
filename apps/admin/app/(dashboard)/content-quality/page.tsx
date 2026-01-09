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
  score: number;
  issues: number;
  aiProbability: number;
  updated_at: string;
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

  const filteredItems = lowQualityItems.filter(item => {
    if (filter === 'low' && item.score >= 50) return false;
    if (filter === 'medium' && (item.score < 50 || item.score >= 70)) return false;
    if (filter === 'high' && item.score < 70) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İçerik Kalite Yönetimi</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tüm içeriklerin kalite skorları, düşük kaliteli içerikler ve iyileştirme önerileri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchQualityStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button
            onClick={runBatchProcessing}
            disabled={processing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
            Toplu İşlem
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam İçerik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Yayınlanmış içerik</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Yüksek Kalite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.highQuality}</div>
            <p className="text-xs text-gray-500 mt-1">Skor ≥ 70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Orta Kalite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.mediumQuality}</div>
            <p className="text-xs text-gray-500 mt-1">Skor 50-69</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Düşük Kalite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowQuality}</div>
            <p className="text-xs text-gray-500 mt-1">Skor &lt; 50</p>
          </CardContent>
        </Card>
      </div>

      {/* Average Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Ortalama Kalite Skoru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900">{stats.averageScore}</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    stats.averageScore >= 70
                      ? 'bg-emerald-500'
                      : stats.averageScore >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.averageScore}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {stats.averageScore >= 70 ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  İyi
                </span>
              ) : stats.averageScore >= 50 ? (
                <span className="text-yellow-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Orta
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Düşük
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Quality Content List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Düşük Kaliteli İçerikler</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Tümü
                </Button>
                <Button
                  variant={filter === 'low' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('low')}
                >
                  Düşük
                </Button>
                <Button
                  variant={filter === 'medium' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('medium')}
                >
                  Orta
                </Button>
                <Button
                  variant={filter === 'high' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('high')}
                >
                  Yüksek
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Düşük kaliteli içerik bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.type === 'article' ? 'Blog' : 'Haber'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Skor: {item.score}/100</span>
                      <span>•</span>
                      <span>{item.issues} sorun</span>
                      {item.aiProbability > 0.7 && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600">AI olasılığı: {Math.round(item.aiProbability * 100)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const path = item.type === 'article' ? '/articles' : '/news';
                        window.location.href = `${path}/${item.id}`;
                      }}
                    >
                      Düzenle
                    </Button>
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
