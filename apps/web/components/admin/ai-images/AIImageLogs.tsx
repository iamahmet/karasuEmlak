'use client';

import { useEffect, useState } from 'react';
import { Card } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Log {
  id: string;
  generation_type: string;
  image_size: string;
  image_quality: string;
  cost: number;
  success: boolean;
  error_message: string | null;
  media_asset_id: string | null;
  created_at: string;
  media_assets: {
    id: string;
    cloudinary_public_id: string;
    cloudinary_secure_url: string;
    title: string | null;
  } | null;
}

export function AIImageLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all',
    success: 'all',
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.success && filters.success !== 'all') params.append('success', filters.success);

      const response = await fetch(`/api/ai-images/logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Tip</label>
            <Select value={filters.type || "all"} onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? "" : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="listing">İlan</SelectItem>
                <SelectItem value="article">Makale</SelectItem>
                <SelectItem value="neighborhood">Mahalle</SelectItem>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="custom">Özel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Durum</label>
            <Select value={filters.success || "all"} onValueChange={(value) => setFilters({ ...filters, success: value === "all" ? "" : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Başarılı</SelectItem>
                <SelectItem value="false">Başarısız</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ type: 'all', success: 'all' })}
              className="w-full"
            >
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Tip</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Boyut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Maliyet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Görsel</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm">
                    {new Date(log.created_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{log.generation_type}</td>
                  <td className="px-4 py-3 text-sm">{log.image_size}</td>
                  <td className="px-4 py-3">
                    {log.success ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Başarılı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        Başarısız
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {log.cost.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.media_assets?.cloudinary_secure_url ? (
                      <a
                        href={log.media_assets.cloudinary_secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Görüntüle
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

