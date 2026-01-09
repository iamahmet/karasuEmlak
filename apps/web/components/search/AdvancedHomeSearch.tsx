'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Search, MapPin, Home, Building2, ChevronDown } from 'lucide-react';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';

interface AdvancedHomeSearchProps {
  neighborhoods?: string[];
  basePath?: string;
}

export function AdvancedHomeSearch({ neighborhoods = [], basePath = '' }: AdvancedHomeSearchProps) {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (location && location !== 'all') params.set('neighborhood', location);
    if (status && status !== 'all') params.set('status', status);
    if (propertyType && propertyType !== 'all') params.set('propertyType', propertyType);
    
    // Advanced filters
    if (advancedFilters.minPrice) params.set('minPrice', advancedFilters.minPrice);
    if (advancedFilters.maxPrice) params.set('maxPrice', advancedFilters.maxPrice);
    if (advancedFilters.minSize) params.set('minSize', advancedFilters.minSize);
    if (advancedFilters.maxSize) params.set('maxSize', advancedFilters.maxSize);
    if (advancedFilters.rooms?.length > 0) params.set('rooms', advancedFilters.rooms.join(','));
    if (advancedFilters.bathrooms?.length > 0) params.set('bathrooms', advancedFilters.bathrooms.join(','));
    if (advancedFilters.heating) params.set('heating', advancedFilters.heating);
    if (advancedFilters.furnished) params.set('furnished', advancedFilters.furnished);
    if (advancedFilters.balcony) params.set('balcony', 'true');
    if (advancedFilters.parking) params.set('parking', 'true');
    if (advancedFilters.elevator) params.set('elevator', 'true');
    if (advancedFilters.seaView) params.set('seaView', 'true');
    if (advancedFilters.buildingAge) params.set('buildingAge', advancedFilters.buildingAge);

    const targetPath = status === 'kiralik' 
      ? `${basePath}/kiralik`
      : `${basePath}/satilik`;
    
    const queryString = params.toString();
    router.push(`${targetPath}${queryString ? `?${queryString}` : ''}`);
  };

  const handleAdvancedFiltersApply = (filters: any) => {
    setAdvancedFilters(filters);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-white rounded-lg p-3 shadow-xl border border-gray-200">
        {/* Transaction Type Buttons - Apple Quality */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setStatus('satilik')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-[13px] tracking-[-0.01em] transition-all duration-200 ${
              status === 'satilik' || !status
                ? 'bg-[#006AFF] text-white shadow-sm hover:bg-[#0052CC]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Home className="h-4 w-4 stroke-[1.5]" />
            Satılık
          </button>
          <button
            type="button"
            onClick={() => setStatus('kiralik')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-[13px] tracking-[-0.01em] transition-all duration-200 ${
              status === 'kiralik'
                ? 'bg-[#006AFF] text-white shadow-sm hover:bg-[#0052CC]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 className="h-4 w-4 stroke-[1.5]" />
            Kiralık
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Konum */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="flex items-center gap-1.5 text-gray-700 font-medium text-[13px] tracking-[-0.01em]">
              <MapPin className="h-3.5 w-3.5 text-[#006AFF] stroke-[1.5]" />
              Konum
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="w-full h-10 bg-white border border-gray-200 rounded-lg hover:border-[#006AFF] focus-visible:border-[#006AFF] focus-visible:ring-2 focus-visible:ring-[#006AFF]/20 transition-all duration-200 text-[15px] font-normal tracking-[-0.011em] hover:shadow-sm active:scale-[0.98]">
                <SelectValue placeholder="Mahalle, bölge..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gayrimenkul Türü */}
          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="flex items-center gap-1.5 text-gray-700 font-medium text-[13px] tracking-[-0.01em]">
              <Building2 className="h-3.5 w-3.5 text-[#006AFF] stroke-[1.5]" />
              İlan Türü
            </Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="propertyType" className="w-full h-10 bg-white border border-gray-200 rounded-lg hover:border-[#006AFF] transition-all duration-200 text-[15px] font-normal tracking-[-0.011em]">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="daire">Daire</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="ev">Ev</SelectItem>
                <SelectItem value="yazlik">Yazlık</SelectItem>
                <SelectItem value="arsa">Arsa</SelectItem>
                <SelectItem value="isyeri">İşyeri</SelectItem>
                <SelectItem value="dukkan">Dükkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button - Apple Quality */}
          <div className="flex items-end">
            <Button 
              type="submit" 
              size="sm" 
              className="w-full h-10 bg-[#006AFF] hover:bg-[#0052CC] text-white shadow-sm hover:shadow-md font-semibold text-[15px] tracking-[-0.011em] rounded-lg transition-all duration-200"
            >
              <Search className="mr-2 h-4 w-4 stroke-[1.5]" />
              Ara
            </Button>
          </div>
        </div>
        
        {/* Advanced Filters Link - Apple Quality */}
        <div className="mt-3 pt-2.5 border-t border-gray-200">
          <button
            type="button"
            className="text-[13px] text-[#006AFF] hover:text-[#0052CC] font-medium tracking-[-0.01em] flex items-center gap-1.5 transition-colors duration-200"
            onClick={() => setShowAdvancedFilters(true)}
          >
            <span>Gelişmiş Filtreler</span>
            <ChevronDown className="h-3.5 w-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>
      
      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApply={handleAdvancedFiltersApply}
        neighborhoods={neighborhoods}
      />
    </form>
  );
}

