'use client';

import { useEffect, useState } from 'react';
import { Card } from '@karasu/ui';
import { 
  Image as ImageIcon, 
  DollarSign, 
  TrendingUp, 
  Clock,
  BarChart3,
} from 'lucide-react';

interface Stats {
  hourly: { count: number };
  daily: { count: number; success: number; failed: number; cost: number; byType: Record<string, number> };
  weekly: { count: number; cost: number };
  monthly: { count: number; cost: number };
  media: { total: number; mostUsed: Array<{ id: string; cloudinary_public_id: string; cloudinary_secure_url: string; title: string | null; usage_count: number | null; generation_cost: number | null; created_at: string }> };
}

export function AIImagesDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai-images/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">Veri yüklenemedi</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Son 1 Saat</p>
              <p className="text-2xl font-bold">{stats.hourly.count}</p>
              <p className="text-xs text-gray-500 mt-1">İstek</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bugün</p>
              <p className="text-2xl font-bold">{stats.daily.count}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.daily.success} başarılı, {stats.daily.failed} başarısız
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bugünkü Maliyet</p>
              <p className="text-2xl font-bold">${stats.daily.cost.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Limit: $10/gün</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam AI Görsel</p>
              <p className="text-2xl font-bold">{stats.media.total}</p>
              <p className="text-xs text-gray-500 mt-1">Database'de</p>
            </div>
            <ImageIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Günlük</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">İstek:</span>
              <span className="font-medium">{stats.daily.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Maliyet:</span>
              <span className="font-medium">${stats.daily.cost.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Haftalık</h3>
            <BarChart3 className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">İstek:</span>
              <span className="font-medium">{stats.weekly.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Maliyet:</span>
              <span className="font-medium">${stats.weekly.cost.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Aylık</h3>
            <DollarSign className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">İstek:</span>
              <span className="font-medium">{stats.monthly.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Maliyet:</span>
              <span className="font-medium">${stats.monthly.cost.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* By Type */}
      {Object.keys(stats.daily.byType).length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Bugünkü İstekler (Türe Göre)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.daily.byType).map(([type, count]) => (
              <div key={type} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Most Used Images */}
      {stats.media.mostUsed.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">En Çok Kullanılan AI Görseller</h3>
          <div className="space-y-3">
            {stats.media.mostUsed.slice(0, 5).map((image) => (
              <div key={image.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img
                  src={image.cloudinary_secure_url}
                  alt={image.title || 'AI Generated Image'}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{image.title || 'Başlıksız'}</p>
                  <p className="text-xs text-gray-500">{image.cloudinary_public_id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{image.usage_count || 0}</p>
                  <p className="text-xs text-gray-500">kullanım</p>
                  {image.generation_cost && (
                    <p className="text-xs text-gray-500">${image.generation_cost.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

