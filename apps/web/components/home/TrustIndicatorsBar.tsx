import { Shield, Award, CheckCircle2, Lock, Star, Users } from "lucide-react";

import { cn } from "@karasu/lib";

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
      text: "4.9/5.0 Puan Verildi",
      color: "text-yellow-600",
    },
    {
      icon: Users,
      text: "1000+ Mutlu Müşteri",
      color: "text-red-600",
    },
  ];

  return (

    <section className="py-8 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Indicators Row */}
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 lg:gap-x-16">
            {indicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div
                  key={index}
                  className="group flex items-center gap-4 transition-all duration-300"
                >
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-blue-50 transition-colors duration-500",
                    indicator.color.replace('text', 'bg').replace('600', '500') + '/5'
                  )}>
                    <Icon className={cn("h-6 w-6 stroke-[1.5]", indicator.color)} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors">
                      {indicator.text.split(' ')[0]} {indicator.text.split(' ')[1]}
                    </span>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none">
                      {indicator.text.split(' ').slice(2).join(' ') || 'GÜVENİLİR'}
                    </span>
                  </div>

                  {/* Subtle Divider */}
                  {index < indicators.length - 1 && (
                    <div className="hidden lg:block h-8 w-[1px] bg-gray-100 ml-12 lg:ml-16"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
