'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Search, Filter, MapPin, Home, Key, Bot } from 'lucide-react';
import { createClient } from '@karasu/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: string;
  property_type: string;
  location_neighborhood: string;
  price_amount: number;
  published: boolean;
  featured: boolean;
  available: boolean;
  created_at: string;
}

export function ListingsManager() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    const supabase = createClient();
    setLoading(true);

    try {
      let query = supabase
        .from('listings')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (featuredFilter !== null) {
        query = query.eq('featured', featuredFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('listings')
        .update({ featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;
      fetchListings();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  }

  async function togglePublished(id: string, currentPublished: boolean) {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('listings')
        .update({ published: !currentPublished })
        .eq('id', id);

      if (error) throw error;
      fetchListings();
    } catch (error) {
      console.error('Error toggling published:', error);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('listings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  }

  const handleScrape = async () => {
    if (!confirm('Karasusatilikev.com sitesinden eksik ilanlar taranıp sisteme eklensin mi? Bu işlem biraz zaman alabilir.')) return;
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape-listings', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchListings();
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (err) {
      alert('Sistemsel bir hata oluştu');
    } finally {
      setIsScraping(false);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location_neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="İlan ara (başlık, mahalle)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="satilik">Satılık</option>
            <option value="kiralik">Kiralık</option>
          </select>

          <button
            onClick={() => setFeaturedFilter(featuredFilter === true ? null : true)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${featuredFilter === true
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Star className="h-4 w-4 inline-block mr-1" />
            Öne Çıkanlar
          </button>

          <Button onClick={fetchListings} variant="outline" disabled={isScraping}>
            <Filter className="h-4 w-4 mr-2" />
            Yenile
          </Button>

          <Button onClick={handleScrape} disabled={isScraping} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isScraping ? (
              <Bot className="h-4 w-4 mr-2 animate-bounce" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            {isScraping ? 'Taranıyor...' : 'İlan Çek'}
          </Button>

          <Button onClick={() => router.push('/listings/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni İlan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
          <div className="text-sm text-gray-500">Toplam İlan</div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {listings.filter(l => l.status === 'satilik').length}
          </div>
          <div className="text-sm text-gray-500">Satılık</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {listings.filter(l => l.status === 'kiralik').length}
          </div>
          <div className="text-sm text-gray-500">Kiralık</div>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {listings.filter(l => l.featured).length}
          </div>
          <div className="text-sm text-gray-500">Öne Çıkan</div>
        </div>
      </div>

      {/* Listings Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İlan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fiyat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Öne Çıkan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{listing.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location_neighborhood}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${listing.status === 'satilik'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                      }`}>
                      {listing.status === 'satilik' ? <Home className="h-3 w-3" /> : <Key className="h-3 w-3" />}
                      {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-sm text-gray-900">
                      ₺{new Intl.NumberFormat('tr-TR').format(listing.price_amount)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleFeatured(listing.id, listing.featured)}
                      className={`p-2 rounded-lg transition-colors ${listing.featured
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      title={listing.featured ? 'Öne çıkandan kaldır' : 'Öne çıkar'}
                    >
                      {listing.featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublished(listing.id, listing.published)}
                        className={`p-2 rounded-lg transition-colors ${listing.published
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        title={listing.published ? 'Yayından kaldır' : 'Yayınla'}
                      >
                        {listing.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <Link href={`/listings/${listing.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteListing(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredListings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || statusFilter !== 'all' || featuredFilter !== null
                ? 'Filtre kriterlerine uygun ilan bulunamadı'
                : 'Henüz ilan eklenmemiş'
              }
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-sm text-blue-900 mb-2">
          💡 İpucu: Öne Çıkan İlanlar
        </h4>
        <p className="text-sm text-blue-700">
          Yıldız ikonuna tıklayarak ilanları "Öne Çıkan" olarak işaretleyin.
          Öne çıkan ilanlar homepage'de otomatik olarak gösterilir.
        </p>
      </div>
    </div>
  );
}

