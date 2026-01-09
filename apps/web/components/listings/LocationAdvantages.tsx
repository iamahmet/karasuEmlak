"use client";

import { MapPin, TrendingUp, Heart, Home, Waves, Trees } from "lucide-react";
import { cn } from "@karasu/lib";

interface LocationAdvantagesProps {
  neighborhood: string;
  propertyType: string;
  className?: string;
}

export function LocationAdvantages({ neighborhood, propertyType, className }: LocationAdvantagesProps) {
  const getAdvantages = (hood: string) => {
    if (hood === 'Sahil') {
      return [
        {
          icon: Waves,
          title: 'Denize Sıfır Konum',
          description: 'Sahil yürüyüş yoluna birkaç dakika, plajlara yürüme mesafesinde.',
          color: 'blue',
        },
        {
          icon: TrendingUp,
          title: 'Yüksek Yatırım Değeri',
          description: 'Sahil bölgesi Karasu\'nun en değerli bölgelerinden biri, yatırım potansiyeli yüksek.',
          color: 'green',
        },
        {
          icon: Heart,
          title: 'Tatil ve İkamet',
          description: 'Hem yazlık hem de kalıcı ikamet için mükemmel, sosyal aktiviteler bol.',
          color: 'red',
        },
        {
          icon: Home,
          title: 'Gelişmiş Altyapı',
          description: 'Market, restoran, kafe gibi tüm ihtiyaçlar yürüme mesafesinde.',
          color: 'purple',
        },
      ];
    } else if (hood === 'Merkez') {
      return [
        {
          icon: MapPin,
          title: 'Merkezi Konum',
          description: 'Her yere kolay ulaşım, tüm kamu hizmetleri yakınınızda.',
          color: 'blue',
        },
        {
          icon: Home,
          title: 'Yerleşim İçin İdeal',
          description: 'Okul, hastane, alışveriş merkezleri gibi tüm imkanlar çok yakın.',
          color: 'green',
        },
        {
          icon: TrendingUp,
          title: 'Stabil Değer',
          description: 'Merkez bölge her zaman değerli, fiyat artışı istikrarlı.',
          color: 'purple',
        },
        {
          icon: Heart,
          title: 'Sosyal Yaşam',
          description: 'Çarşı, kafe, restoran gibi sosyal alanlar bol.',
          color: 'red',
        },
      ];
    } else if (hood === 'Çamlık') {
      return [
        {
          icon: Trees,
          title: 'Doğa İçinde',
          description: 'Ağaçlık alan, temiz hava, sakin ve huzurlu yaşam.',
          color: 'green',
        },
        {
          icon: Heart,
          title: 'Aile Yaşamı İçin',
          description: 'Çocuklu aileler için ideal, güvenli ve sakin mahalle.',
          color: 'red',
        },
        {
          icon: TrendingUp,
          title: 'Gelişen Bölge',
          description: 'Yeni projelerle değer kazanıyor, yatırım fırsatı sunuyor.',
          color: 'purple',
        },
        {
          icon: Home,
          title: 'Uygun Fiyatlar',
          description: 'Merkeze göre daha uygun fiyatlarla kaliteli yaşam.',
          color: 'blue',
        },
      ];
    } else if (hood === 'Liman') {
      return [
        {
          icon: Waves,
          title: 'Liman Manzarası',
          description: 'Eşsiz liman ve deniz manzarası, balıkçı tekneleri.',
          color: 'blue',
        },
        {
          icon: Heart,
          title: 'Özgün Karakter',
          description: 'Balıkçı mahallesinin özgün atmosferi, taze deniz ürünleri.',
          color: 'red',
        },
        {
          icon: TrendingUp,
          title: 'Yatırım Potansiyeli',
          description: 'Liman bölgesi canlanıyor, turizm yatırımları artıyor.',
          color: 'green',
        },
        {
          icon: Home,
          title: 'Sakin Yaşam',
          description: 'Kalabalıktan uzak, huzurlu deniz kenarı yaşamı.',
          color: 'purple',
        },
      ];
    }

    return [
      {
        icon: MapPin,
        title: 'İyi Konum',
        description: 'Karasu\'nun gözde bölgelerinden birinde.',
        color: 'blue',
      },
      {
        icon: TrendingUp,
        title: 'Yatırım Değeri',
        description: 'Değer kazanma potansiyeli yüksek.',
        color: 'green',
      },
      {
        icon: Heart,
        title: 'Yaşam Kalitesi',
        description: 'Konforlu ve kaliteli yaşam için ideal.',
        color: 'red',
      },
    ];
  };

  const advantages = getAdvantages(neighborhood);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700';
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
          <h3 className="text-xl font-bold text-gray-900">Konum Avantajları</h3>
          <p className="text-sm text-gray-600">{neighborhood} Mahallesi'nin artıları</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advantages.map((advantage, index) => {
          const Icon = advantage.icon;
          return (
            <div
              key={index}
              className={cn(
                "p-5 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md",
                getColorClasses(advantage.color)
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base mb-1.5">{advantage.title}</h4>
                  <p className="text-sm opacity-90 leading-relaxed">{advantage.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white">
        <p className="text-sm font-semibold mb-2">💡 Yatırım Tavsiyes</p>
        <p className="text-sm leading-relaxed">
          {neighborhood} bölgesinde {propertyType === 'daire' ? 'daire' : propertyType === 'villa' ? 'villa' : propertyType === 'yazlik' ? 'yazlık' : 'gayrimenkul'} almak,
          hem yaşam kalitesi hem de yatırım değeri açısından akıllıca bir tercih. 
          Karasu emlak piyasasında istikrarlı değer artışı gösteriyor.
        </p>
      </div>
    </div>
  );
}

