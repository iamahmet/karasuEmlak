"use client";

import Link from "next/link";
import { TrendingUp, BarChart3, DollarSign, Target, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@karasu/ui";

interface InvestorsGuideSectionProps {
  basePath?: string;
}

export function InvestorsGuideSection({ basePath = "" }: InvestorsGuideSectionProps) {
  const strategies = [
    {
      icon: TrendingUp,
      title: "Kısa Vadeli Yatırım",
      description: "Yazlık kiralama ve sezonluk gelir odaklı yatırım stratejisi. Yüksek kira getirisi ve hızlı geri dönüş.",
      roi: "12-18%",
      timeframe: "1-3 Yıl",
      color: "blue",
    },
    {
      icon: BarChart3,
      title: "Uzun Vadeli Yatırım",
      description: "Değer artışı ve kira geliri kombinasyonu. Karasu'nun gelişen yapısı ile uzun vadeli değer artışı.",
      roi: "8-12%",
      timeframe: "5+ Yıl",
      color: "green",
    },
    {
      icon: Target,
      title: "Portföy Çeşitlendirme",
      description: "Farklı mahallelerde ve farklı türlerde gayrimenkul yatırımı ile risk dağıtımı ve gelir çeşitlendirmesi.",
      roi: "10-15%",
      timeframe: "3-5 Yıl",
      color: "orange",
    },
  ];

  const factors = [
    "Konum analizi ve gelişim potansiyeli",
    "Kira geliri hesaplama ve ROI analizi",
    "Piyasa trendleri ve fiyat tahminleri",
    "Yasal süreçler ve vergi avantajları",
    "Risk analizi ve yatırım stratejisi",
    "Portföy yönetimi ve danışmanlık",
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Yatırımcılar İçin</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu Emlak Yatırım Fırsatları
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu emlak yatırım fırsatları, hem kısa vadeli hem de uzun vadeli yatırımcılar için değerli seçenekler sunmaktadır. 
              Denize yakın konumlar, yazlık evler ve gelişmekte olan bölgeler, farklı yatırım stratejilerine uygun seçenekler içermektedir.
            </p>
          </div>

          {/* Investment Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {strategies.map((strategy, index) => {
              const Icon = strategy.icon;
              const colorClasses = {
                blue: "bg-blue-50 text-blue-600 border-blue-200",
                green: "bg-green-50 text-green-600 border-green-200",
                orange: "bg-orange-50 text-orange-600 border-orange-200",
              };
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${colorClasses[strategy.color as keyof typeof colorClasses]} border-2 mb-4`}>
                    <Icon className="h-7 w-7 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                    {strategy.title}
                  </h3>
                  <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                    {strategy.description}
                  </p>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Beklenen ROI</span>
                      <span className="text-lg font-bold text-[#006AFF]">{strategy.roi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Yatırım Süresi</span>
                      <span className="text-lg font-bold text-gray-900">{strategy.timeframe}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Investment Factors */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-8 lg:p-10 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-[#006AFF]" />
              Yatırım Değerlendirme Faktörleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[15px] text-gray-700 leading-relaxed">{factor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#006AFF] to-[#0052CC] rounded-2xl p-8 lg:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:24px_24px]" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Yatırım Danışmanlığı Hizmeti
              </h3>
              <p className="text-[17px] text-white/90 mb-6 leading-relaxed">
                Karasu emlak yatırım danışmanlığı hizmetimiz ile, yatırımcılara piyasa analizi, kira geliri potansiyeli ve değer artış beklentileri konularında detaylı bilgilendirme yapıyoruz.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-[#006AFF] hover:bg-gray-100 px-8 py-6 font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/yatirim-hesaplayici`}>
                    ROI Hesaplayıcı
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/iletisim`}>
                    Danışmanlık Alın
                    <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
