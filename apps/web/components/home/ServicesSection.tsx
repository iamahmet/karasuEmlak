import Link from "next/link";
import { FileText, Calculator, TrendingUp, Shield, Users, Award, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";

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
    green: "bg-green-50 text-green-600 hover:bg-green-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu Emlak Ofisi ve Hizmetlerimiz
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu emlak ofisi olarak, bölgedeki gayrimenkul piyasasında 15+ yıllık deneyimimiz ile müşterilerimize kapsamlı hizmetler sunuyoruz. 
              Karasu emlak danışmanlığı hizmetimiz, satılık ve kiralık gayrimenkul arayanlar için profesyonel rehberlik sağlamaktadır.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl ${colorClasses[service.color as keyof typeof colorClasses]} transition-colors duration-300 flex-shrink-0`}>
                      <Icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-[15px] text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-6 text-center hover:shadow-lg transition-all duration-300"
                >
                  <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-3 stroke-[1.5]`} />
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-[#006AFF] hover:bg-[#0052CC] text-white px-8 py-6 text-[15px] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href={`${basePath}/iletisim`}>
                Hizmetlerimiz Hakkında Daha Fazla Bilgi
                <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
