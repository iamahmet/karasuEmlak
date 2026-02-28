import Link from "next/link";
import { FileText, Calculator, TrendingUp, Shield, Users, Award, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";

import { cn } from "@karasu/lib";

interface ServicesSectionProps {
  basePath?: string;
}

export function ServicesSection({ basePath = "" }: ServicesSectionProps) {
  const services = [
    {
      icon: FileText,
      title: "Emlak Danışmanlığı",
      description: "Karasu'da emlak almak veya satmak isteyenler için uzman emlak danışmanlarımız, piyasa analizi, fiyat değerlemesi ve en uygun seçenekleri bulma konularında destek sağlamaktadır.",
      color: "blue",
    },
    {
      icon: Calculator,
      title: "Değerleme Hizmetleri",
      description: "Karasu emlak değerleme hizmetimiz ile, gayrimenkulünüzün piyasa değerini objektif kriterlere göre belirliyoruz. Konum, metrekare, özellikler ve piyasa koşulları dikkate alınarak yapılan değerleme.",
      color: "green",
    },
    {
      icon: TrendingUp,
      title: "Yatırım Danışmanlığı",
      description: "Karasu emlak yatırım danışmanlığı hizmetimiz, yatırımcılara piyasa trendleri, yatırım fırsatları ve risk analizi konularında uzman görüş sunmaktadır.",
      color: "orange",
    },
    {
      icon: Shield,
      title: "Güvenilir İşlem",
      description: "15+ yıllık deneyimimiz ile güvenilir emlak işlemleri. Tüm süreçlerde yanınızdayız ve güvenli işlem garantisi sunuyoruz.",
      color: "purple",
    },
  ];

  const stats = [
    { icon: Users, value: "500+", label: "Mutlu Müşteri", color: "text-blue-600" },
    { icon: Award, value: "15+", label: "Yıl Deneyim", color: "text-green-600" },
    { icon: Shield, value: "%98", label: "Memnuniyet", color: "text-orange-600" },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    green: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  };

  return (

    <section className="py-12 lg:py-16 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-50/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight max-w-4xl mx-auto">
              Gayrimenkulde Uzman <span className="text-blue-600">Danışmanlık</span> Hizmetleri
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed">
              15 yılı aşkın tecrübemizle Karasu'da güvenilir, profesyonel ve sonuç odaklı gayrimenkul çözümleri sunuyoruz.
            </p>
          </div>

          {/* Services Grid - Premium Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-[40px] p-10 border border-gray-100 hover:shadow-[0_40px_100px_rgba(0,106,255,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col sm:flex-row gap-8 items-start"
                >
                  <div className={cn(
                    "w-20 h-20 rounded-[28px] flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110",
                    colorClasses[service.color as keyof typeof colorClasses].split(' ')[0], // bg class
                    colorClasses[service.color as keyof typeof colorClasses].split(' ')[1]  // text class
                  )}>
                    <Icon className="h-10 w-10 stroke-[1.5]" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 font-medium leading-[1.7] text-[15px]">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats - Minimalist & Bold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 border-y border-gray-100 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-4 group">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600/10", stat.color.replace('text', 'bg').replace('600', '100'))}>
                    <Icon className={cn("h-6 w-6 stroke-[1.5]", stat.color)} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-5xl font-black text-gray-900 tracking-[-0.03em]">
                      {stat.value}
                    </div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA - Premium Pill */}
          <div className="flex justify-center">
            <Link
              href={`${basePath}/iletisim`}
              className="group relative bg-gray-900 hover:bg-black text-white px-12 py-5 rounded-full text-sm font-bold tracking-tight shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center gap-3">
                ÜCRETSİZ DANIŞMANLIK ALIN
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
