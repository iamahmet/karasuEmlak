"use client";

import Link from "next/link";
import { Home, Building2, TreePine, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";

interface PropertyTypeShowcaseProps {
  basePath?: string;
}

export function PropertyTypeShowcase({ basePath = "" }: PropertyTypeShowcaseProps) {
  const propertyTypes = [
    {
      icon: Building2,
      title: "Daire",
      description: "Merkez konumlarda modern daireler",
      count: "250+",
      avgPrice: "₺450.000",
      href: `${basePath}/satilik?tip=daire`,
      color: "blue",
      features: ["2+1", "3+1", "4+1", "Dubleks"],
    },
    {
      icon: Home,
      title: "Villa",
      description: "Denize sıfır lüks villalar",
      count: "120+",
      avgPrice: "₺1.200.000",
      href: `${basePath}/satilik?tip=villa`,
      color: "green",
      features: ["Bahçeli", "Havuzlu", "Deniz Manzaralı", "Lüks"],
    },
    {
      icon: TreePine,
      title: "Yazlık",
      description: "Yazlık ve tatil evleri",
      count: "80+",
      avgPrice: "₺680.000",
      href: `${basePath}/satilik?tip=yazlik`,
      color: "orange",
      features: ["Denize Yakın", "Bahçeli", "Tatil", "Yatırım"],
    },
    {
      icon: MapPin,
      title: "Arsa",
      description: "Yatırım ve inşaat arsaları",
      count: "50+",
      avgPrice: "₺350.000",
      href: `${basePath}/satilik?tip=arsa`,
      color: "purple",
      features: ["İmar Durumu", "Yatırım", "İnşaat", "Tarla"],
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Gayrimenkul Türleri</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Size Uygun Gayrimenkulü Bulun
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Her ihtiyaca uygun gayrimenkul seçenekleri. Daire, villa, yazlık ve arsa kategorilerinde geniş portföyümüzle hizmetinizdeyiz.
            </p>
          </div>

          {/* Property Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
            {propertyTypes.map((type, index) => {
              const Icon = type.icon;
              const colorClasses = {
                blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
                green: "bg-green-50 text-green-600 hover:bg-green-100",
                orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
                purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
              };

              return (
                <Link
                  key={index}
                  href={type.href}
                  className="group block"
                >
                  <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2 h-full">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${colorClasses[type.color as keyof typeof colorClasses]} transition-colors duration-300 mb-4`}>
                        <Icon className="h-8 w-8 stroke-[1.5]" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
                      {type.title}
                    </h3>
                    <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                      {type.description}
                    </p>

                    {/* Stats */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Aktif İlan</span>
                        <span className="text-lg font-bold text-gray-900">{type.count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ort. Fiyat</span>
                        <span className="text-lg font-bold text-[#006AFF]">{type.avgPrice}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {type.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#006AFF]"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-4 border-t border-gray-200">
                      <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#006AFF] group-hover:gap-3 transition-all duration-200">
                        İlanları Görüntüle
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 hover:border-[#006AFF] hover:bg-blue-50 text-gray-700 hover:text-[#006AFF] px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href={`${basePath}/satilik`}>
                Tüm Gayrimenkul Türlerini Keşfet
                <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

