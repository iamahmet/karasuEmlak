"use client";

import { Shield, Clock, MapPin, TrendingUp, Users, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@karasu/ui";
import Link from "next/link";

export function EnhancedWhyChooseUsSection() {
  const mainFeatures = [
    {
      icon: Shield,
      title: "Güvenilir Hizmet",
      description: "10+ yıllık deneyim ve %100 müşteri memnuniyeti ile güvenilir emlak danışmanlığı",
      stat: "10+",
      statLabel: "Yıl",
      statSubLabel: "Deneyim",
      color: "blue",
      benefits: ["Lisanslı emlak ofisi", "Yasal güvence", "Şeffaf süreçler"],
    },
    {
      icon: MapPin,
      title: "Stratejik Konumlar",
      description: "Denize sıfır, şehir merkezine yakın özel seçenekler ve premium lokasyonlar",
      stat: "500+",
      statLabel: "Aktif",
      statSubLabel: "İlan",
      color: "blue",
      benefits: ["Denize sıfır konumlar", "Merkez bölgeler", "Yatırım potansiyeli"],
    },
    {
      icon: TrendingUp,
      title: "Yatırım Fırsatları",
      description: "Değer kazanan bölgelerde profesyonel yatırım danışmanlığı ve piyasa analizi",
      stat: "%98",
      statLabel: "Memnuniyet",
      statSubLabel: "",
      color: "blue",
      benefits: ["ROI analizi", "Piyasa raporları", "Uzman tavsiyeleri"],
    },
  ];

  const stats = [
    {
      icon: Clock,
      value: "10+",
      label: "Yıllık Deneyim",
      description: "Karasu'da kesintisiz hizmet",
    },
    {
      icon: Users,
      value: "500+",
      label: "Mutlu Müşteri",
      description: "Başarılı işlemler",
    },
    {
      icon: Zap,
      value: "7/24",
      label: "Destek",
      description: "Her zaman yanınızdayız",
    },
    {
      icon: Shield,
      value: "%98",
      label: "Memnuniyet",
      description: "Müşteri memnuniyeti",
    },
  ];

  const trustPoints = [
    "Yerel uzmanlık ve deneyim",
    "Geniş ilan portföyü",
    "Ücretsiz danışmanlık hizmeti",
    "Hızlı ve güvenilir süreçler",
  ];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Neden Bizi Seçmelisiniz?</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu'da Güvenilir Emlak Partneriniz
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu'da emlak alım-satım ve kiralama işlemlerinizde güvenilir partneriniz. Deneyimli ekibimiz ve geniş ilan portföyümüzle hayalinizdeki evi bulmanıza yardımcı oluyoruz.
            </p>
          </div>

          {/* Main Features Grid - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl border border-gray-200 p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300 mb-4">
                      <Icon className="h-8 w-8 text-[#006AFF] stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="mb-5">
                    <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 group-hover:text-[#006AFF] transition-colors duration-300">
                      {feature.stat}
                    </div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      {feature.statLabel} {feature.statSubLabel && <span className="block mt-0.5">{feature.statSubLabel}</span>}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] text-gray-600 leading-[1.7] mb-4">
                    {feature.description}
                  </p>

                  {/* Benefits List */}
                  {feature.benefits && (
                    <ul className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-[#006AFF] flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Trust Points Bar */}
          <div className="bg-gray-50 rounded-xl p-6 lg:p-8 mb-16 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trustPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#006AFF] flex-shrink-0" />
                  <span className="text-[15px] font-medium text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-[#006AFF] to-[#0052CC] rounded-2xl p-8 lg:p-12 text-white shadow-xl overflow-hidden relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

            <div className="max-w-5xl mx-auto relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">
                Güvenilir ve Deneyimli Ekip
              </h3>
              <p className="text-[17px] text-white/90 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
                Karasu emlak piyasasında yıllardır hizmet veren deneyimli ekibimizle yanınızdayız
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="text-center group"
                    >
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm mb-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        <Icon className="h-7 w-7 text-white stroke-[1.5]" />
                      </div>
                      <div className="text-3xl lg:text-4xl font-bold mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm font-semibold text-white/90 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-white/70">
                        {stat.description}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link href="/hakkimizda">
                  <Button
                    size="lg"
                    className="bg-white text-[#006AFF] hover:bg-gray-50 text-[15px] font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Hakkımızda Daha Fazla Bilgi
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
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
