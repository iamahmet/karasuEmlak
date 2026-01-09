'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Bookmark, Trash2, Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils/api-client';
import { toast } from 'sonner';
import { cn } from '@karasu/lib';
import Link from 'next/link';

interface SavedSearch {
  id: string;
  name: string;
  email: string;
  filters: {
    min_price?: number;
    max_price?: number;
    property_type?: string;
    location?: string;
    neighborhood?: string;
    [key: string]: any;
  };
  email_notifications: boolean;
  push_notifications: boolean;
  frequency: string;
  matches_count: number;
  last_notified_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface SavedSearchesListProps {
  email: string;
  className?: string;
}

export function SavedSearchesList({ email, className }: SavedSearchesListProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSearches();
  }, [email]);

  const loadSearches = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry(`/api/searches?email=${encodeURIComponent(email)}&active_only=true`);

      if (!data.success) {
        throw new Error(data.error || 'Kayıtlı aramalar getirilemedi');
      }

      setSearches(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      toast.error('Kayıtlı aramalar yüklenemedi', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kayıtlı aramayı silmek istediğinize emin misiniz?')) {
      return;
    }

    setDeletingId(id);

    try {
      const data = await fetchWithRetry(`/api/searches/${id}`, {
        method: 'DELETE',
      });

      if (!data.success) {
        throw new Error(data.error || 'Arama silinemedi');
      }

      toast.success('Kayıtlı arama silindi');
      loadSearches();
    } catch (err: any) {
      toast.error('Arama silinemedi', {
        description: err.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const data = await fetchWithRetry(`/api/searches/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentActive,
        }),
      });

      if (!data.success) {
        throw new Error(data.error || 'Arama güncellenemedi');
      }

      toast.success(currentActive ? 'Bildirimler durduruldu' : 'Bildirimler aktifleştirildi');
      loadSearches();
    } catch (err: any) {
      toast.error('Arama güncellenemedi', {
        description: err.message,
      });
    }
  };

  const formatFilters = (filters: SavedSearch['filters']): string => {
    const parts: string[] = [];
    if (filters.min_price) parts.push(`Min: ${filters.min_price.toLocaleString('tr-TR')} TL`);
    if (filters.max_price) parts.push(`Max: ${filters.max_price.toLocaleString('tr-TR')} TL`);
    if (filters.property_type) parts.push(`Tip: ${filters.property_type}`);
    if (filters.location) parts.push(`Lokasyon: ${filters.location}`);
    if (filters.neighborhood) parts.push(`Mahalle: ${filters.neighborhood}`);
    return parts.join(' • ') || 'Tüm ilanlar';
  };

  const buildSearchUrl = (filters: SavedSearch['filters']): string => {
    const params = new URLSearchParams();
    if (filters.min_price) params.set('minPrice', filters.min_price.toString());
    if (filters.max_price) params.set('maxPrice', filters.max_price.toString());
    if (filters.property_type) params.set('propertyType', filters.property_type);
    if (filters.location) params.set('location', filters.location);
    if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
    return `/satilik?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg', className)}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Hata</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Bookmark className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Kayıtlı Arama Yok
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Henüz kayıtlı aramanız bulunmuyor. Arama yaparken aramayı kaydedebilirsiniz.
        </p>
        <Button asChild variant="outline">
          <Link href="/satilik">İlanları Görüntüle</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {searches.map((search) => (
        <div
          key={search.id}
          className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {search.name}
                </h3>
                {!search.is_active && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                    Pasif
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {formatFilters(search.filters)}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                <span>
                  {search.email_notifications && (
                    <span className="flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      E-posta
                    </span>
                  )}
                </span>
                {search.matches_count > 0 && (
                  <span>{search.matches_count} eşleşme bulundu</span>
                )}
                {search.last_notified_at && (
                  <span>
                    Son bildirim: {new Date(search.last_notified_at).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(search.id, search.is_active)}
                title={search.is_active ? 'Bildirimleri Durdur' : 'Bildirimleri Aktifleştir'}
              >
                {search.is_active ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href={buildSearchUrl(search.filters)}>Görüntüle</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(search.id)}
                disabled={deletingId === search.id}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {deletingId === search.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
