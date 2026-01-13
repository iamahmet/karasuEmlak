"use client";

import Link from "next/link";
import { Phone, MessageCircle, Mail, Plus, Search, Calculator, TrendingUp, ArrowRight } from "lucide-react";
import { napData } from "@karasu-emlak/config/nap";

interface CTASectionProps {
  basePath?: string;
}

export function CTASection({ basePath = "" }: CTASectionProps) {
  const contactMethods = [
    {
      icon: Phone,
      title: "Telefon ile Ulaşın",
      description: "Hafta içi 09:00 - 18:00",
      action: "Hemen Ara",
      href: `tel:${napData.contact.phone}`,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Destek",
      description: "7/24 hızlı yanıt",
      action: "Mesaj Gönder",
      href: `https://wa.me/${napData.contact.whatsapp.replace(/[^0-9]/g, '')}`,
      external: true,
    },
    {
      icon: Mail,
      title: "E-posta Gönderin",
      description: "Detaylı bilgi için",
      action: "E-posta Gönder",
      href: "mailto:info@karasuemlak.net",
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      title: "Ücretsiz İlan Verin",
      description: "Dakikalar içinde yayınlayın",
      href: `${basePath}/ilan-ekle`,
    },
    {
      icon: Search,
      title: "Gelişmiş Arama",
      description: "Filtreleri kullanarak arayın",
      href: `${basePath}/arama`,
    },
    {
      icon: Calculator,
      title: "Kredi Hesaplayıcı",
      description: "Aylık ödemenizi hesaplayın",
      href: `${basePath}/kredi-hesaplayici`,
    },
    {
      icon: TrendingUp,
      title: "Yatırım Analizi",
      description: "ROI hesaplaması yapın",
      href: `${basePath}/yatirim-hesaplayici`,
    },
  ];

  return (
    <>
      {/* Contact CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#006AFF] to-[#0052CC] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6 tracking-tight">
                Hayalinizdeki Evi Birlikte Bulalım
              </h2>
              <p className="text-[17px] md:text-[19px] text-white/90 max-w-3xl mx-auto leading-[1.7]">
                15 yıllık deneyimimiz ve yerel uzmanlığımızla size en uygun gayrimenkulü bulmak için buradayız
              </p>
            </div>

            {/* Contact Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <a
                    key={index}
                    href={method.href}
                    target={method.external ? "_blank" : undefined}
                    rel={method.external ? "noopener noreferrer" : undefined}
                    className="group bg-white rounded-xl border border-white/20 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300 mb-4">
                      <Icon className="h-7 w-7 text-[#006AFF] stroke-[1.5]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                      {method.title}
                    </h3>
                    <p className="text-[15px] text-gray-600 mb-4">
                      {method.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#006AFF] group-hover:gap-3 transition-all duration-200">
                      {method.action}
                      <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4 tracking-tight">
                Hızlı Erişim
              </h2>
              <p className="text-[17px] text-gray-600">
                Size özel araçlar ve hizmetler
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="group block"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 mb-4">
                        <Icon className="h-6 w-6 text-[#006AFF] stroke-[1.5]" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
                        {action.title}
                      </h3>
                      <p className="text-[15px] text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
