'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Checkbox } from '@karasu/ui/components/checkbox';

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  neighborhoods?: string[]; // Reserved for future use
}

export function AdvancedFiltersModal({ 
  isOpen, 
  onClose, 
  onApply,
  neighborhoods: _neighborhoods = [] 
}: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    rooms: [] as string[],
    bathrooms: [] as string[],
    floor: '',
    heating: undefined as string | undefined,
    furnished: undefined as string | undefined,
    balcony: false,
    parking: false,
    elevator: false,
    seaView: false,
    buildingAge: undefined as string | undefined,
    neighborhood: '',
  });

  const handleRoomToggle = (room: string) => {
    setFilters(prev => ({
      ...prev,
      rooms: prev.rooms.includes(room)
        ? prev.rooms.filter(r => r !== room)
        : [...prev.rooms, room]
    }));
  };

  const handleBathroomToggle = (bathroom: string) => {
    setFilters(prev => ({
      ...prev,
      bathrooms: prev.bathrooms.includes(bathroom)
        ? prev.bathrooms.filter(b => b !== bathroom)
        : [...prev.bathrooms, bathroom]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: '',
      rooms: [],
      bathrooms: [],
      floor: '',
      heating: '',
      furnished: '',
      balcony: false,
      parking: false,
      elevator: false,
      seaView: false,
      buildingAge: '',
      neighborhood: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-[#006AFF]" />
            <h2 className="text-2xl font-display font-extrabold text-gray-900">Gelişmiş Filtreler</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Price Range */}
          <div>
            <Label className="text-base font-bold text-gray-900 mb-4 block">Fiyat Aralığı</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice" className="text-sm text-gray-600 mb-2 block">Min. Fiyat (₺)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Min. fiyat"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-sm text-gray-600 mb-2 block">Max. Fiyat (₺)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Max. fiyat"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Size Range */}
          <div>
            <Label className="text-base font-bold text-gray-900 mb-4 block">Metrekare</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minSize" className="text-sm text-gray-600 mb-2 block">Min. m²</Label>
                <Input
                  id="minSize"
                  type="number"
                  placeholder="Min. m²"
                  value={filters.minSize}
                  onChange={(e) => setFilters(prev => ({ ...prev, minSize: e.target.value }))}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="maxSize" className="text-sm text-gray-600 mb-2 block">Max. m²</Label>
                <Input
                  id="maxSize"
                  type="number"
                  placeholder="Max. m²"
                  value={filters.maxSize}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxSize: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div>
            <Label className="text-base font-bold text-gray-900 mb-4 block">Oda Sayısı</Label>
            <div className="flex flex-wrap gap-3">
              {['1', '2', '3', '4', '5+'].map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => handleRoomToggle(room)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filters.rooms.includes(room)
                      ? 'bg-[#006AFF] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {room} Oda
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <Label className="text-base font-bold text-gray-900 mb-4 block">Banyo Sayısı</Label>
            <div className="flex flex-wrap gap-3">
              {['1', '2', '3', '4+'].map((bathroom) => (
                <button
                  key={bathroom}
                  type="button"
                  onClick={() => handleBathroomToggle(bathroom)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filters.bathrooms.includes(bathroom)
                      ? 'bg-[#006AFF] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {bathroom} Banyo
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <Label className="text-base font-bold text-gray-900 mb-4 block">Özellikler</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="balcony"
                  checked={filters.balcony}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, balcony: checked === true }))}
                />
                <Label htmlFor="balcony" className="font-medium cursor-pointer">Balkon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking"
                  checked={filters.parking}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, parking: checked === true }))}
                />
                <Label htmlFor="parking" className="font-medium cursor-pointer">Otopark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="elevator"
                  checked={filters.elevator}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, elevator: checked === true }))}
                />
                <Label htmlFor="elevator" className="font-medium cursor-pointer">Asansör</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seaView"
                  checked={filters.seaView}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, seaView: checked === true }))}
                />
                <Label htmlFor="seaView" className="font-medium cursor-pointer">Deniz Manzarası</Label>
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="heating" className="text-sm font-bold text-gray-900 mb-2 block">Isıtma</Label>
              <Select value={filters.heating || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, heating: value === "all" ? undefined : value }))}>
                <SelectTrigger id="heating" className="h-12">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="kombi">Kombi</SelectItem>
                  <SelectItem value="merkezi">Merkezi</SelectItem>
                  <SelectItem value="soba">Soba</SelectItem>
                  <SelectItem value="yerden">Yerden Isıtma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="furnished" className="text-sm font-bold text-gray-900 mb-2 block">Eşyalı</Label>
              <Select value={filters.furnished || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, furnished: value === "all" ? undefined : value }))}>
                <SelectTrigger id="furnished" className="h-12">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="yes">Eşyalı</SelectItem>
                  <SelectItem value="no">Eşyasız</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="buildingAge" className="text-sm font-bold text-gray-900 mb-2 block">Bina Yaşı</Label>
              <Select value={filters.buildingAge || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, buildingAge: value === "all" ? undefined : value }))}>
                <SelectTrigger id="buildingAge" className="h-12">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="0-5">0-5 Yıl</SelectItem>
                  <SelectItem value="5-10">5-10 Yıl</SelectItem>
                  <SelectItem value="10-20">10-20 Yıl</SelectItem>
                  <SelectItem value="20+">20+ Yıl</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handleReset} className="font-semibold">
            Sıfırla
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="font-semibold">
              İptal
            </Button>
            <Button onClick={handleApply} className="bg-[#006AFF] hover:bg-[#0052CC] text-white font-bold px-8">
              Filtreleri Uygula
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

