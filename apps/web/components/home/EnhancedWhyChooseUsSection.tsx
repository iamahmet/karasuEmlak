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
    <section className="py-12 lg:py-16 bg-white relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10"></div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100/50 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">NEDEN BİZ?</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight max-w-2xl">
                Karasu'nun En <span className="text-blue-600">Güvenilir</span> Emlak Partneri
              </h2>
            </div>
            <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
              15 yılı aşkın süredir Karasu'da emlak alım-satım ve kiralama işlemlerinizde şeffaf, hızlı ve profesyonel çözümler sunuyoruz.
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-32">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative flex flex-col"
                >
                  <div className="mb-10 relative">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,106,255,0.08)] flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <Icon className="h-10 w-10 stroke-[1.5]" />
                    </div>
                    {/* Glowing background on hover */}
                    <div className="absolute -inset-4 bg-blue-600/5 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  </div>

                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter group-hover:text-blue-600 transition-colors">
                      {feature.stat}
                    </span>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      {feature.statLabel}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                    {feature.description}
                  </p>

                  <ul className="space-y-4 pt-8 border-t border-gray-50 mt-auto">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Premium Stats Banner */}
          <div className="relative rounded-[60px] bg-gray-900 overflow-hidden py-20 px-8 lg:px-20 text-white">
            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 flex-grow">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center lg:text-left space-y-4 group">
                      <div className="flex items-center justify-center lg:justify-start">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="text-5xl font-black tracking-tighter">
                        {stat.value}
                      </div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex-shrink-0">
                <Link href="/hakkimizda">
                  <button className="group relative px-12 py-6 bg-white text-gray-900 rounded-full font-black text-sm tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(0,106,255,0.3)]">
                    <span className="relative z-10 flex items-center gap-3">
                      BİZİ TANIYIN
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
