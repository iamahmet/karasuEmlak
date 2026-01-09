"use client";

import Link from "next/link";
import { Sun, Waves, Home, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";

interface SummerPropertyMarketSectionProps {
  basePath?: string;
}

export function SummerPropertyMarketSection({ basePath = "" }: SummerPropertyMarketSectionProps) {
  const features = [
    {
      icon: Sun,
      title: "Yazlık Emlak Piyasası",
      description: "Karasu yazlık emlak piyasası, İstanbul'a yakınlığı ve 20 kilometrelik kumsalı ile öne çıkmaktadır. Yazlık evler, denize sıfır villalar ve yazlık daireler, özellikle İstanbul'dan gelen yatırımcılar ve tatilciler için cazip seçenekler sunmaktadır.",
      color: "orange",
    },
    {
      icon: Waves,
      title: "Yüksek Kira Geliri",
      description: "Yaz aylarında yüksek kira geliri potansiyeli, yazlık emlak yatırımlarını cazip kılmaktadır. Denize yakın konumlar, plaj erişimi ve sosyal alanlar yazlık emlak değerini artırmaktadır.",
      color: "blue",
    },
    {
      icon: Home,
      title: "Yatırım Fırsatları",
      description: "Yazlık emlak yatırımı yapmak isteyenler için Karasu, hem kullanım hem de kira geliri açısından değerli fırsatlar sunmaktadır. Yaz aylarında yüksek kira geliri potansiyeli mevcuttur.",
      color: "green",
    },
  ];

  const locations = [
    { name: "Sahil Mahallesi", distance: "Denize Sıfır", price: "₺680.000 - ₺1.500.000" },
    { name: "Yalı Mahallesi", distance: "Denize Yakın", price: "₺550.000 - ₺1.200.000" },
    { name: "Bota Mahallesi", distance: "Doğal Güzellikler", price: "₺600.000 - ₺1.300.000" },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-orange-50/30 via-white to-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-orange-600 text-sm font-bold uppercase tracking-wider">Yazlık Emlak</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Yazlık Emlak Piyasası
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu yazlık emlak piyasası, İstanbul'a yakınlığı ve 20 kilometrelik kumsalı ile öne çıkmaktadır. 
              Yazlık evler, denize sıfır villalar ve yazlık daireler, özellikle İstanbul'dan gelen yatırımcılar ve tatilciler için cazip seçenekler sunmaktadır.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                orange: "bg-orange-50 text-orange-600",
                blue: "bg-blue-50 text-blue-600",
                green: "bg-green-50 text-green-600",
              };
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} mb-4`}>
                    <Icon className="h-7 w-7 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Popular Locations */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 lg:p-10 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[#006AFF]" />
              Popüler Yazlık Konumları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-[#006AFF]/40 transition-all duration-300"
                >
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{location.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{location.distance}</p>
                  <div className="text-base font-bold text-[#006AFF]">{location.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Info */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:24px_24px]" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Yazlık Emlak Yatırımı
              </h3>
              <p className="text-[17px] text-white/90 mb-6 leading-relaxed">
                Yazlık emlak yatırımı yapmak isteyenler için Karasu, hem kullanım hem de kira geliri açısından değerli fırsatlar sunmaktadır. 
                Yaz aylarında yüksek kira geliri potansiyeli, yazlık emlak yatırımlarını cazip kılmaktadır.
              </p>
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 font-semibold"
                asChild
              >
                <Link href={`${basePath}/satilik?tip=yazlik`}>
                  Yazlık İlanları Görüntüle
                  <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
