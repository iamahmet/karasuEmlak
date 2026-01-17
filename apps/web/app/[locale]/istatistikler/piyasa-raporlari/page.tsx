import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FileText, TrendingUp, Building2, MapPin, Calendar, BarChart3 } from 'lucide-react';
import { getListingStats } from '@/lib/supabase/queries';
import { getNeighborhoodStats } from '@/lib/supabase/queries/neighborhood-stats';
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
    ? '/istatistikler/piyasa-raporlari' 
    : `/${locale}/istatistikler/piyasa-raporlari`;

  return {
    title: 'Piyasa Raporları | Karasu Emlak | Detaylı Emlak Analizleri',
    description: 'Karasu emlak piyasası detaylı raporları ve analizleri. Fiyat trendleri, mahalle istatistikleri, emlak türü bazlı analizler ve yatırım fırsatları.',
    keywords: [
      'karasu emlak raporları',
      'karasu piyasa analizi',
      'karasu emlak istatistikleri',
      'karasu fiyat trendleri',
      'karasu emlak piyasası',
      'sakarya emlak raporları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/istatistikler/piyasa-raporlari`,
        'en': `${siteConfig.url}/en/istatistikler/piyasa-raporlari`,
        'et': `${siteConfig.url}/et/istatistikler/piyasa-raporlari`,
        'ru': `${siteConfig.url}/ru/istatistikler/piyasa-raporlari`,
        'ar': `${siteConfig.url}/ar/istatistikler/piyasa-raporlari`,
      },
    },
    openGraph: {
      title: 'Piyasa Raporları | Karasu Emlak',
      description: 'Karasu emlak piyasası detaylı raporları ve analizleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Piyasa Raporları',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Piyasa Raporları | Karasu Emlak',
      description: 'Karasu emlak piyasası detaylı raporları ve analizleri.',
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

export default async function PiyasaRaporlariPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'İstatistikler', href: `${basePath}/istatistikler` },
    { label: 'Piyasa Raporları', href: `${basePath}/istatistikler/piyasa-raporlari` },
  ];

  // Fetch statistics with timeout
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  const neighborhoodStatsResult = await withTimeout(getNeighborhoodStats(), 3000, []);
  
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
  const neighborhoodStats = neighborhoodStatsResult || [];

  const faqs = [
    {
      question: 'Piyasa raporları ne sıklıkla güncellenir?',
      answer: 'Piyasa raporlarımız aylık olarak güncellenir. Güncel veriler ve trend analizleri ile en doğru piyasa bilgilerini sunuyoruz.',
    },
    {
      question: 'Hangi veriler raporlarda yer alıyor?',
      answer: 'Raporlarımızda toplam ilan sayısı, satılık/kiralık dağılımı, emlak türü bazlı istatistikler, mahalle bazlı analizler ve fiyat trendleri yer almaktadır.',
    },
    {
      question: 'Raporları nasıl yorumlayabilirim?',
      answer: 'Raporlarımız görsel grafikler ve açıklayıcı metinlerle desteklenmiştir. Her bölüm için detaylı açıklamalar bulunmaktadır. Sorularınız için bizimle iletişime geçebilirsiniz.',
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
            title="Piyasa Raporları"
            description="Karasu emlak piyasası detaylı raporları ve analizleri. Güncel veriler, trend analizleri ve yatırım fırsatları hakkında kapsamlı bilgiler."
            stats={[
              { label: 'Toplam İlan', value: stats.total },
              { label: 'Satılık', value: stats.satilik },
              { label: 'Kiralık', value: stats.kiralik },
            ]}
          />

          {/* Market Overview */}
          <ContentSection
            title="Piyasa Genel Bakış"
            description="Karasu emlak piyasasının genel durumu ve temel göstergeler"
          >
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="h-8 w-8 text-[#006AFF]" />
                  <h3 className="text-xl font-semibold text-gray-900">Toplam İlan</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</p>
                <p className="text-sm text-gray-600">Aktif ilan sayısı</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Satılık</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.satilik}</p>
                <p className="text-sm text-gray-600">Satılık ilan sayısı</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Kiralık</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.kiralik}</p>
                <p className="text-sm text-gray-600">Kiralık ilan sayısı</p>
              </div>
            </div>
          </ContentSection>

          {/* Property Type Distribution */}
          {Object.keys(stats.byType).length > 0 && (
            <ContentSection
              title="Emlak Türü Dağılımı"
              description="Emlak türlerine göre ilan dağılımı"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900 capitalize">{type}</span>
                      <span className="text-2xl font-bold text-[#006AFF]">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Neighborhood Statistics */}
          {neighborhoodStats.length > 0 && (
            <ContentSection
              title="Mahalle Bazlı İstatistikler"
              description="En aktif mahalleler ve ortalama fiyatlar"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {neighborhoodStats.slice(0, 9).map((neighborhood) => (
                  <div key={neighborhood.name} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#006AFF] hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{neighborhood.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Toplam İlan:</span>
                        <span className="font-semibold text-gray-900">{neighborhood.totalListings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Satılık:</span>
                        <span className="font-semibold text-green-600">{neighborhood.satilikCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kiralık:</span>
                        <span className="font-semibold text-purple-600">{neighborhood.kiralikCount}</span>
                      </div>
                      {neighborhood.avgPrice > 0 && (
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Ort. Fiyat:</span>
                          <span className="font-semibold text-[#006AFF]">
                            ₺{new Intl.NumberFormat('tr-TR').format(neighborhood.avgPrice)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href={`${basePath}/mahalle/${encodeURIComponent(neighborhood.name.toLowerCase().replace(/\s+/g, '-'))}`}>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Mahalle Detayları
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Market Insights */}
          <ContentSection
            title="Piyasa İçgörüleri"
            description="Karasu emlak piyasası hakkında önemli bilgiler"
          >
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Karasu emlak piyasası, denize sıfır konumu ve doğal güzellikleri ile sürekli gelişen bir bölgedir. 
                Özellikle yazlık konut ve denize yakın villalar yüksek talep görmektedir.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Piyasa raporlarımız, güncel veriler ve trend analizleri ile yatırımcılara ve emlak alıcılarına 
                rehberlik etmektedir. Düzenli olarak güncellenen raporlarımız ile piyasa hakkında en güncel 
                bilgilere ulaşabilirsiniz.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Mahalle bazlı detaylı istatistikler</li>
                <li>Emlak türü bazlı fiyat analizleri</li>
                <li>Piyasa trendleri ve gelecek projeksiyonları</li>
                <li>Yatırım fırsatları ve risk analizleri</li>
              </ul>
            </div>
          </ContentSection>

          {/* FAQ Section */}
          <FAQBlock faqs={faqs} title="Piyasa Raporları Hakkında Sık Sorulan Sorular" />

          {/* CTA Section */}
          <section className="mt-12 bg-gradient-to-r from-[#006AFF] to-[#0052CC] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Detaylı Analiz İster misiniz?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Özel piyasa analizi ve yatırım danışmanlığı için bizimle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-[#006AFF] hover:bg-gray-100">
                <Link href={`${basePath}/iletisim`}>İletişime Geç</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href={`${basePath}/istatistikler/fiyat-trendleri`}>Fiyat Trendleri</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
