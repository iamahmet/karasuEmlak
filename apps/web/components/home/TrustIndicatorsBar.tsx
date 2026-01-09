"use client";

import { Shield, Award, CheckCircle2, Lock, Star, Users } from "lucide-react";

export function TrustIndicatorsBar() {
  const indicators = [
    {
      icon: Shield,
      text: "Lisanslı Emlak Ofisi",
      color: "text-blue-600",
    },
    {
      icon: Award,
      text: "15 Yıllık Deneyim",
      color: "text-green-600",
    },
    {
      icon: CheckCircle2,
      text: "%98 Müşteri Memnuniyeti",
      color: "text-purple-600",
    },
    {
      icon: Lock,
      text: "Güvenli İşlemler",
      color: "text-orange-600",
    },
    {
      icon: Star,
      text: "4.9/5.0 Puan",
      color: "text-yellow-600",
    },
    {
      icon: Users,
      text: "1000+ Mutlu Müşteri",
      color: "text-red-600",
    },
  ];

  return (
    <section className="py-8 lg:py-12 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {indicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 mb-3 ${indicator.color}`}>
                    <Icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700 leading-tight">
                    {indicator.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

