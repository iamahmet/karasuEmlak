"use client";

import { School, Hospital, ShoppingCart, Coffee, Bus, TreePine, MapPin } from "lucide-react";
import { cn } from "@karasu/lib";

interface NearbyPlace {
  name: string;
  distance: string;
  type: 'school' | 'hospital' | 'market' | 'cafe' | 'transport' | 'park';
}

interface NearbyPlacesProps {
  neighborhood: string;
  className?: string;
}

export function NearbyPlaces({ neighborhood, className }: NearbyPlacesProps) {
  // Default nearby places based on neighborhood
  const getPlacesByNeighborhood = (hood: string): NearbyPlace[] => {
    // Common places for all neighborhoods
    const commonPlaces: NearbyPlace[] = [
      { name: 'En Yakın Market', distance: '500 m', type: 'market' },
      { name: 'Sahil Yolu', distance: '1.2 km', type: 'transport' },
      { name: 'Park Alanı', distance: '800 m', type: 'park' },
    ];

    if (hood === 'Sahil') {
      return [
        { name: 'Karasu Sahili', distance: '200 m', type: 'park' },
        { name: 'Sahil Marketler', distance: '300 m', type: 'market' },
        { name: 'Sahil Kafeler', distance: '400 m', type: 'cafe' },
        { name: 'Dolmuş Durağı', distance: '150 m', type: 'transport' },
        { name: 'Sağlık Ocağı', distance: '1 km', type: 'hospital' },
        { name: 'İlkokul', distance: '1.5 km', type: 'school' },
      ];
    } else if (hood === 'Merkez') {
      return [
        { name: 'Karasu Devlet Hastanesi', distance: '800 m', type: 'hospital' },
        { name: 'Merkez İlköğretim', distance: '600 m', type: 'school' },
        { name: 'Otogar', distance: '500 m', type: 'transport' },
        { name: 'Çarşı Merkezi', distance: '400 m', type: 'market' },
        { name: 'Kahve Dükkanları', distance: '200 m', type: 'cafe' },
        { name: 'Şehir Parkı', distance: '1 km', type: 'park' },
      ];
    } else if (hood === 'Çamlık') {
      return [
        { name: 'Çamlık Parkı', distance: '300 m', type: 'park' },
        { name: 'Yerel Market', distance: '400 m', type: 'market' },
        { name: 'Aile Sağlık Merkezi', distance: '1.2 km', type: 'hospital' },
        { name: 'Anaokulu', distance: '500 m', type: 'school' },
        { name: 'Minibüs Durağı', distance: '200 m', type: 'transport' },
        { name: 'Piknik Alanı', distance: '800 m', type: 'park' },
      ];
    } else if (hood === 'Liman') {
      return [
        { name: 'Balıkçı Limanı', distance: '300 m', type: 'park' },
        { name: 'Liman Marketleri', distance: '250 m', type: 'market' },
        { name: 'Balık Restoranları', distance: '400 m', type: 'cafe' },
        { name: 'Dolmuş Durağı', distance: '150 m', type: 'transport' },
        { name: 'Sağlık Merkezi', distance: '1.5 km', type: 'hospital' },
        { name: 'İlkokul', distance: '1.8 km', type: 'school' },
      ];
    }

    return commonPlaces;
  };

  const places = getPlacesByNeighborhood(neighborhood);

  const getIcon = (type: NearbyPlace['type']) => {
    const iconClasses = "h-5 w-5";
    switch (type) {
      case 'school':
        return <School className={iconClasses} />;
      case 'hospital':
        return <Hospital className={iconClasses} />;
      case 'market':
        return <ShoppingCart className={iconClasses} />;
      case 'cafe':
        return <Coffee className={iconClasses} />;
      case 'transport':
        return <Bus className={iconClasses} />;
      case 'park':
        return <TreePine className={iconClasses} />;
      default:
        return <MapPin className={iconClasses} />;
    }
  };

  const getColor = (type: NearbyPlace['type']) => {
    switch (type) {
      case 'school':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'hospital':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'market':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'cafe':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'transport':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'park':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-xl">
          <MapPin className="h-6 w-6 text-[#006AFF]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Yakın Çevre</h3>
          <p className="text-sm text-gray-600">Önemli noktalara uzaklıklar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {places.map((place, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md",
              getColor(place.type)
            )}
          >
            <div className="flex-shrink-0">
              {getIcon(place.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm line-clamp-1">{place.name}</div>
              <div className="text-xs opacity-80">{place.distance}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
        <p className="text-sm text-blue-900 font-medium text-center">
          📍 {neighborhood} Mahallesi merkezi konumda, tüm ihtiyaçlarınıza yakın
        </p>
      </div>
    </div>
  );
}

