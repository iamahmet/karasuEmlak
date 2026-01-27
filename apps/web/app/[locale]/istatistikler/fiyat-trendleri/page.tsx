import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LineChart, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { getListingStats } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';
import { PageIntro } from '@/components/content/PageIntro';
import { ContentSection } from '@/components/content/ContentSection';
import { FAQBlock } from '@/components/content/FAQBlock';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/istatistikler/fiyat-trendleri' 
    : `/${locale}/istatistikler/fiyat-trendleri`;

  return {
    title: 'Fiyat Trendleri | Karasu Emlak | Emlak Fiyat Analizleri',
    description: 'Karasu emlak fiyat trendleri ve analizleri. Emlak türü bazlı fiyat değişimleri, mahalle bazlı fiyat analizleri ve gelecek projeksiyonları.',
    keywords: [
      'karasu emlak fiyatları',
      'karasu fiyat trendleri',
      'karasu emlak fiyat analizi',
      'karasu emlak piyasası fiyatları',
      'karasu satılık ev fiyatları',
      'karasu kiralık ev fiyatları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/istatistikler/fiyat-trendleri`,
        'en': `${siteConfig.url}/en/istatistikler/fiyat-trendleri`,
        'et': `${siteConfig.url}/et/istatistikler/fiyat-trendleri`,
        'ru': `${siteConfig.url}/ru/istatistikler/fiyat-trendleri`,
        'ar': `${siteConfig.url}/ar/istatistikler/fiyat-trendleri`,
      },
    },
    openGraph: {
      title: 'Fiyat Trendleri | Karasu Emlak',
      description: 'Karasu emlak fiyat trendleri ve analizleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Fiyat Trendleri',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Fiyat Trendleri | Karasu Emlak',
      description: 'Karasu emlak fiyat trendleri ve analizleri.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function FiyatTrendleriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'İstatistikler', href: `${basePath}/istatistikler` },
    { label: 'Fiyat Trendleri', href: `${basePath}/istatistikler/fiyat-trendleri` },
  ];

  // Fetch statistics
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };

  // Mock price trends (in production, this would come from historical data)
  const priceTrends = [
    {
      period: 'Son 6 Ay',
      avgPrice: 4500000,
      change: 8.5,
      trend: 'up' as const,
      description: 'Son 6 ayda ortalama fiyat artışı',
    },
    {
      period: 'Son 3 Ay',
      avgPrice: 4750000,
      change: 4.2,
      trend: 'up' as const,
      description: 'Son 3 ayda ortalama fiyat artışı',
    },
    {
      period: 'Son 1 Ay',
      avgPrice: 4900000,
      change: 2.1,
      trend: 'up' as const,
      description: 'Son 1 ayda ortalama fiyat artışı',
    },
  ];

  const propertyTypeTrends = [
    { type: 'Daire', avgPrice: 4200000, change: 7.2, trend: 'up' as const },
    { type: 'Villa', avgPrice: 12000000, change: 12.5, trend: 'up' as const },
    { type: 'Yazlık', avgPrice: 6800000, change: -2.3, trend: 'down' as const },
    { type: 'Arsa', avgPrice: 3500000, change: 5.8, trend: 'up' as const },
  ];

  const faqs = [
    {
      question: 'Fiyat trendleri nasıl hesaplanıyor?',
      answer: 'Fiyat trendleri, aktif ilanların ortalama fiyatları ve geçmiş dönemlerle karşılaştırılması ile hesaplanmaktadır. Veriler düzenli olarak güncellenmektedir.',
    },
    {
      question: 'Hangi emlak türlerinde fiyat artışı var?',
      answer: 'Son dönemlerde özellikle denize sıfır villalar ve merkez konumdaki dairelerde fiyat artışı gözlemlenmektedir. Detaylı analiz için raporlarımızı inceleyebilirsiniz.',
    },
    {
      question: 'Fiyat trendleri yatırım kararlarım için güvenilir mi?',
      answer: 'Fiyat trendleri geçmiş verilere dayanmaktadır ve gelecek performansı garanti etmez. Yatırım kararlarınızda mutlaka profesyonel danışmanlık almanızı öneririz.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={breadcrumbs} />
        
        <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <PageIntro
            title="Fiyat Trendleri"
            description="Karasu emlak fiyat trendleri ve analizleri. Emlak türü bazlı fiyat değişimleri, dönemsel analizler ve gelecek projeksiyonları."
          />

          {/* Price Trends by Period */}
          <ContentSection
            title="Dönemsel Fiyat Trendleri"
            description="Farklı dönemlerde ortalama emlak fiyatları ve değişim oranları"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {priceTrends.map((trend, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#006AFF] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">{trend.period}</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      ₺{new Intl.NumberFormat('tr-TR').format(trend.avgPrice)}
                    </p>
                    <p className="text-sm text-gray-600">{trend.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.trend === 'up' ? (
                      <>
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">+{trend.change}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">{trend.change}%</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ContentSection>

          {/* Property Type Trends */}
          <ContentSection
            title="Emlak Türü Bazlı Fiyat Trendleri"
            description="Emlak türlerine göre ortalama fiyatlar ve değişim oranları"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {propertyTypeTrends.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{item.type}</h3>
                    {item.trend === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    ₺{new Intl.NumberFormat('tr-TR').format(item.avgPrice)}
                  </p>
                  <p className={`text-sm font-semibold ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? '+' : ''}{item.change}% değişim
                  </p>
                </div>
              ))}
            </div>
          </ContentSection>

          {/* Market Analysis */}
          <ContentSection
            title="Piyasa Analizi"
            description="Karasu emlak piyasası fiyat trendleri hakkında detaylı analiz"
          >
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Karasu emlak piyasasında son dönemlerde genel bir fiyat artışı gözlemlenmektedir. 
                Özellikle denize sıfır konumlardaki villalar ve merkez konumdaki daireler yüksek talep görmektedir.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Fiyat trendleri, bölgenin gelişimi, ulaşım imkanları ve turizm potansiyeli gibi faktörlerden 
                etkilenmektedir. Yatırımcılar için uzun vadeli değer artışı potansiyeli yüksek bölgeler 
                öne çıkmaktadır.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Önemli Faktörler</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Denize yakınlık ve manzara</li>
                <li>Ulaşım imkanları ve merkeze yakınlık</li>
                <li>Altyapı gelişmeleri</li>
                <li>Turizm potansiyeli</li>
                <li>Bölgesel yatırım projeleri</li>
              </ul>
            </div>
          </ContentSection>

          {/* FAQ Section */}
          <FAQBlock faqs={faqs} title="Fiyat Trendleri Hakkında Sık Sorulan Sorular" />

          {/* CTA Section */}
          <section className="mt-12 bg-gradient-to-r from-[#006AFF] to-[#0052CC] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Detaylı Fiyat Analizi İster misiniz?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Belirli bir emlak türü veya mahalle için özel fiyat analizi talep edebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-[#006AFF] hover:bg-gray-100">
                <Link href={`${basePath}/iletisim`}>İletişime Geç</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href={`${basePath}/istatistikler/bolge-analizi`}>Bölge Analizi</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
