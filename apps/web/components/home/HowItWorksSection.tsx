"use client";

import { Search, FileCheck, Key, CheckCircle2, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      number: "01",
      title: "İlanları Keşfedin",
      description: "Gelişmiş filtreleme ile size en uygun gayrimenkulleri bulun. Fiyat, konum, özellikler ve daha fazlasına göre arayın.",
    },
    {
      icon: FileCheck,
      number: "02",
      title: "Detayları İnceleyin",
      description: "360° tur, video ve fotoğraflarla her detayı görün. Mahalle bilgileri ve yatırım analizleriyle bilinçli karar verin.",
    },
    {
      icon: Key,
      number: "03",
      title: "Randevu Alın",
      description: "İletişim formu, WhatsApp veya telefon ile hemen iletişime geçin. Profesyonel ekibimiz size yardımcı olacak.",
    },
    {
      icon: CheckCircle2,
      number: "04",
      title: "Anlaşmayı Tamamlayın",
      description: "Yasal süreçlerde yanınızdayız. Sözleşmeden teslimata kadar her adımda profesyonel destek.",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Nasıl Çalışır?</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Hayalinizdeki Eve 4 Adımda Ulaşın
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Basit ve şeffaf sürecimizle emlak alım-satım ve kiralama işlemlerinizi kolaylaştırıyoruz
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  {/* Step Number */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300 mb-4">
                      <span className="text-2xl font-bold text-[#006AFF]">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-5">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                      <Icon className="h-7 w-7 text-[#006AFF] stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-gray-600 leading-[1.7]">
                    {step.description}
                  </p>

                  {/* Arrow (Desktop only, between steps) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-gray-300 stroke-[1.5]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Stats */}
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { value: "1000+", label: "Mutlu Müşteri" },
                { value: "%98", label: "Müşteri Memnuniyeti" },
                { value: "15", label: "Yıllık Deneyim" },
                { value: "7/24", label: "WhatsApp Destek" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
