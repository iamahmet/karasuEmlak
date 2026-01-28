"use client";

import Link from "next/link";
import { ArrowRight, Home, Building2, MapPin, FileText } from "lucide-react";

interface HomepageInternalLinksProps {
  basePath?: string;
}

/**
 * SEO-Optimized Internal Links Section for Homepage
 * High-priority cornerstone and hub pages with keyword-rich anchor texts
 */
export function HomepageInternalLinks({ basePath = "" }: HomepageInternalLinksProps) {
  const cornerstoneLinks = [
    {
      href: `${basePath}/satilik-daire`,
      anchor: 'Satılık daire',
      title: 'Satılık Daire',
      description: 'Satılık daire ilanları ve fiyatları',
      icon: Home,
      priority: 'high' as const,
    },
    {
      href: `${basePath}/kiralik-daire`,
      anchor: 'Kiralık daire',
      title: 'Kiralık Daire',
      description: 'Kiralık daire ilanları ve kira fiyatları',
      icon: Home,
      priority: 'high' as const,
    },
    {
      href: `${basePath}/karasu-satilik-daire`,
      anchor: 'Karasu satılık daire',
      title: 'Karasu Satılık Daire',
      description: 'Karasu\'da satılık daire ilanları ve fiyatları',
      icon: Home,
      priority: 'high' as const,
    },
    {
      href: `${basePath}/karasu-satilik-villa`,
      anchor: 'Karasu satılık villa',
      title: 'Karasu Satılık Villa',
      description: 'Karasu\'da satılık villa ilanları',
      icon: Building2,
      priority: 'high' as const,
    },
    {
      href: `${basePath}/karasu-satilik-yazlik`,
      anchor: 'Karasu satılık yazlık',
      title: 'Karasu Satılık Yazlık',
      description: 'Karasu\'da satılık yazlık evler',
      icon: Home,
      priority: 'high' as const,
    },
    {
      href: `${basePath}/karasu-kiralik-daire`,
      anchor: 'Karasu kiralık daire',
      title: 'Karasu Kiralık Daire',
      description: 'Karasu\'da kiralık daire ilanları',
      icon: Building2,
      priority: 'high' as const,
    },
    {
      href: `${basePath}/karasu-merkez-satilik-ev`,
      anchor: 'Karasu merkez satılık ev',
      title: 'Karasu Merkez Satılık Ev',
      description: 'Karasu merkez bölgede satılık evler',
      icon: MapPin,
      priority: 'high' as const,
    },
    {
      href: `${basePath}/karasu-denize-yakin-satilik-ev`,
      anchor: 'Karasu denize sıfır satılık ev',
      title: 'Karasu Denize Sıfır Satılık Ev',
      description: 'Karasu\'da denize yakın satılık evler',
      icon: MapPin,
      priority: 'high' as const,
    },
  ];

  const hubLinks = [
    {
      href: `${basePath}/karasu-satilik-ev`,
      anchor: 'Karasu satılık ev ilanları',
      title: 'Karasu Satılık Ev',
      description: 'Karasu\'da tüm satılık ev ilanları',
      icon: Home,
    },
    {
      href: `${basePath}/kocaali-satilik-ev`,
      anchor: 'Kocaali satılık ev ilanları',
      title: 'Kocaali Satılık Ev',
      description: 'Kocaali\'de satılık ev ilanları',
      icon: Building2,
    },
    {
      href: `${basePath}/blog`,
      anchor: 'emlak rehberi ve blog',
      title: 'Emlak Rehberi',
      description: 'Emlak alım-satım rehberleri ve ipuçları',
      icon: FileText,
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 text-gray-900">
              Popüler Emlak Sayfaları
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Karasu ve Kocaali'de satılık, kiralık emlak ilanları ve rehberler
            </p>
          </div>

          {/* Cornerstone Links */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Öne Çıkan Sayfalar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cornerstoneLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="group bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                        <Icon className="h-6 w-6 text-[#006AFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-[#006AFF] transition-colors line-clamp-2">
                          {link.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {link.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm text-[#006AFF] font-medium">
                          İncele
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Hub Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ana Kategoriler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hubLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300 text-center"
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                      <Icon className="h-8 w-8 text-[#006AFF]" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#006AFF] transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {link.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-[#006AFF] font-medium">
                      Tümünü Gör
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
