"use client";

import { Shield, Award, Clock, ThumbsUp, MapPin, TrendingUp, CheckCircle2, Star } from "lucide-react";
import { cn } from "@karasu/lib";

export function CombinedTrustSection() {
  const features = [
    {
      icon: Shield,
      title: "Güvenilir Hizmet",
      description: "15 yıldır Karasu'da kesintisiz hizmet",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Award,
      title: "Yerel Uzmanlık",
      description: "Karasu'nun her mahallesini biliriz",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Clock,
      title: "Hızlı Süreç",
      description: "Dakikalar içinde ilan yayınlayın",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: ThumbsUp,
      title: "Ücretsiz Danışmanlık",
      description: "Profesyonel hizmet tamamen ücretsiz",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const badges = [
    { icon: CheckCircle2, text: "Lisanslı Emlak Ofisi", color: "text-green-600" },
    { icon: Star, text: "500+ Mutlu Müşteri", color: "text-yellow-600" },
    { icon: Award, text: "15 Yıl Deneyim", color: "text-blue-600" },
    { icon: Shield, text: "%98 Memnuniyet", color: "text-purple-600" },
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A862] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-3 text-gray-900 tracking-tight">
              Neden Karasu Emlak?
            </h2>
            <p className="text-[17px] text-gray-600 max-w-2xl mx-auto leading-[1.47] tracking-[-0.022em]">
              Yerel uzmanlık ve güvenilir hizmet anlayışımızla yanınızdayız
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor} mb-4`}>
                    <Icon className={`h-7 w-7 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6 pt-8 border-t border-gray-200">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <Icon className={`h-5 w-5 ${badge.color} stroke-[1.5]`} />
                  <span className="text-sm font-semibold text-gray-700">{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

