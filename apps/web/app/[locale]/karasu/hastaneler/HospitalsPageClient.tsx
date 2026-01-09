'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@karasu/ui';
import { HospitalCard } from '@/components/hospitals/HospitalCard';
import type { SaglikKurulusu } from '@/lib/local-info/karasu-data';

interface HospitalsPageClientProps {
  hastaneler: SaglikKurulusu[];
  saglikMerkezleri: SaglikKurulusu[];
  ozelSaglik: SaglikKurulusu[];
  basePath: string;
}

type FilterType = 'all' | 'hastane' | 'saglik-merkezi' | 'ozel-saglik';

export function HospitalsPageClient({
  hastaneler,
  saglikMerkezleri,
  ozelSaglik,
  basePath,
}: HospitalsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Combine all hospitals
  const allHospitals = useMemo(() => {
    return [
      ...hastaneler,
      ...saglikMerkezleri,
      ...ozelSaglik,
    ];
  }, [hastaneler, saglikMerkezleri, ozelSaglik]);

  // Filter and search
  const filteredHospitals = useMemo(() => {
    let filtered = allHospitals;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(h => h.type === filterType);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(query) ||
        h.adres.toLowerCase().includes(query) ||
        h.telefon.includes(query) ||
        (h.aciklama && h.aciklama.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allHospitals, filterType, searchQuery]);

  // Group filtered results by type
  const groupedResults = useMemo(() => {
    const grouped = {
      hastane: filteredHospitals.filter(h => h.type === 'hastane'),
      'saglik-merkezi': filteredHospitals.filter(h => h.type === 'saglik-merkezi'),
      'ozel-saglik': filteredHospitals.filter(h => h.type === 'ozel-saglik'),
    };
    return grouped;
  }, [filteredHospitals]);

  const hasResults = filteredHospitals.length > 0;
  const hasActiveFilters = filterType !== 'all' || searchQuery.trim() !== '';

  return (
    <>
      {/* Search and Filter */}
      <section className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Hastane, adres veya telefon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                aria-label="Hastane ara"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Aramayı temizle"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-pressed={filterType === 'all'}
              >
                Tümü ({allHospitals.length})
              </button>
              <button
                onClick={() => setFilterType('hastane')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'hastane'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-pressed={filterType === 'hastane'}
              >
                Hastaneler ({hastaneler.length})
              </button>
              <button
                onClick={() => setFilterType('saglik-merkezi')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'saglik-merkezi'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-pressed={filterType === 'saglik-merkezi'}
              >
                Sağlık Merkezleri ({saglikMerkezleri.length})
              </button>
              <button
                onClick={() => setFilterType('ozel-saglik')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'ozel-saglik'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-pressed={filterType === 'ozel-saglik'}
              >
                Özel Sağlık ({ozelSaglik.length})
              </button>
            </div>
          </div>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                {filteredHospitals.length} sonuç bulundu
                {searchQuery && ` (${searchQuery} için)`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {!hasResults ? (
        <section className="mb-12">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              Aradığınız kriterlere uygun hastane bulunamadı.
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="text-primary hover:underline font-medium"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Hastaneler */}
          {groupedResults.hastane.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
                Hastaneler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedResults.hastane.map((hastane) => (
                  <HospitalCard
                    key={hastane.name}
                    hospital={{
                      name: hastane.name,
                      address: hastane.adres,
                      type: hastane.type,
                      phone: hastane.telefon,
                      aciklama: hastane.aciklama,
                    }}
                    basePath={basePath}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sağlık Merkezleri */}
          {groupedResults['saglik-merkezi'].length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
                Sağlık Merkezleri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedResults['saglik-merkezi'].map((merkez) => (
                  <HospitalCard
                    key={merkez.name}
                    hospital={{
                      name: merkez.name,
                      address: merkez.adres,
                      type: merkez.type,
                      phone: merkez.telefon,
                      aciklama: merkez.aciklama,
                    }}
                    basePath={basePath}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Özel Sağlık */}
          {groupedResults['ozel-saglik'].length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
                Özel Sağlık Kuruluşları
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedResults['ozel-saglik'].map((kurulus) => (
                  <HospitalCard
                    key={kurulus.name}
                    hospital={{
                      name: kurulus.name,
                      address: kurulus.adres,
                      type: kurulus.type,
                      phone: kurulus.telefon,
                      aciklama: kurulus.aciklama,
                    }}
                    basePath={basePath}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
