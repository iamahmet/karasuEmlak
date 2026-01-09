"use client";

import { Shield, Award, Clock, ThumbsUp, MapPin, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { cn } from "@karasu/lib";

export function WhyChooseUsSection() {
  const features = [
    {
      icon: Shield,
      title: "Güvenilir Hizmet",
      description: "15 yıldır Karasu'da kesintisiz hizmet sunuyoruz. Lisanslı emlak ofisi güvencesiyle",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Award,
      title: "Yerel Uzmanlık",
      description: "Karasu'nun her mahallesini biliriz. Yerel piyasa bilgisiyle en iyi fırsatları sunuyoruz",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Clock,
      title: "Hızlı Süreç",
      description: "Dakikalar içinde ilan yayınlayın. Aynı gün içinde potansiyel alıcılarla buluşun",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: ThumbsUp,
      title: "Ücretsiz Danışmanlık",
      description: "Profesyonel emlak danışmanlığı hizmeti tamamen ücretsiz. Uzman ekibimiz her zaman yanınızda",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: MapPin,
      title: "Geniş Portföy",
      description: "Merkez'den sahile, her bütçeye uygun seçenekler. 500+ aktif ilanımızla herkese ulaşıyoruz",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: TrendingUp,
      title: "Yatırım Danışmanlığı",
      description: "ROI hesaplama, piyasa analizi ve yatırım tavsiyeleri. Bilinçli yatırım yapın",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const stats = [
    { value: "1000+", label: "Mutlu Müşteri" },
    { value: "%98", label: "Müşteri Memnuniyeti" },
    { value: "15", label: "Yıllık Deneyim" },
    { value: "7/24", label: "WhatsApp Destek" },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
            <CheckCircle2 className="h-4 w-4 text-blue-600 stroke-[2]" />
            <span className="text-[13px] font-bold text-blue-700 uppercase tracking-wider">
              Neden Biz?
            </span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-display font-bold mb-4 text-gray-900 leading-[1.1] tracking-[-0.025em]">
            Karasu Emlak Farkı
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-600 leading-[1.6] tracking-[-0.014em]">
            15 yıldır Karasu'da emlak sektörünün öncü firmalarından biri olarak hizmet veriyoruz
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-8 bg-white rounded-2xl",
                "border-2 border-gray-200",
                "transition-all duration-300",
                "hover:border-[#006AFF]/30 hover:shadow-xl hover:-translate-y-2",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "inline-flex p-4 rounded-xl mb-5",
                "transition-all duration-300 group-hover:scale-110",
                feature.bgColor
              )}>
                <feature.icon className={cn(
                  "h-8 w-8 stroke-[2]",
                  `bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`
                )} style={{ WebkitTextFillColor: 'transparent' }} />
              </div>

              {/* Content */}
              <h3 className="text-[20px] font-display font-bold text-gray-900 mb-3 tracking-[-0.02em] group-hover:text-[#006AFF] transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-[15px] text-gray-600 leading-relaxed tracking-[-0.011em]">
                {feature.description}
              </p>

              {/* Decorative Gradient */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0",
                "transition-opacity duration-300 group-hover:opacity-10",
                `bg-gradient-to-br ${feature.color}`
              )} />
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-[#006AFF] to-[#0052CC] rounded-2xl p-8 lg:p-12 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "text-center",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-[42px] lg:text-[52px] font-display font-bold text-white leading-none mb-2 tracking-[-0.025em]">
                  {stat.value}
                </div>
                <div className="text-[15px] text-white/80 font-medium tracking-[-0.011em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

