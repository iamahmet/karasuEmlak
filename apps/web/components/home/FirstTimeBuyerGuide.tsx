"use client";

import Link from "next/link";
import { CheckCircle, Home, Calculator, FileText, Shield, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";

interface FirstTimeBuyerGuideProps {
  basePath?: string;
}

export function FirstTimeBuyerGuide({ basePath = "" }: FirstTimeBuyerGuideProps) {
  const steps = [
    {
      icon: Calculator,
      title: "Bütçe Belirleme",
      description: "Karasu'da ilk kez emlak almak isteyenler için, bütçe belirleme, konum seçimi, kredi imkanları ve yasal süreçler konularında kapsamlı rehberlik sağlıyoruz.",
      color: "blue",
    },
    {
      icon: Home,
      title: "Konum Seçimi",
      description: "Karasu'da satılık daire veya satılık ev arayanlar için, öncelikle bütçe ve ihtiyaçların belirlenmesi önemlidir. Sonrasında, konum tercihleri, oda sayısı ve özellikler gibi kriterler göz önünde bulundurularak en uygun seçenekler belirlenir.",
      color: "green",
    },
    {
      icon: FileText,
      title: "Yasal Süreçler",
      description: "Karasu emlak ofisi olarak, ilk kez emlak alanların tüm sorularını yanıtlıyor ve süreç boyunca yanlarında oluyoruz. Yasal işlemler, tapu transferi ve gerekli belgeler konularında destek sağlıyoruz.",
      color: "orange",
    },
    {
      icon: Shield,
      title: "Güvenli İşlem",
      description: "Tüm işlemlerimiz güvenli ve şeffaf bir şekilde yürütülmektedir. Müşterilerimizin güvenliği ve memnuniyeti bizim önceliğimizdir.",
      color: "purple",
    },
  ];

  const tips = [
    "Bütçenizi belirleyin ve kredi imkanlarını araştırın",
    "Konum tercihlerinizi netleştirin (merkez, sahil, mahalle)",
    "Oda sayısı ve özellikler konusunda ihtiyaçlarınızı belirleyin",
    "Emlak danışmanımızdan profesyonel destek alın",
    "Yasal süreçler hakkında bilgi edinin",
    "Tapu ve belgeleri kontrol edin",
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              İlk Kez Emlak Alanlar İçin
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu'da ilk kez emlak almak isteyenler için, bütçe belirleme, konum seçimi, kredi imkanları ve yasal süreçler konularında kapsamlı rehberlik sağlıyoruz.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                blue: "bg-blue-50 text-blue-600",
                green: "bg-green-50 text-green-600",
                orange: "bg-orange-50 text-orange-600",
                purple: "bg-purple-50 text-purple-600",
              };
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl ${colorClasses[step.color as keyof typeof colorClasses]} flex-shrink-0`}>
                      <Icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Adım {index + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-[15px] text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips Section */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 lg:p-10 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              İlk Kez Emlak Alırken Dikkat Edilmesi Gerekenler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[15px] text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-[#006AFF] hover:bg-[#0052CC] text-white px-8 py-6 text-[15px] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href={`${basePath}/rehber/emlak-alim-satim`}>
                Detaylı Rehberi Görüntüle
                <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
