"use client";

import Link from "next/link";
import { TrendingUp, MapPin, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";

interface InvestmentOpportunitiesSectionProps {
  basePath?: string;
}

export function InvestmentOpportunitiesSection({ basePath = "" }: InvestmentOpportunitiesSectionProps) {
  const opportunities = [
    {
      title: "Denize Sıfır Yatırım Fırsatları",
      location: "Sahil Mahallesi",
      roi: "12-15%",
      priceRange: "₺800K - ₺2M",
      description: "Yüksek kira getirisi ve değer artış potansiyeli",
      features: ["Yazlık kiralama", "Yatırım değeri", "Deniz manzarası"],
      href: `${basePath}/satilik?deniz_manzarasi=true&tip=villa`,
    },
    {
      title: "Merkez Konumlu Daireler",
      location: "Merkez Mahallesi",
      roi: "8-10%",
      priceRange: "₺350K - ₺600K",
      description: "Yıl boyu kira getirisi ve stabil değer artışı",
      features: ["Yıl boyu kira", "Kolay yönetim", "Merkez konum"],
      href: `${basePath}/satilik?tip=daire&location=merkez`,
    },
    {
      title: "Arsa Yatırım Fırsatları",
      location: "Gelişen Bölgeler",
      roi: "15-20%",
      priceRange: "₺200K - ₺500K",
      description: "Uzun vadeli değer artışı ve inşaat potansiyeli",
      features: ["İmar durumu", "Gelişim potansiyeli", "Uzun vadeli"],
      href: `${basePath}/satilik?tip=arsa`,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Yatırım Fırsatları</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu'da Yatırım Yapın
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Yüksek getiri potansiyeli olan yatırım fırsatları. ROI analizi ve uzman danışmanlık ile bilinçli yatırım yapın.
            </p>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {opportunities.map((opportunity, index) => (
              <Link
                key={index}
                href={opportunity.href}
                className="group block"
              >
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2 h-full">
                  {/* ROI Badge */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      <TrendingUp className="h-4 w-4 text-green-600 stroke-[1.5]" />
                      <span className="text-sm font-bold text-green-700">ROI: {opportunity.roi}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
                    {opportunity.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-[15px] text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 stroke-[1.5]" />
                    <span>{opportunity.location}</span>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-[#006AFF] stroke-[1.5]" />
                      <span className="text-sm font-semibold text-gray-700">Fiyat Aralığı</span>
                    </div>
                    <div className="text-lg font-bold text-[#006AFF]">
                      {opportunity.priceRange}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                    {opportunity.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {opportunity.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#006AFF]"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-gray-200">
                    <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#006AFF] group-hover:gap-3 transition-all duration-200">
                      Fırsatları İncele
                      <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                Yatırım Danışmanlığı Hizmeti
              </h3>
              <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                Profesyonel yatırım danışmanlarımız ROI hesaplama, piyasa analizi ve yatırım stratejisi konularında size yardımcı olur. Ücretsiz danışmanlık hizmetimizden yararlanın.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`${basePath}/yatirim-hesaplayici`}>
                  <Button
                    size="lg"
                    className="bg-[#006AFF] hover:bg-[#0052CC] text-white text-[15px] font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    ROI Hesaplayıcı
                  </Button>
                </Link>
                <Link href={`${basePath}/iletisim`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-[15px] font-semibold px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Danışmanlık Alın
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

